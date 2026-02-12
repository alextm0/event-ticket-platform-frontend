export {
  type CreateUserPayload,
  type UserProfile,
} from "./users";

export {
  type Event,
  type PublishedEvent,
  type PublishedEventTicketType,
  type EventTicketType,
  type CreateEventPayload,
  type UpdateEventPayload,
} from "./events";

export {
  type Ticket,
  type CreateTicketTypePayload,
  type UpdateTicketTypePayload,
  type RawTicketType,
  normalizeTicketType,
} from "./tickets";

export {
  type StaffMember,
  type StaffAssignedEvent,
  type AssignedEvent,
} from "./staff";

export {
  type SalesHistoryItem,
  type RecentOrder,
  type OperationsMetrics,
  type TicketValidationLog,
} from "./analytics";

export interface TicketQrCode {
  id: string;
  url?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  expiresAt?: string;
}
