'use client';

import Link from "next/link";

import { SignUp } from "@stackframe/stack";

export default function SignUpPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-6 text-center text-slate-300">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-100">Create your account</h1>
        <p className="text-sm text-slate-400">
          Complete sign-up with Stack Auth to join the event ticketing platform.
        </p>
      </div>

      <div className="w-full rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-sm">
        <SignUp />
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
