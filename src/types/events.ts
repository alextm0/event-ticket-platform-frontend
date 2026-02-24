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
  organizerId?: string;
  ticketTypes: PublishedEventTicketType[];
}

export interface CreateEventPayload {
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
}
