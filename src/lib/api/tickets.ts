import type {
  EventTicketType,
  Ticket,
  CreateTicketTypePayload,
  UpdateTicketTypePayload,
  RawTicketType,
} from "@/types";
import { normalizeTicketType } from "@/types";
import {
  createAuthHeaders,
  unwrapPageResponse,
  getBackendUrl,
  getCurrentUserId,
} from "./http";

export type { CreateTicketTypePayload, UpdateTicketTypePayload };

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

export async function getEventTicketTypes(eventId: string): Promise<EventTicketType[]> {
  const headers = await createAuthHeaders({ requireToken: false });
  const response = await fetch(
    getBackendUrl(`/api/v1/events/${eventId}/ticket-types`),
    { method: "GET", headers, cache: "no-store" },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to fetch ticket types (${response.status} ${response.statusText}): ${body}`,
    );
  }

  const data = await response.json();
  const items = unwrapPageResponse<RawTicketType>(data);
  return items.map(normalizeTicketType);
}

export async function createTicketType(
  eventId: string,
  payload: CreateTicketTypePayload,
): Promise<EventTicketType> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No user ID available.");

  const headers = await createAuthHeaders();
  const response = await fetch(
    getBackendUrl(`/api/v1/events/${eventId}/ticket-types`),
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

export async function updateTicketType(
  eventId: string,
  ticketTypeId: string,
  payload: UpdateTicketTypePayload,
): Promise<EventTicketType> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No user ID available.");

  const headers = await createAuthHeaders();
  const response = await fetch(
    getBackendUrl(`/api/v1/events/${eventId}/ticket-types/${ticketTypeId}`),
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

export async function deleteTicketType(
  eventId: string,
  ticketTypeId: string,
): Promise<void> {
  const headers = await createAuthHeaders();
  const response = await fetch(
    getBackendUrl(`/api/v1/events/${eventId}/ticket-types/${ticketTypeId}`),
    { method: "DELETE", headers, cache: "no-store" },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to delete ticket type (${response.status} ${response.statusText}): ${body}`,
    );
  }
}

export async function getUserTickets(): Promise<Ticket[]> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No user ID available for ticket lookup.");

  const headers = await createAuthHeaders({ requireToken: false });
  headers["X-User-Id"] = userId;

  const response = await fetch(getBackendUrl("/api/v1/tickets"), {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to fetch tickets (${response.status} ${response.statusText}): ${body}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) throw new Error("Tickets response is not an array.");
  return data.map(normalizeTicketResponse);
}

export async function getTicketById(ticketId: string): Promise<Ticket> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No user ID available for ticket lookup.");

  const headers = await createAuthHeaders({ requireToken: false });
  headers["X-User-Id"] = userId;

  const response = await fetch(getBackendUrl(`/api/v1/tickets/${ticketId}`), {
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

/**
 * Purchase a ticket. Must only be invoked after requireRouteAuth("attendee") has run.
 * Requires a valid auth token; throws if not authenticated.
 */
export async function buyTicket(
  eventId: string,
  ticketTypeId: string,
  quantity: number = 1,
): Promise<{ orderId: string }> {
  const headers = await createAuthHeaders({ requireToken: true });
  const response = await fetch(
    getBackendUrl(`/api/v1/published-event/${eventId}/ticket-types/${ticketTypeId}`),
    {
      method: "POST",
      headers,
      body: JSON.stringify({ quantity }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to purchase ticket (${response.status} ${response.statusText}): ${body}`,
    );
  }

  const data = await response.json();
  return { orderId: data.orderId || data.id };
}
