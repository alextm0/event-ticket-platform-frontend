import Link from "next/link";

import { requireRole } from "@/lib/auth-guards";

export default async function AdminPage() {
  await requireRole("admin", { allowGrant: false });

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 text-slate-300">
      <div>
        <h1 className="text-3xl font-semibold text-slate-100">Admin dashboard</h1>
        <p className="mt-2 text-sm text-slate-400">
          You are signed in with <span className="font-medium">role:admin</span>. Use this area to
          add reporting, user management, or configuration tools once your backend is ready.
        </p>
      </div>

      <section className="space-y-3 rounded-lg border border-slate-800 bg-slate-900 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-100">Getting started</h2>
        <ul className="space-y-2 text-sm text-slate-400">
          <li>
            Create a read-only overview of organizers, staff, and attendees by wiring this page to
            your future API.
          </li>
          <li>
            Gate any sensitive settings behind the existing role checks so only admins
            can access them.
          </li>
        </ul>
      </section>

      <Link href="/" className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300">
        <span aria-hidden="true">&lt;-</span> Back to home
      </Link>
    </div>
  );
}
