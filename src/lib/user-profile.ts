/**
 * User profile type definitions
 */

export type AppRole = "organizer" | "staff" | "attendee" | "admin";

export interface AppUserProfile {
  appUserId: string;
  role: AppRole;
  email?: string;
  fullName?: string;
}
