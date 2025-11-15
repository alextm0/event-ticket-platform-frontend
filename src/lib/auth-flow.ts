import { redirect } from "next/navigation";

import { ensureAppProfile, type AppRole } from "./user-profile";
import ROLE_DESTINATIONS from "@/utils/role-destinations";
import { stackServerApp } from "@/stack/server";

interface FetchAuthContextOptions {
  allowGrant?: boolean;
  desiredRole?: AppRole;
}

export async function fetchAuthContext(options: FetchAuthContextOptions = {}) {
  const user = await stackServerApp.getUser({ or: "redirect" });
  const { profile, needsOnboarding } = await ensureAppProfile(user, {
    allowGrant: options.allowGrant,
    desiredRole: options.desiredRole,
  });

  return { user, profile, needsOnboarding };
}

export function resolveRoleDestination(role: AppRole | null | undefined) {
  if (!role) {
    return null;
  }
  return ROLE_DESTINATIONS[role] ?? null;
}

export function redirectToRoleDashboard(role: AppRole | null | undefined) {
  const destination = resolveRoleDestination(role);
  if (destination) {
    redirect(destination);
  }
}
