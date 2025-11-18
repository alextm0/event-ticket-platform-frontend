import { redirect } from "next/navigation";

import { fetchAuthContext, redirectToRoleDashboard } from "@/lib/auth-flow";

export default async function Home() {
  const { profile, needsOnboarding } = await fetchAuthContext({ allowGrant: false });

  // In bypass mode, profile will always exist, so this check is mainly for non-bypass
  if (needsOnboarding || !profile) {
    // In bypass mode, this won't happen, but keep for safety
    redirect("/sign-in");
  }

  // Redirect to role dashboard
  redirectToRoleDashboard(profile?.role ?? null);

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
