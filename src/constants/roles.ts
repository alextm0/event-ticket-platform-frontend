import type { AppRole } from "@/lib/user-profile";

type RoleConfig = {
  destination: string;
  label: string;
  pages: Array<{ href: string; label: string }>;
};

export const ROLE_CONFIG: Record<AppRole, RoleConfig> = {
  admin: {
    destination: "/admin",
    label: "Admin Dashboard",
    pages: [{ href: "/admin", label: "Admin Dashboard" }],
  },
  organizer: {
    destination: "/organizer",
    label: "Organizer Workspace",
    pages: [{ href: "/organizer", label: "Organizer Dashboard" }],
  },
  staff: {
    destination: "/staff",
    label: "Staff Workspace",
    pages: [{ href: "/staff", label: "Staff Dashboard" }],
  },
  attendee: {
    destination: "/my-tickets",
    label: "Attendee Workspace",
    pages: [{ href: "/my-tickets", label: "My Tickets" }],
  },
};

export const ROLE_DESTINATIONS: Record<AppRole, string> = Object.fromEntries(
  (Object.entries(ROLE_CONFIG) as [AppRole, RoleConfig][]).map(([role, config]) => [
    role,
    config.destination,
  ]),
) as Record<AppRole, string>;

export const ROLE_LABELS: Record<AppRole, string> = Object.fromEntries(
  (Object.entries(ROLE_CONFIG) as [AppRole, RoleConfig][]).map(([role, config]) => [
    role,
    config.label,
  ]),
) as Record<AppRole, string>;

export const ROLE_PAGES: Record<AppRole, Array<{ href: string; label: string }>> =
  Object.fromEntries(
    (Object.entries(ROLE_CONFIG) as [AppRole, RoleConfig][]).map(([role, config]) => [
      role,
      config.pages,
    ]),
  ) as Record<AppRole, Array<{ href: string; label: string }>>;

export const ONBOARDING_ALLOWED_ROLES: AppRole[] = ["attendee", "organizer", "staff"];

