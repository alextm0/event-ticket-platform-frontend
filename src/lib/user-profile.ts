import { createHash } from "crypto";

import type { CurrentServerUser } from "@stackframe/stack";

import { createBackendUser } from "./backend-client";

const ROLE_PERMISSIONS: Record<AppRole, string> = {
  organizer: "role:organizer",
  staff: "role:staff",
  attendee: "role:attendee",
  admin: "role:admin",
};

export type AppRole = "organizer" | "staff" | "attendee" | "admin";

export interface AppUserProfile {
  appUserId: string;
  role: AppRole;
}

interface EnsureProfileOptions {
  desiredRole?: AppRole;
  allowGrant?: boolean;
}

export interface EnsureProfileResult {
  profile: AppUserProfile | null;
  needsOnboarding: boolean;
}

export async function ensureAppProfile(
  user: CurrentServerUser,
  options: EnsureProfileOptions = {},
): Promise<EnsureProfileResult> {
  const permissions = await user.listPermissions();
  const permissionRole = inferRoleFromPermissions(permissions);
  const metadata = (user.serverMetadata ?? {}) as Partial<AppUserProfile>;
  const clientMetadata = (user.clientReadOnlyMetadata ?? {}) as Partial<AppUserProfile>;

  const role =
    options.desiredRole ?? permissionRole ?? metadata.role ?? inferRoleFromMetadata(metadata);

  if (!role) {
    return { profile: null, needsOnboarding: true };
  }

  const targetPermission = ROLE_PERMISSIONS[role];
  const hasPermission = permissions.some((p) => p.id === targetPermission);

  if (!hasPermission && options.allowGrant !== false && role !== "admin") {
    await user.grantPermission(targetPermission);
  }

  const derivedId = deriveDeterministicUuid(user.id);
  const appUserId =
    metadata.appUserId && isValidUuid(metadata.appUserId) ? metadata.appUserId : derivedId;

  const normalizedMetadata: AppUserProfile = {
    appUserId,
    role,
  };

  const serverMetadataChanged =
    metadata.appUserId !== normalizedMetadata.appUserId ||
    metadata.role !== normalizedMetadata.role;
  if (serverMetadataChanged) {
    await user.setServerMetadata(normalizedMetadata);
  }

  const clientMetadataChanged =
    clientMetadata.appUserId !== normalizedMetadata.appUserId ||
    clientMetadata.role !== normalizedMetadata.role;
  if (clientMetadataChanged) {
    await user.setClientReadOnlyMetadata(normalizedMetadata);
  }

  const email = user.primaryEmail;
  if (!email) {
    throw new Error("Stack Auth user is missing an email address.");
  }

  await createBackendUser(user, {
    id: normalizedMetadata.appUserId,
    email,
    fullName: user.displayName ?? email,
    role: normalizedMetadata.role,
    password: deriveDeterministicUuid(user.id),
  });

  return { profile: normalizedMetadata, needsOnboarding: false };
}

function inferRoleFromPermissions(permissions: Awaited<ReturnType<CurrentServerUser["listPermissions"]>>): AppRole | null {
  if (permissions.some((p) => p.id === ROLE_PERMISSIONS.admin)) {
    return "admin";
  }
  if (permissions.some((p) => p.id === ROLE_PERMISSIONS.organizer)) {
    return "organizer";
  }
  if (permissions.some((p) => p.id === ROLE_PERMISSIONS.staff)) {
    return "staff";
  }
  if (permissions.some((p) => p.id === ROLE_PERMISSIONS.attendee)) {
    return "attendee";
  }
  return null;
}

function inferRoleFromMetadata(metadata: Partial<AppUserProfile>): AppRole | null {
  if (!metadata.role) {
    return null;
  }
  return metadata.role;
}

export function deriveDeterministicUuid(input: string): string {
  const hex = createHash("sha256").update(input).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}


