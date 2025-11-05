import { redirect } from "next/navigation";

import { ensureAppProfile } from "@/lib/user-profile";
import { stackServerApp } from "@/stack/server";

const ROLE_DESTINATIONS: Record<string, string> = {
  admin: "/admin",
  organizer: "/organizer",
  staff: "/staff",
  attendee: "/attendee",
};

export default async function Home() {
  const user = await stackServerApp.getUser({ or: "redirect" });
  const { profile, needsOnboarding } = await ensureAppProfile(user, { allowGrant: false });

  if (needsOnboarding) {
    redirect("/onboarding");
  }

  const role = profile?.role ?? null;
  if (role) {
    const destination = ROLE_DESTINATIONS[role];
    if (destination) {
      redirect(destination);
    }
  }

  redirect("/onboarding");
}
