import { redirect } from "next/navigation";

import type { AppRole } from "./user-profile";
import { ensureAppProfile } from "./user-profile";
import { stackServerApp } from "@/stack/server";

interface RequireRoleOptions {
  allowGrant?: boolean;
}

export async function requireRole<Role extends AppRole>(
  allowedRole: Role,
  options: RequireRoleOptions = {},
) {
  const user = await stackServerApp.getUser({ or: "redirect" });
  const { profile, needsOnboarding } = await ensureAppProfile(user, {
    allowGrant: options.allowGrant,
  });

  if (needsOnboarding || !profile) {
    redirect("/");
  }
  if (profile.role !== allowedRole) {
    redirect("/");
  }

  return { user, profile };
}
