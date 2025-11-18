import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import type { AppRole } from "./user-profile";
import ROLE_DESTINATIONS from "@/utils/role-destinations";

interface FetchAuthContextOptions {
  allowGrant?: boolean;
  desiredRole?: AppRole;
}

// Simple session-based auth context - replace with actual backend integration
export async function fetchAuthContext(options: FetchAuthContextOptions = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  const role = cookieStore.get("userRole")?.value as AppRole | undefined;
  const userId = cookieStore.get("userId")?.value;

  if (!token || !role || !userId) {
    return {
      user: null,
      profile: null,
      needsOnboarding: true,
    };
  }

  const profile = {
    appUserId: userId,
    role: role,
  };

  return {
    user: { id: userId, email: cookieStore.get("userEmail")?.value || "" },
    profile,
    needsOnboarding: false,
  };
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
