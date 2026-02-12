import type { EventTicketType } from "./events";

export interface Ticket {
  id: string;
  order_id: string;
  event_id: string;
  ticket_type: string;
  qr_code: string;
  status: string;
  checked_in_at: string | null;
  created_at: string;
  updated_at: string;
  event_title?: string;
  event_location?: string;
  event_start_time?: string;
  event_end_time?: string;
  event_description?: string;
  ticket_type_name?: string;
  qr_code_id?: string;
  purchase_date?: string;
  attendee_name?: string;
  user_email?: string;
  user_id?: string;
}

export interface CreateTicketTypePayload {
  name: string;
  description?: string;
  price: number;
  totalQuantity: number;
  active?: boolean;
}

export interface UpdateTicketTypePayload {
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  active?: boolean;
}

/** Raw ticket type shape from API (snake_case or mixed) */
export type RawTicketType = Record<string, unknown>;

/**
 * Normalize raw ticket type to EventTicketType (camelCase).
 * Handles both snake_case API responses and already-normalized objects.
 */
export function normalizeTicketType(raw: RawTicketType): EventTicketType {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    description: raw.description as string | undefined,
    price: Number(raw.price ?? 0),
    currency: raw.currency as string | undefined,
    totalQuantity: (raw.total_quantity ?? raw.totalQuantity) as number,
    soldCount: (raw.sold_count ?? raw.soldCount) as number,
    active: (raw.active ?? raw.is_active ?? true) as boolean,
    eventId: (raw.event_id ?? raw.eventId) as string | undefined,
    soldRatio: (raw.soldRatio ?? raw.sold_ratio) as number | undefined,
  };
}
