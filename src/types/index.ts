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
