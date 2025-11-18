// Simplified user profile types - remove Stack Auth dependencies

export type AppRole = "organizer" | "staff" | "attendee" | "admin";

export interface AppUserProfile {
  appUserId: string;
  role: AppRole;
  email?: string;
  fullName?: string;
}

// Simple helper functions - replace with actual backend calls
export function deriveDeterministicUuid(input: string): string {
  // Simple hash-based UUID generation
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex.slice(0, 8)}-${hex.slice(0, 4)}-${hex.slice(0, 4)}-${hex.slice(0, 4)}-${hex.slice(0, 12)}`;
}

export function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
