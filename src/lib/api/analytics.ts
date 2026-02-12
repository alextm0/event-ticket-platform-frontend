import { createAuthHeaders, getBackendUrl } from "./http";
import type {
  SalesHistoryItem,
  RecentOrder,
  OperationsMetrics,
  TicketValidationLog,
} from "@/types";

export type { SalesHistoryItem, RecentOrder, OperationsMetrics, TicketValidationLog };

function normalizeSalesHistoryItem(raw: Record<string, unknown>): SalesHistoryItem {
  const date = (raw.date ?? raw.saleDate ?? raw.sale_date ?? raw.day ?? "") as string;
  const revenue = Number(raw.revenue ?? raw.totalRevenue ?? raw.total_revenue ?? 0);
  const sales = Number(raw.sales ?? raw.ticketCount ?? raw.ticket_count ?? raw.quantity ?? 0);
  return { date: String(date), revenue, sales };
}

export async function getEventSalesHistory(eventId: string): Promise<SalesHistoryItem[]> {
  const headers = await createAuthHeaders();
  const response = await fetch(
    getBackendUrl(`/api/v1/events/${eventId}/analytics/sales-history`),
    { method: "GET", headers, cache: "no-store" },
  );

  if (!response.ok) {
    const body = await response.text();
    if (response.status === 404) return [];
    throw new Error(`Failed to fetch sales history (${response.status}): ${body}`);
  }

  const data = await response.json();
  const items = Array.isArray(data)
    ? data
    : Array.isArray((data as { content?: unknown })?.content)
      ? (data as { content: Record<string, unknown>[] }).content
      : Array.isArray((data as { data?: unknown })?.data)
        ? (data as { data: Record<string, unknown>[] }).data
        : [];
  return items.map(normalizeSalesHistoryItem);
}

export async function getEventOrders(eventId: string): Promise<RecentOrder[]> {
  const headers = await createAuthHeaders();
  const response = await fetch(
    getBackendUrl(`/api/v1/events/${eventId}/orders`),
    { method: "GET", headers, cache: "no-store" },
  );

  if (!response.ok) {
    const body = await response.text();
    if (response.status === 404) return [];
    throw new Error(`Failed to fetch event orders (${response.status}): ${body}`);
  }

  const data = await response.json();
  const items = Array.isArray(data)
    ? data
    : Array.isArray((data as { content?: unknown })?.content)
      ? (data as { content: Record<string, unknown>[] }).content
      : [];
  return items.map((raw: Record<string, unknown>) => ({
    id: (raw.id ?? raw.orderId ?? "") as string,
    user: (raw.user ?? raw.userName ?? raw.buyerName ?? raw.email ?? "Unknown") as string,
    ticket: (raw.ticket ?? raw.ticketSummary ?? raw.ticketTypeName ?? "Ticket") as string,
    amount: Number(raw.amount ?? raw.totalAmount ?? raw.total ?? 0),
    timestamp: (raw.timestamp ?? raw.createdAt ?? raw.created_at ?? new Date().toISOString()) as string,
  }));
}

export async function getEventOperationsMetrics(eventId: string): Promise<OperationsMetrics> {
  const headers = await createAuthHeaders();
  const response = await fetch(
    getBackendUrl(`/api/v1/events/${eventId}/analytics/operations`),
    { method: "GET", headers, cache: "no-store" },
  );

  if (!response.ok) {
    const body = await response.text();
    if (response.status === 404) return { checkedInCount: 0, totalSold: 0, noShowRate: 0 };
    throw new Error(`Failed to fetch operations metrics (${response.status}): ${body}`);
  }

  return response.json();
}

export async function getValidationLogs(eventId: string): Promise<TicketValidationLog[]> {
  const headers = await createAuthHeaders();
  const response = await fetch(
    getBackendUrl(`/api/v1/events/${eventId}/ticket-validations`),
    { method: "GET", headers, cache: "no-store" },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to fetch validation logs (${response.status} ${response.statusText}): ${body}`,
    );
  }

  return response.json();
}
