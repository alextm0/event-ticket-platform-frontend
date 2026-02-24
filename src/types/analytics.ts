export interface SalesHistoryItem {
  date: string;
  revenue: number;
  sales: number;
}

export interface RecentOrder {
  id: string;
  user: string;
  ticket: string;
  amount: number;
  timestamp: string;
}

export interface OperationsMetrics {
  checkedInCount: number;
  totalSold: number;
  noShowRate: number;
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
  ticketEventId?: string;
}
