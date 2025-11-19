
export interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  location: string;
  organizer: {
    id: string;
    name: string;
  };
}

export interface PublishedEventTicketType {
  id: string;
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  remainingQuantity?: number;
}

export interface EventTicketType {
  id: string;
  name: string;
  price: number;
  totalQuantity: number;
  soldCount: number;
  active: boolean;
  currency?: string;
  description?: string;
  eventId?: string;
}

export interface PublishedEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  status: string;
  organizerName?: string;
  ticketTypes: PublishedEventTicketType[];
}

export interface TicketQrCode {
  id: string;
  url?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  expiresAt?: string;
}