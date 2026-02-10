
export interface Event {
  id: string;
  title: string;
  name?: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  status: string;
  organizer?: {
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
  /**
   * Ratio of sold tickets to total capacity (0.0–1.0).
   * Example: 1/1000 -> 0.001, 40/100 -> 0.4
   */
  soldRatio?: number;
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
  /** Organizer user id; used to show organizer-only UI when current user is this event's organizer */
  organizerId?: string;
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

export interface AssignedEvent {
  eventId: string;
  eventName: string;
}