'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { AppRole } from "@/lib/user-profile";
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

const ROLES: { value: AppRole; label: string }[] = [
  { value: "organizer", label: "Organizer" },
  { value: "staff", label: "Staff" },
  { value: "attendee", label: "Attendee" },
];

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<AppRole>("attendee");
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [signupEnabled, setSignupEnabled] = useState(true);

  useEffect(() => {
    // Check if signup is enabled
    fetch("/api/auth/signupStatus")
      .then((res) => res.json())
      .then((data) => setSignupEnabled(data.enabled ?? true))
      .catch(() => setSignupEnabled(true)); // Default to enabled if check fails
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrorDetails([]);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          role: role.toUpperCase()
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Store session in localStorage for client-side checks
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', data.token || 'mock-token');
          localStorage.setItem('userId', data.userId || data.id || email.split('@')[0] || 'user');
          localStorage.setItem('userEmail', data.email || email);
          const userRole = data.role?.toLowerCase() || role;
          localStorage.setItem('userRole', userRole);
          window.dispatchEvent(new Event(SESSION_UPDATED_EVENT));
        }

        // Redirect to dashboard based on role
        const userRole = data.role?.toLowerCase() || role;
        const dashboardPath = ROLE_DESTINATIONS[userRole];
        router.push(dashboardPath || "/");
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

          if (response.status === 409) {
            // Conflict - typically email already exists
            message = backendMessage ?? title ?? "This email is already registered";
          } else if (response.status === 400) {
            // Bad request - validation errors
            message = backendMessage ?? title ?? "Invalid input. Please check your information.";
          } else {
            message = backendMessage ?? title ?? message;
          }
        } catch (err) {
          console.error("Failed to parse signup error", err);
        }
        setError(message);
        setErrorDetails(details);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!signupEnabled) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-sm mx-auto text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white">Sign up disabled</h1>
        <p className="text-sm text-slate-400">
          New user registration is currently not available.
        </p>
        <Button asChild className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold">
          <Link href="/sign-in">Sign in instead</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-white">Create an account</h1>
        <p className="text-sm text-slate-400">
          Enter your details below to create your account
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
          <Label htmlFor="fullName" className="text-slate-300">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="bg-slate-900/50 border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
          />
        </div>

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
            minLength={8}
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
          {loading ? "Creating account..." : "Sign up"}
        </Button>
      </form>

      <div className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
          Sign in
        </Link>
      </div>
    </div>
  );
}
