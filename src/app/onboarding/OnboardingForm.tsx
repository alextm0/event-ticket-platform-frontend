"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { ONBOARDING_ALLOWED_ROLES } from "@/constants/app-roles";
import type { AppRole } from "@/lib/user-profile";
import { completeOnboarding, type CompleteOnboardingState } from "./actions";

const initialState: CompleteOnboardingState = {};

const ROLE_COPY: Record<AppRole, { title: string; description: string }> = {
  attendee: {
    title: "Attendee",
    description: "Browse upcoming events, manage tickets, and access QR codes.",
  },
  organizer: {
    title: "Organizer",
    description: "Publish events, manage inventory, and monitor attendee activity.",
  },
  staff: {
    title: "Staff",
    description: "Validate tickets on-site and monitor entry flow.",
  },
  admin: {
    title: "Admin",
    description: "Reserved for platform maintainers via Stack Auth.",
  },
};

export function OnboardingForm() {
  const [state, formAction] = useActionState(completeOnboarding, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-3 md:grid-cols-3">
        {ONBOARDING_ALLOWED_ROLES.map((role) => {
          const copy = ROLE_COPY[role];
          return (
            <label
              key={role}
              className="group flex cursor-pointer flex-col rounded-xl border border-slate-800 bg-slate-900/70 p-4 transition hover:border-slate-700 focus-within:ring-2 focus-within:ring-sky-500"
            >
              <input
                type="radio"
                name="role"
                value={role}
                className="peer sr-only"
                required
              />
              <span className="text-base font-semibold capitalize text-slate-100 peer-checked:text-sky-50">
                {copy.title}
              </span>
              <span className="mt-1 text-sm text-slate-400 peer-checked:text-slate-200">
                {copy.description}
              </span>
              <span className="mt-3 text-xs uppercase tracking-wide text-slate-500 peer-checked:text-sky-300">
                Choose {copy.title.toLowerCase()}
              </span>
            </label>
          );
        })}
      </div>

      {state?.error ? (
        <p className="rounded border border-rose-600/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Saving..." : "Continue"}
    </button>
  );
}
