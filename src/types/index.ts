export interface EventResponse {
  id: string; // UUID
  organizerId: string; // UUID
  title: string;
  description: string;
  location: string;
  startTime: string; // Instant
  endTime: string; // Instant
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
}

export interface TicketTypePayload {
  name: string;
  price: number;
  quantity: number;
}

export interface EventPayload {
  organizerId: string;
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  ticketTypes: TicketTypePayload[];
}