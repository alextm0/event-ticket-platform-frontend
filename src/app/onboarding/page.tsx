import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { fetchAuthContext, redirectToRoleDashboard } from "@/lib/auth-guards";


export default async function OnboardingPage() {
  const { user, profile, needsOnboarding } = await fetchAuthContext({ allowGrant: false });

  if (!needsOnboarding && profile?.role) {
    redirectToRoleDashboard(profile.role);
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-5xl flex-col justify-center gap-12 px-6 py-12 text-center lg:px-8">
      <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-primary)]">
          Welcome on board
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-white lg:text-5xl">
          Choose how you&apos;ll use the platform
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-[var(--color-secondary)]">
          You&apos;re almost there! Select a role to customize your experience and complete your profile setup.
        </p>
      </div>

      <OnboardingForm />
    </div>
  );
}
