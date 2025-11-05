import Link from "next/link";

import { requireRole } from "@/lib/auth-guards";

export default async function AttendeePage() {
  await requireRole("attendee", { allowGrant: false });

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 text-slate-300">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Attendee workspace</h1>
        <p className="mt-2 text-slate-400">
          Access is granted because you have the <span className="font-medium">attendee</span> role in Stack Auth.
        </p>
      </div>

      <section className="rounded-lg border border-slate-800 bg-slate-900 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-100">Upcoming features</h2>
        <p className="text-sm text-slate-400">
          This page will eventually let you redeem invitations, manage tickets, and view event updates.
        </p>
        <p className="mt-3 text-sm text-slate-500">
          Until your backend is ready, the auth layer keeps this space restricted to users with{" "}
          <span className="font-medium">role:attendee</span>. Replace this card with your real attendee
          experience when the APIs are available.
        </p>
      </section>

      <Link href="/" className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300">
        <span aria-hidden="true">&lt;-</span> Back to home
      </Link>
    </div>
  );
}
