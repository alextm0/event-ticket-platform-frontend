export interface StaffMember {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface StaffAssignedEvent {
  eventId: string;
  eventName: string;
}

/** Alias for backward compatibility */
export type AssignedEvent = StaffAssignedEvent;
