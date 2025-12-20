'use client';

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AppRole } from "@/lib/user-profile";
import { SESSION_UPDATED_EVENT } from "@/lib/session-events";

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

const ROLES: { value: AppRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "organizer", label: "Organizer" },
  { value: "staff", label: "Staff" },
  { value: "attendee", label: "Attendee" },
];

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AppRole>("attendee");
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const next = searchParams?.get("next");

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
        body: JSON.stringify({ email, password, role }),
      });

      if (response.ok) {
        const data = await response.json();

        // Store session in localStorage for client-side checks
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', data.token || 'mock-token');
          localStorage.setItem('userId', data.userId || email.split('@')[0] || 'user');
          localStorage.setItem('userEmail', data.email || email);
          localStorage.setItem('userRole', data.role?.toLowerCase() || role);
          window.dispatchEvent(new Event(SESSION_UPDATED_EVENT));
        }

        router.push(next || "/");
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
            if (title === "Invalid credentials") {
              message = backendMessage ?? "Invalid email or password";
            } else if (title === "Invalid role") {
              message =
                backendMessage ??
                "Invalid role. Please choose the correct role for this account.";
            } else {
              message = backendMessage ?? "Invalid email or password";
            }
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-slate-300">Password</Label>
            <a
              href="#"
              className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
            >
              Forgot password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-slate-900/50 border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-slate-300">Role</Label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as AppRole)}
            required
            className="flex h-10 w-full items-center justify-between rounded-md border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value} className="bg-slate-900">
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <Button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
          Sign up
        </Link>
      </div>
    </div>
  );
}
