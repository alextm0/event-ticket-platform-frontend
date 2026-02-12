/**
 * Barrel re-export of domain API modules.
 * Prefer importing from @/lib/api/{users|events|tickets|staff|analytics} when possible.
 */
export {
  getCurrentUserId,
  createBackendUser,
  getUserById,
  type CreateUserPayload,
  type UserProfile,
} from "./api/users";

export {
  getEvents,
  getPublishedEvents,
  getPublishedEvent,
  getEvent,
  createEvent,
  deleteEvent,
  updateEvent,
  updateEventStatus,
  type CreateEventPayload,
  type UpdateEventPayload,
} from "./api/events";

export {
  getEventTicketTypes,
  createTicketType,
  updateTicketType,
  deleteTicketType,
  getUserTickets,
  getTicketById,
  buyTicket,
  type CreateTicketTypePayload,
  type UpdateTicketTypePayload,
} from "./api/tickets";

export {
  getStaffAssignedEvents,
  getGlobalStaffMembers,
  getEventStaffMembers,
  assignStaffToEvent,
  removeStaffFromEvent,
  type StaffAssignedEvent,
  type StaffMember,
} from "./api/staff";

export {
  getEventSalesHistory,
  getEventOrders,
  getEventOperationsMetrics,
  getValidationLogs,
  type SalesHistoryItem,
  type RecentOrder,
  type OperationsMetrics,
  type TicketValidationLog,
} from "./api/analytics";
