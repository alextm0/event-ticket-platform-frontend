import { OnboardingForm } from "./OnboardingForm";
import { fetchAuthContext, redirectToRoleDashboard } from "@/lib/auth-flow";

export default async function OnboardingPage() {
  const { user, profile, needsOnboarding } = await fetchAuthContext({ allowGrant: false });

  if (!needsOnboarding && profile?.role) {
    redirectToRoleDashboard(profile.role);
  }

  const email = user?.email ?? "your account";

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center gap-6 text-slate-300">
      <div className="space-y-2 text-center">
        <p className="text-sm uppercase tracking-wide text-sky-300">Onboarding</p>
        <h1 className="text-3xl font-semibold text-slate-100">Choose how you'll use the platform</h1>
        <p className="text-sm text-slate-400">
          Your account ({email}) is ready. Select the workspace role you need so we
          can provision permissions and sync your profile to the backend API.
        </p>
      </div>

      <OnboardingForm />
    </div>
  );
}
