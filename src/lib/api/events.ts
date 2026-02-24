import type { Event, PublishedEvent, CreateEventPayload, UpdateEventPayload } from "@/types";
import {
  createAuthHeaders,
  unwrapPageResponse,
  getBackendUrl,
  getCurrentUserId,
} from "./http";

export type { CreateEventPayload, UpdateEventPayload };

const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_MAX_RETRIES = 2;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getEvents(
  options: {
    timeoutMs?: number;
    maxRetries?: number;
    organizerId?: string;
  } = {},
): Promise<Event[]> {
  if (!options) options = {};
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;

  const url = new URL(getBackendUrl("/api/v1/events"));
  if (options.organizerId) {
    url.searchParams.set("organizerId", options.organizerId);
  }

  const headers = await createAuthHeaders({ requireToken: true });
  if (options.organizerId) {
    headers["X-User-Id"] = options.organizerId;
  }

  let lastError: unknown = null;
  let delayMs = 500;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers,
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        return unwrapPageResponse<Event>(data);
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

      const isRetryable =
        error instanceof DOMException && error.name === "AbortError" ||
        error instanceof TypeError ||
        (error instanceof Error && /Retryable backend/.test(error.message));

      if (!isRetryable || attempt >= maxRetries) throw error;
    }

    await delay(delayMs);
    delayMs *= 2;
  }

  if (lastError instanceof Error) throw lastError;
  throw new Error("Failed to fetch events due to repeated network errors.");
}

export async function getPublishedEvents(): Promise<PublishedEvent[]> {
  const response = await fetch(getBackendUrl("/api/v1/published-events"), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to fetch published events (${response.status} ${response.statusText}): ${body}`,
    );
  }

  const data = await response.json();
  if (Array.isArray(data)) return data as PublishedEvent[];
  if (Array.isArray((data as { content?: unknown })?.content)) {
    return (data as { content: PublishedEvent[] }).content;
  }
  throw new Error("Published events response does not contain an array.");
}

export async function getPublishedEvent(eventId: string): Promise<PublishedEvent> {
  const response = await fetch(getBackendUrl(`/api/v1/published-event/${eventId}`), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to fetch published event (${response.status} ${response.statusText}): ${body}`,
    );
  }

  return response.json();
}

export async function getEvent(eventId: string): Promise<Event> {
  const headers = await createAuthHeaders();
  const response = await fetch(getBackendUrl(`/api/v1/events/${eventId}`), {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to fetch event (${response.status} ${response.statusText}): ${body}`,
    );
  }

  return response.json();
}

export async function createEvent(payload: CreateEventPayload): Promise<Event> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No user ID available.");

  const headers = await createAuthHeaders();
  const response = await fetch(getBackendUrl("/api/v1/events"), {
    method: "POST",
    headers,
    body: JSON.stringify({
      ...payload,
      organizerId: userId,
      status: "DRAFT",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to create event (${response.status} ${response.statusText}): ${body}`,
    );
  }

  return response.json();
}

export async function deleteEvent(eventId: string): Promise<void> {
  const headers = await createAuthHeaders();
  const response = await fetch(getBackendUrl(`/api/v1/events/${eventId}`), {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to delete event (${response.status} ${response.statusText}): ${body}`,
    );
  }
}

export async function updateEvent(
  eventId: string,
  payload: UpdateEventPayload,
): Promise<Event> {
  const headers = await createAuthHeaders();
  const response = await fetch(getBackendUrl(`/api/v1/events/${eventId}`), {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to update event details (${response.status} ${response.statusText}): ${body}`,
    );
  }

  return response.json();
}

export async function updateEventStatus(eventId: string, status: string): Promise<Event> {
  const headers = await createAuthHeaders();
  const response = await fetch(getBackendUrl(`/api/v1/events/${eventId}`), {
    method: "PATCH",
    headers,
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to update event status (${response.status} ${response.statusText}): ${body}`,
    );
  }

  return response.json();
}
