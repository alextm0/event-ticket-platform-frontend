import Link from "next/link";
import { redirect } from "next/navigation";

import { ensureAppProfile } from "@/lib/user-profile";
import { stackServerApp } from "@/stack/server";

export default async function OrganizerPage() {
  const user = await stackServerApp.getUser({ or: "redirect" });

  const { profile, needsOnboarding } = await ensureAppProfile(user, { allowGrant: false });
  if (needsOnboarding || !profile) {
    redirect("/onboarding");
  }
  if (profile.role !== "organizer") {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 text-slate-300">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Organizer workspace</h1>
        <p className="mt-2 text-slate-400">
          You can access this area because you hold the <span className="font-medium">organizer</span> role in Stack Auth.
        </p>
      </div>

      <section className="rounded-lg border border-slate-800 bg-slate-900 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-100">Event planning toolkit</h2>
        <p className="text-sm text-slate-400">
          This area is ready for features like invitation management, ticket allocation, and schedule
          publishing once your backend services are available.
        </p>
        <p className="mt-3 text-sm text-slate-500">
          Use this page to wire up the organizer flows after you expose the necessary APIs. The auth layer
          already ensures only users with <span className="font-medium">role:organizer</span> can access it.
        </p>
      </section>

      <Link href="/" className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300">
        <span aria-hidden="true">&lt;-</span> Back to home
      </Link>
    </div>
  );
}
