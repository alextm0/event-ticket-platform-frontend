import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import type { AppRole } from "./user-profile";

interface RequireRoleOptions {
  allowGrant?: boolean;
}

// Simple session check - replace with actual backend session validation
async function getSessionRole(): Promise<AppRole | null> {
  const cookieStore = await cookies();
  const role = cookieStore.get("userRole")?.value;
  if (role && ["admin", "organizer", "staff", "attendee"].includes(role)) {
    return role as AppRole;
  }
  return null;
}

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  return !!token;
}

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

export async function requireAuth() {
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    redirect("/sign-in");
  }

  const userRole = await getSessionRole();
  return { role: userRole };
}
