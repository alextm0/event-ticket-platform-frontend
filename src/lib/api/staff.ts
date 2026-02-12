import { createAuthHeaders, getBackendUrl } from "./http";
import type { StaffAssignedEvent, StaffMember } from "@/types";

export type { StaffAssignedEvent, StaffMember };

export async function getStaffAssignedEvents(staffId: string): Promise<StaffAssignedEvent[]> {
  const headers = await createAuthHeaders();
  const response = await fetch(
    getBackendUrl(`/api/v1/events/staff/${staffId}/assigned-events`),
    { method: "GET", headers, cache: "no-store" },
  );

  if (!response.ok) {
    const body = await response.text();
    if (response.status === 404) return [];
    if (response.status === 403) throw new Error("User is not a staff member");
    throw new Error(
      `Failed to fetch assigned events (${response.status} ${response.statusText}): ${body}`,
    );
  }

  const data = (await response.json()) as { events?: Array<{ eventId: string; eventName: string }> } | null;
  if (!data || !data.events || !Array.isArray(data.events)) return [];
  return data.events.map((e) => ({ eventId: e.eventId, eventName: e.eventName }));
}

export async function getGlobalStaffMembers(): Promise<StaffMember[]> {
  const headers = await createAuthHeaders();
  const response = await fetch(getBackendUrl("/api/v1/users/staff"), {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to fetch staff members (${response.status} ${response.statusText}): ${body}`,
    );
  }

  return response.json();
}

export async function getEventStaffMembers(eventId: string): Promise<StaffMember[]> {
  const headers = await createAuthHeaders();
  const response = await fetch(getBackendUrl(`/api/v1/events/${eventId}/staff`), {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to fetch event staff (${response.status} ${response.statusText}): ${body}`,
    );
  }

  return response.json();
}

export async function assignStaffToEvent(eventId: string, staffId: string): Promise<void> {
  const headers = await createAuthHeaders();
  const response = await fetch(getBackendUrl(`/api/v1/events/${eventId}/staff`), {
    method: "POST",
    headers,
    body: JSON.stringify({ staffId }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to assign staff (${response.status} ${response.statusText}): ${body}`,
    );
  }
}

export async function removeStaffFromEvent(eventId: string, staffId: string): Promise<void> {
  const headers = await createAuthHeaders();
  const response = await fetch(
    getBackendUrl(`/api/v1/events/${eventId}/staff/${staffId}`),
    { method: "DELETE", headers },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to remove staff (${response.status} ${response.statusText}): ${body}`,
    );
  }
}
