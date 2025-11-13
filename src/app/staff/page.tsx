import Link from "next/link";

import { requireRole } from "@/lib/auth-guards";

export default async function StaffPage() {
  await requireRole("staff", { allowGrant: false });

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 text-slate-300">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Staff workspace</h1>
        <p className="mt-2 text-slate-400">
          You can access this area because you hold the <span className="font-medium">staff</span> role in Stack Auth.
        </p>
      </div>

      <section className="space-y-3 rounded-lg border border-slate-800 bg-slate-900 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-100">Event operations</h2>
        <div className="mt-4">
          <Link
            href="/staff/scan"
            className="inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 transition-colors"
          >
            Scan Tickets
          </Link>
        </div>
      </section>

      <Link href="/" className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300">
        <span aria-hidden="true">&lt;-</span> Back to home
      </Link>
    </div>
  );
}
