import Link from "next/link";

import { requireRole } from "@/lib/auth-guards";

export default async function AttendeePage() {
  await requireRole("attendee", { allowGrant: false });

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 text-slate-300">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Attendee workspace</h1>
        <p className="mt-2 text-slate-400">
          Access is granted because you have the <span className="font-medium">attendee</span> role.
        </p>
      </div>

      <section className="rounded-lg border border-slate-800 bg-slate-900 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-100">Browse published events</h2>
        <p className="text-sm text-slate-400">
          Discover upcoming events that organizers have published and view their full details.
        </p>
        <div className="mt-4">
          <Link
            href="/browse-events"
            className="inline-flex items-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
          >
            Browse events
          </Link>
        </div>
      </section>

      <Link href="/" className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300">
        <span aria-hidden="true">&lt;-</span> Back to home
      </Link>
    </div>
  );
}
