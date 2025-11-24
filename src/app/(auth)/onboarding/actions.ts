"use server";

import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { cookies } from "next/headers";

import { ONBOARDING_ALLOWED_ROLES } from "@/constants/app-roles";
import type { AppRole } from "@/lib/user-profile";
import ROLE_DESTINATIONS from "@/utils/role-destinations";

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

  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const email = cookieStore.get("userEmail")?.value;

  if (!userId || !email) {
    return { error: "Please sign in first." };
  }

  try {
    // Set the role in cookies
    cookieStore.set("userRole", rawRole, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    // TODO: Call backend API to update user role
    // await updateUserRole(userId, rawRole);

    const destination = ROLE_DESTINATIONS[rawRole] ?? "/";
    redirect(destination);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error("Failed to complete onboarding", error);
    return { error: "We could not finalize onboarding. Please try again." };
  }
}
