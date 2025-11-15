import { redirect } from "next/navigation";

import type { AppRole } from "./user-profile";
import { fetchAuthContext } from "./auth-flow";

interface RequireRoleOptions {
  allowGrant?: boolean;
}

export async function requireRole<Role extends AppRole>(
  allowedRole: Role,
  options: RequireRoleOptions = {},
) {
  const { user, profile, needsOnboarding } = await fetchAuthContext({
    allowGrant: options.allowGrant,
  });

  if (needsOnboarding || !profile) {
    redirect("/onboarding");
  }
  if (profile.role !== allowedRole) {
    redirect("/");
  }

  return { user, profile };
}
