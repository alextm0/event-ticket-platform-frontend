'use client';

import Link from "next/link";

import { SignIn } from "@stackframe/stack";

export default function SignInPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-6 text-center text-slate-300">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-100">Sign in to continue</h1>
        <p className="text-sm text-slate-400">
          Use your Stack Auth credentials to access the event ticketing platform.
        </p>
      </div>

      <div className="w-full rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-sm">
        <SignIn />
      </div>

      <p className="text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-medium text-sky-400 hover:text-sky-300">
          Create one
        </Link>
      </p>
    </div>
  );
}
