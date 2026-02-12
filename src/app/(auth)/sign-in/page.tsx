'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SESSION_UPDATED_EVENT } from "@/lib/session-events";
import { ROLE_DESTINATIONS } from "@/constants/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const next = searchParams?.get("next");
  const sessionExpired = searchParams?.get("session_expired") === "1";

  useEffect(() => {
    if (sessionExpired) {
      fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    }
  }, [sessionExpired]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrorDetails([]);
    setLoading(true);

    try {
      // Use Next.js API route to avoid CORS issues
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();

        // Store session in localStorage for client-side checks
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', data.token || 'mock-token');
          localStorage.setItem('userId', data.userId || email.split('@')[0] || 'user');
          localStorage.setItem('userEmail', data.email || email);

          // Role is optional in the system. Only set it if explicitly provided.
          // This matches server-side behavior where role can be undefined.
          if (data.role) {
            localStorage.setItem('userRole', data.role.toLowerCase());
          } else {
            localStorage.removeItem('userRole');
          }
          window.dispatchEvent(new Event(SESSION_UPDATED_EVENT));
        }

        // Redirect to the specified next page, or to role-based dashboard, or to onboarding if no role
        if (next) {
          router.push(next);
        } else if (data.role) {
          const role = data.role.toLowerCase() as keyof typeof ROLE_DESTINATIONS;
          const dashboardPath = ROLE_DESTINATIONS[role];
          router.push(dashboardPath || "/onboarding");
        } else {
          // No role yet - redirect to onboarding
          router.push("/onboarding");
        }
      } else {
        let message = "Unexpected error, please try again later.";
        let details: string[] = [];
        try {
          const data = await response.json();
          const title = data?.title;
          const backendMessage = data?.detail ?? data?.message;
          if (Array.isArray(data?.errors)) {
            details = data.errors
              .map((err: unknown) => {
                if (typeof err === "string") return err;
                if (err && typeof err === "object" && "message" in err && typeof err.message === "string") {
                  return err.message;
                }
                return JSON.stringify(err);
              })
              .filter((msg: string) => msg.length > 0);
          }

          if (response.status === 401) {
            message = backendMessage ?? "Invalid email or password";
          } else {
            message = backendMessage ?? message;
          }
        } catch (err) {
          console.error("Failed to parse login error", err);
        }
        setError(message);
        setErrorDetails(details);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
        <p className="text-sm text-slate-400">
          Enter your credentials to access your account
        </p>
      </div>

      {sessionExpired && (
        <div className="rounded-md bg-amber-500/10 p-3 text-sm text-amber-200 border border-amber-500/20">
          Your session has expired. Please sign in again.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
            <p className="font-medium">{error}</p>
            {errorDetails.length > 0 && (
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs opacity-90">
                {errorDetails.map((detail, index) => (
                  <li key={`${detail}-${index}`}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-300">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-slate-900/50 border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-300">Password</Label>


          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-slate-900/50 border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form >

      <div className="text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
          Sign up
        </Link>
      </div>
    </div >
  );
}
