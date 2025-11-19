'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { AppRole } from "@/lib/user-profile";
import { SESSION_UPDATED_EVENT } from "@/lib/session-events";

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
          localStorage.setItem('userRole', data.role?.toLowerCase() || role);
          window.dispatchEvent(new Event(SESSION_UPDATED_EVENT));
        }
        
        router.push("/");
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
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-6 text-center text-slate-300">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-100">Sign up is disabled</h1>
          <p className="text-sm text-slate-400">
            New user registration is currently not available.
          </p>
        </div>
        <Link
          href="/sign-in"
          className="rounded bg-sky-500 px-4 py-2 font-medium text-slate-900 hover:bg-sky-400"
        >
          Sign in instead
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-6 text-center text-slate-300">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-100">Create your account</h1>
        <p className="text-sm text-slate-400">
          Sign up to join the event ticketing platform.
        </p>
      </div>

      <div className="w-full rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              <div className="font-medium">{error}</div>
              {errorDetails.length > 0 && (
                <ul className="mt-2 list-disc list-inside space-y-1 text-xs">
                  {errorDetails.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-300">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="block text-sm font-medium text-slate-300">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as AppRole)}
              required
              className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value} className="bg-slate-800">
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-sky-500 px-4 py-2 font-medium text-slate-900 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>
      </div>

      <p className="text-sm text-slate-400">
        Already registered?{" "}
        <Link href="/sign-in" className="font-medium text-sky-400 hover:text-sky-300">
          Sign in instead
        </Link>
      </p>
    </div>
  );
}
