import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import type { AppRole } from "./user-profile";
import ROLE_DESTINATIONS from "@/utils/role-destinations";

const VALID_ROLES = ["admin", "organizer", "staff", "attendee"];

interface RequireRoleOptions {
  allowGrant?: boolean;
}

interface FetchAuthContextOptions {
  allowGrant?: boolean;
  desiredRole?: AppRole;
}

// Simple session check - replace with actual backend session validation
async function getSessionRole(): Promise<AppRole | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  if (!token) return null; // Must have token to have a role

  const role = cookieStore.get("userRole")?.value;
  if (role && VALID_ROLES.includes(role)) {
    return role as AppRole;
  }
  return null;
}

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  return !!token;
}

/**
 * Require a specific role for a page/route
 */
export async function requireRole<Role extends AppRole>(
  allowedRole: Role,
  options: RequireRoleOptions = {},
) {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/sign-in");
  }

  const userRole = await getSessionRole();

  if (!userRole || userRole !== allowedRole) {
    redirect("/");
  }

  return { role: userRole };
}

/**
 * Require authentication (any role)
 */
export async function requireAuth() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/sign-in");
  }

  const userRole = await getSessionRole();
  return { role: userRole };
}

/**
 * Fetch auth context for the current user
 * Used primarily for onboarding flow
 */
export async function fetchAuthContext(options: FetchAuthContextOptions = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  const roleValue = cookieStore.get("userRole")?.value;
  const role =
    roleValue && VALID_ROLES.includes(roleValue)
      ? (roleValue as AppRole)
      : undefined;
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

/**
 * Resolve the dashboard destination for a given role
 */
export function resolveRoleDestination(role: AppRole | null | undefined): string | null {
  if (!role) {
    return null;
  }
  return ROLE_DESTINATIONS[role] ?? null;
}

/**
 * Redirect to the appropriate dashboard based on user role
 */
export function redirectToRoleDashboard(role: AppRole | null | undefined) {
  const destination = resolveRoleDestination(role);
  if (destination) {
    redirect(destination);
  } else {
    redirect("/");
  }
}
