"use server";

import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { ONBOARDING_ALLOWED_ROLES } from "@/constants/app-roles";
import { ensureAppProfile, type AppRole } from "@/lib/user-profile";
import ROLE_DESTINATIONS from "@/utils/role-destinations";
import { stackServerApp } from "@/stack/server";

export interface CompleteOnboardingState {
  error?: string;
}

function isAllowedRole(value: string): value is AppRole {
  return (ONBOARDING_ALLOWED_ROLES as readonly string[]).includes(value);
}

export async function completeOnboarding(
  _prevState: CompleteOnboardingState,
  formData: FormData,
): Promise<CompleteOnboardingState | void> {
  const rawRole = formData.get("role");
  if (typeof rawRole !== "string") {
    return { error: "Please select a valid role to continue." };
  }
  if (!isAllowedRole(rawRole)) {
    return { error: "Please select a valid role to continue." };
  }

  const user = await stackServerApp.getUser({ or: "redirect" });

  try {
    const { profile } = await ensureAppProfile(user, {
      desiredRole: rawRole,
    });

    if (!profile) {
      return { error: "We could not finalize onboarding. Please try again." };
    }

    const destination = ROLE_DESTINATIONS[profile.role] ?? "/";
    redirect(destination);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error("Failed to complete onboarding", error);
    return { error: "We could not finalize onboarding. Please try again." };
  }
}
