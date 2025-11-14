  import { redirect } from "next/navigation";

import { ensureAppProfile } from "@/lib/user-profile";
import { stackServerApp } from "@/stack/server";
import ROLE_DESTINATIONS from "@/utils/role-destinations";

export default async function Home() {
  const user = await stackServerApp.getUser({ or: "redirect" });
  const { profile, needsOnboarding } = await ensureAppProfile(user, { allowGrant: false });

  if (needsOnboarding || !profile) {
    redirect("/onboarding");
  }

  const role = profile?.role ?? null;
  if (role) {
    const destination = ROLE_DESTINATIONS[role];
    if (destination) {
      redirect(destination);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center gap-6 px-4 text-center text-slate-300">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate-100">No destination configured</h1>
        <p className="text-sm text-slate-400">
          Your current role does not have an associated dashboard. Contact an administrator if you believe
          this is a mistake.
        </p>
      </div>
    </div>
  );
}
