import { serverRuntimeConfig } from "@/config/server-env";
import { Event, PublishedEvent } from "@/types";
import Ticket from "@/types/ticket-model";
import { mockedEvents } from "@/lib/mocked-data";
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

async function getCurrentUserId(): Promise<string | null> {
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

export async function getEvents(
  options: { timeoutMs?: number; maxRetries?: number; useMockData?: boolean } = {},
): Promise<Event[]> {
  // Handle null/undefined options
  if (!options) {
    options = {};
  }
  
  if (options.useMockData) {
    return Promise.resolve(mockedEvents);
  }
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;

  const token = await getAuthToken();
  if (!token) {
    throw new Error("No authentication token available.");
  }

  let attempt = 0;
  let delayMs = 500;
  let lastError: unknown = null;

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${serverRuntimeConfig.backendApiUrl}/api/v1/events`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        return await response.json();
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
    console.error(`Failed to fetch published event ${eventId}`, error);
    throw error;
  }
}

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
    purchase_date: toIsoString(raw.purchase_date ?? raw.purchaseDate),
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
