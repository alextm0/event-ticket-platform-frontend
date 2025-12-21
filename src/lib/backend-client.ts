import { serverRuntimeConfig } from "@/config/server-env";
import { Event, PublishedEvent, EventTicketType } from "@/types";
import Ticket from "@/types/ticket-model";
import { cookies } from "next/headers";

interface CreateUserPayload {
  id: string;
  email: string;
  fullName: string;
  role: string;
  password: string;
}

const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_MAX_RETRIES = 2;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Get auth token from cookies
async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("authToken")?.value || null;
}

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("userId")?.value || null;
}

export async function createBackendUser(
  payload: CreateUserPayload,
  options: { timeoutMs?: number; maxRetries?: number } = {},
): Promise<void> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;

  const token = await getAuthToken();
  if (!token) {
    throw new Error("No authentication token available.");
  }

  const requestBody = JSON.stringify({
    id: payload.id,
    email: payload.email,
    name: payload.fullName,
    role: payload.role.toUpperCase(),
    password: payload.password,
  });

  let attempt = 0;
  let delayMs = 500;
  let lastError: unknown = null;

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/v1/users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: requestBody,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok || response.status === 409) {
        return;
      }

      if (response.status >= 500 && response.status < 600 && attempt < maxRetries) {
        lastError = new Error(`Retryable backend error: ${response.status}`);
      } else {
        const body = await response.text();
        throw new Error(
          `Failed to create backend user (${response.status} ${response.statusText}): ${body}`,
        );
      }
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;

      const isAbortError = error instanceof DOMException && error.name === "AbortError";
      const isFetchError = error instanceof TypeError;

      if ((isAbortError || isFetchError || (error instanceof Error && /Retryable backend/.test(error.message))) && attempt < maxRetries) {
        await delay(delayMs);
        delayMs *= 2;
        attempt += 1;
        continue;
      }

      throw error;
    }

    attempt += 1;
    if (attempt <= maxRetries) {
      await delay(delayMs);
      delayMs *= 2;
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }
  throw new Error("Failed to create backend user due to repeated network errors.");
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  fullName?: string;
  role?: string;
}

export async function getUserById(userId: string): Promise<UserProfile> {
  const token = await getAuthToken();
  if (!token) throw new Error("No authentication token available.");

  const response = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/v1/users/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    // Try fallback to public profile if admin path fails?
    // Or maybe throwing is fine.
    const body = await response.text();
    throw new Error(`Failed to fetch user (${response.status}): ${body}`);
  }

  return response.json();
}

export async function getEvents(
  options: {
    timeoutMs?: number;
    maxRetries?: number;
    organizerId?: string;
  } = {},
): Promise<Event[]> {
  // Handle null/undefined options
  if (!options) {
    options = {};
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;

  const token = await getAuthToken();
  if (!token) {
    throw new Error("No authentication token available.");
  }

  // Build URL with query params
  const url = new URL(`${serverRuntimeConfig.backendApiUrl}/api/v1/events`);
  if (options.organizerId) {
    url.searchParams.set("organizerId", options.organizerId);
  }

  // Build headers
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  // If organizerId is provided, also add X-User-Id header (backend might use either)
  if (options.organizerId) {
    headers["X-User-Id"] = options.organizerId;
  }

  let attempt = 0;
  let delayMs = 500;
  let lastError: unknown = null;

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        // Handle paginated response (Spring Data Page structure)
        if (Array.isArray(data)) {
          return data;
        }
        if (Array.isArray(data?.content)) {
          return data.content;
        }
        throw new Error("Events response does not contain an array.");
      }

      if (response.status >= 500 && response.status < 600 && attempt < maxRetries) {
        lastError = new Error(`Retryable backend error: ${response.status}`);
      } else {
        const body = await response.text();
        throw new Error(
          `Failed to fetch events (${response.status} ${response.statusText}): ${body}`,
        );
      }
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;

      const isAbortError = error instanceof DOMException && error.name === "AbortError";
      const isFetchError = error instanceof TypeError;

      if ((isAbortError || isFetchError || (error instanceof Error && /Retryable backend/.test(error.message))) && attempt < maxRetries) {
        await delay(delayMs);
        delayMs *= 2;
        attempt += 1;
        continue;
      }

      throw error;
    }

    attempt += 1;
    if (attempt <= maxRetries) {
      await delay(delayMs);
      delayMs *= 2;
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }
  throw new Error("Failed to fetch events due to repeated network errors.");
}

export async function getPublishedEvents(): Promise<PublishedEvent[]> {
  try {
    const response = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/v1/published-events`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Failed to fetch published events (${response.status} ${response.statusText}): ${body}`);
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      return data as PublishedEvent[];
    }

    if (Array.isArray(data?.content)) {
      return data.content as PublishedEvent[];
    }

    throw new Error("Published events response does not contain an array.");
  } catch (error) {
    console.error("Failed to fetch published events", error);
    throw error;
  }
}

export async function getPublishedEvent(eventId: string): Promise<PublishedEvent> {
  try {
    const response = await fetch(
      `${serverRuntimeConfig.backendApiUrl}/api/v1/published-event/${eventId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Failed to fetch published event (${response.status} ${response.statusText}): ${body}`,
      );
    }

    const data = await response.json();
    return data as PublishedEvent;
  } catch (error) {
    // We don't log error here because it's common to fail when checking for draft events
    // and we handle the fallback in the UI.
    throw error;
  }
}

export async function getEvent(eventId: string): Promise<Event> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("No authentication token available.");
    }

    const userId = await getCurrentUserId();
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    if (userId) {
      headers["X-User-Id"] = userId;
    }

    const response = await fetch(
      `${serverRuntimeConfig.backendApiUrl}/api/v1/events/${eventId}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Failed to fetch event (${response.status} ${response.statusText}): ${body}`,
      );
    }

    const data = await response.json();
    return data as Event;
  } catch (error) {
    console.error(`Failed to fetch event ${eventId}`, error);
    throw error;
  }
}

export async function getEventTicketTypes(eventId: string): Promise<EventTicketType[]> {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `${serverRuntimeConfig.backendApiUrl}/api/v1/events/${eventId}/ticket-types`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Failed to fetch ticket types (${response.status} ${response.statusText}): ${body}`,
      );
    }

    const data = await response.json();

    // Handle both array and paginated responses
    if (Array.isArray(data)) {
      return data as EventTicketType[];
    }

    if (Array.isArray(data?.content)) {
      return data.content as EventTicketType[];
    }

    throw new Error("Ticket types response does not contain an array.");
  } catch (error) {
    console.error(`Failed to fetch ticket types for event ${eventId}`, error);
    throw error;
  }
}

export interface CreateTicketTypePayload {
  name: string;
  description?: string;
  price: number;
  totalQuantity: number;
  active?: boolean;
}

export async function createTicketType(
  eventId: string,
  payload: CreateTicketTypePayload,
): Promise<EventTicketType> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("No authentication token available.");
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("No user ID available.");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-User-Id": userId,
  };

  const response = await fetch(
    `${serverRuntimeConfig.backendApiUrl}/api/v1/events/${eventId}/ticket-types`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to create ticket type (${response.status} ${response.statusText}): ${body}`,
    );
  }

  return response.json();
}

export interface UpdateTicketTypePayload {
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  active?: boolean;
}

export async function updateTicketType(
  eventId: string,
  ticketTypeId: string,
  payload: UpdateTicketTypePayload,
): Promise<EventTicketType> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("No authentication token available.");
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("No user ID available.");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-User-Id": userId,
  };

  const response = await fetch(
    `${serverRuntimeConfig.backendApiUrl}/api/v1/events/${eventId}/ticket-types/${ticketTypeId}`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify(payload),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to update ticket type (${response.status} ${response.statusText}): ${body}`,
    );
  }

  return response.json();
}

export async function deleteTicketType(eventId: string, ticketTypeId: string): Promise<void> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("No authentication token available.");
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("No user ID available.");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-User-Id": userId,
  };

  const response = await fetch(
    `${serverRuntimeConfig.backendApiUrl}/api/v1/events/${eventId}/ticket-types/${ticketTypeId}`,
    {
      method: "DELETE",
      headers,
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to delete ticket type (${response.status} ${response.statusText}): ${body}`,
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTicketResponse(raw: any): Ticket {
  const toIsoString = (value: string | null | undefined) =>
    value ? new Date(value).toISOString() : undefined;

  return {
    id: raw.id ?? raw.ticketId ?? "",
    order_id: raw.order_id ?? raw.orderId ?? "",
    event_id: raw.event_id ?? raw.eventId ?? "",
    ticket_type: raw.ticket_type ?? raw.ticketType ?? raw.ticketTypeName ?? "Ticket",
    qr_code: raw.qr_code ?? raw.qrCode ?? "",
    status: (raw.status ?? raw.ticketStatus ?? "DEFAULT").toString(),
    checked_in_at: toIsoString(raw.checked_in_at ?? raw.checkedInAt) ?? null,
    created_at: new Date(raw.created_at ?? raw.createdAt ?? Date.now()).toISOString(),
    updated_at: new Date(raw.updated_at ?? raw.updatedAt ?? Date.now()).toISOString(),
    event_title: raw.event_title ?? raw.eventTitle ?? raw.event?.title,
    event_location: raw.event_location ?? raw.eventLocation ?? raw.event?.location,
    event_start_time: toIsoString(raw.event_start_time ?? raw.eventStartTime ?? raw.event?.startTime),
    event_end_time: toIsoString(raw.event_end_time ?? raw.eventEndTime ?? raw.event?.endTime),
    event_description: raw.event_description ?? raw.eventDescription ?? raw.event?.description,
    ticket_type_name: raw.ticket_type_name ?? raw.ticketTypeName ?? raw.ticket_type ?? raw.ticketType,
    qr_code_id: raw.qr_code_id ?? raw.qrCodeId ?? raw.qr_code ?? raw.qrCode,
    purchase_date: toIsoString(raw.purchase_date ?? raw.purchaseDate ?? raw.created_at ?? raw.createdAt),
    attendee_name: raw.attendee_name ?? raw.attendeeName ?? raw.user?.fullName ?? raw.user?.name ?? raw.ownerName,
    user_email: raw.user_email ?? raw.userEmail ?? raw.user?.email,
    user_id: raw.userId ?? raw.user_id ?? raw.ownerId ?? raw.owner_id ?? raw.user?.id,
  };
}

export async function getUserTickets(): Promise<Ticket[]> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("No user ID available for ticket lookup.");
  }

  const headers: Record<string, string> = {
    "X-User-Id": userId,
    "Content-Type": "application/json",
  };

  const token = await getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/v1/tickets`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to fetch tickets (${response.status} ${response.statusText}): ${body}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Tickets response is not an array.");
  }

  return data.map(normalizeTicketResponse);
}

export async function getTicketById(ticketId: string): Promise<Ticket> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("No user ID available for ticket lookup.");
  }

  const token = await getAuthToken();
  const headers: Record<string, string> = {
    "X-User-Id": userId,
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Generic endpoint - structure depends on backend. 
  // Assuming /api/v1/tickets/{id} exists for fetching single ticket details.
  const response = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/v1/tickets/${ticketId}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to fetch ticket (${response.status} ${response.statusText}): ${body}`);
  }

  const data = await response.json();
  return normalizeTicketResponse(data);
}

export async function buyTicket(eventId: string, ticketTypeId: string, quantity: number = 1): Promise<{ orderId: string }> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("No user ID available for ticket purchase.");
  }

  const headers: Record<string, string> = {
    "X-User-Id": userId,
    "Content-Type": "application/json",
  };

  const token = await getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const requestBody = JSON.stringify({
    quantity: quantity,
  });

  const response = await fetch(
    `${serverRuntimeConfig.backendApiUrl}/api/v1/published-event/${eventId}/ticket-types/${ticketTypeId}`,
    {
      method: "POST",
      headers,
      body: requestBody,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to purchase ticket (${response.status} ${response.statusText}): ${body}`
    );
  }

  const data = await response.json();
  return { orderId: data.orderId || data.id };
}

export interface CreateEventPayload {
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
}

export async function createEvent(payload: CreateEventPayload): Promise<Event> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("No authentication token available.");
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("No user ID available.");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-User-Id": userId,
  };

  const response = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/v1/events`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      ...payload,
      organizerId: userId,
      status: "DRAFT"
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to create event (${response.status} ${response.statusText}): ${body}`);
  }

  return response.json();
}

export async function deleteEvent(eventId: string): Promise<void> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("No authentication token available.");
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("No user ID available.");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-User-Id": userId,
  };

  const response = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/v1/events/${eventId}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to delete event (${response.status} ${response.statusText}): ${body}`);
  }
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
}

export async function updateEvent(eventId: string, payload: UpdateEventPayload): Promise<Event> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("No authentication token available.");
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("No user ID available.");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-User-Id": userId,
  };

  const response = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/v1/events/${eventId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to update event details (${response.status} ${response.statusText}): ${body}`);
  }

  return response.json();
}

/**
 * Specifically for status transitions (e.g., PUBLISHED -> DRAFT)
 */
export async function updateEventStatus(eventId: string, status: string): Promise<Event> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("No authentication token available.");
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("No user ID available.");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-User-Id": userId,
  };

  const response = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/v1/events/${eventId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to update event status (${response.status} ${response.statusText}): ${body}`);
  }

  return response.json();
}

export interface StaffAssignedEvent {
  eventId: string;
  eventName: string;
}

export interface StaffAssignedEventsResponse {
  events: Array<{
    eventId: string;
    eventName: string;
  }>;
}

/**
 * Get events assigned to a staff member
 */
export async function getStaffAssignedEvents(staffId: string): Promise<StaffAssignedEvent[]> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("No authentication token available.");
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("No user ID available.");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-User-Id": userId,
  };

  const response = await fetch(
    `${serverRuntimeConfig.backendApiUrl}/api/v1/events/staff/${staffId}/assigned-events`,
    {
      method: "GET",
      headers,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const body = await response.text();
    if (response.status === 404) {
      // Staff member not found or has no assigned events - return empty array
      return [];
    }
    if (response.status === 403) {
      throw new Error("User is not a staff member");
    }
    throw new Error(
      `Failed to fetch assigned events (${response.status} ${response.statusText}): ${body}`
    );
  }

  const data: StaffAssignedEventsResponse | null = await response.json();

  // Handle null or undefined response
  if (!data) {
    return [];
  }

  // Handle missing or non-array events field
  if (!data.events || !Array.isArray(data.events)) {
    return [];
  }

  // Map and return events
  return data.events.map((event) => ({
    eventId: event.eventId,
    eventName: event.eventName,
  }));
}

export interface StaffMember {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Get all users with the STAFF role
 */
export async function getGlobalStaffMembers(): Promise<StaffMember[]> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("No authentication token available.");
  }

  const response = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/v1/users/staff`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to fetch staff members (${response.status} ${response.statusText}): ${body}`);
  }

  return response.json();
}

/**
 * Get staff members assigned to a specific event
 */
export async function getEventStaffMembers(eventId: string): Promise<StaffMember[]> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("No authentication token available.");
  }

  const response = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/v1/events/${eventId}/staff`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to fetch event staff (${response.status} ${response.statusText}): ${body}`);
  }

  return response.json();
}

/**
 * Assign a staff member to an event
 */
export async function assignStaffToEvent(eventId: string, staffId: string): Promise<void> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("No authentication token available.");
  }

  const response = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/v1/events/${eventId}/staff`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ staffId }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to assign staff (${response.status} ${response.statusText}): ${body}`);
  }
}

/**
 * Remove a staff member from an event
 */
export async function removeStaffFromEvent(eventId: string, staffId: string): Promise<void> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("No authentication token available.");
  }

  const response = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/v1/events/${eventId}/staff/${staffId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to remove staff (${response.status} ${response.statusText}): ${body}`);
  }
}

export interface TicketValidationLog {
  id: string;
  eventId: string;
  eventTitle: string;
  ticketId: string;
  qrCodeId: string;
  ticketStatus: string;
  validationStatus: string;
  validationMethod: string;
  validatedAt: string;
}

export async function getValidationLogs(eventId: string): Promise<TicketValidationLog[]> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("No authentication token available.");
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("No user ID available.");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-User-Id": userId,
  };

  const response = await fetch(
    `${serverRuntimeConfig.backendApiUrl}/api/v1/events/${eventId}/ticket-validations`,
    {
      method: "GET",
      headers: {
        ...headers,
        "X-User-Id": userId
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to fetch validation logs (${response.status} ${response.statusText}): ${body}`,
    );
  }

  return response.json();
}

export interface SalesHistoryItem {
  date: string;
  revenue: number;
  sales: number;
}

export async function getEventSalesHistory(eventId: string): Promise<SalesHistoryItem[]> {
  const token = await getAuthToken();
  if (!token) throw new Error("No authentication token available.");

  const response = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/v1/events/${eventId}/analytics/sales-history`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    if (response.status === 404) return [];
    throw new Error(`Failed to fetch sales history (${response.status}): ${body}`);
  }

  return response.json();
}

export interface RecentOrder {
  id: string;
  user: string;
  ticket: string;
  amount: number;
  timestamp: string;
}

export async function getEventOrders(eventId: string): Promise<RecentOrder[]> {
  const token = await getAuthToken();
  if (!token) throw new Error("No authentication token available.");

  const response = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/v1/events/${eventId}/orders`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    if (response.status === 404) return [];
    throw new Error(`Failed to fetch event orders (${response.status}): ${body}`);
  }

  return response.json();
}

export interface OperationsMetrics {
  checkedInCount: number;
  totalSold: number;
  noShowRate: number;
}

export async function getEventOperationsMetrics(eventId: string): Promise<OperationsMetrics> {
  const token = await getAuthToken();
  if (!token) throw new Error("No authentication token available.");

  const response = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/v1/events/${eventId}/analytics/operations`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    if (response.status === 404) return { checkedInCount: 0, totalSold: 0, noShowRate: 0 };
    throw new Error(`Failed to fetch operations metrics (${response.status}): ${body}`);
  }

  return response.json();
}