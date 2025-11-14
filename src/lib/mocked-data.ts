import { Event } from "@/types";
import Ticket from "@/types/ticket-model";
import { randomUUID } from "crypto";
import { TicketType } from "@/types/ticket-type-model";

export const mockedEvents: Event[] = [
  {
    id: 1,
    name: "Tech Conference 2025",
    date: "2025-10-20T09:00:00",
    location: "San Francisco, CA",
    description: "The biggest tech conference of the year.",
    organizer: {
      id: "org-1",
      name: "Tech Events Inc.",
    },
  },
  {
    id: 2,
    name: "Music Festival 2025",
    date: "2025-11-15T12:00:00",
    location: "Los Angeles, CA",
    description: "A 3-day music festival with top artists.",
    organizer: {
      id: "org-2",
      name: "Music Fest LLC",
    },
  },
];

export const mockTickets: Ticket[] = [
  {
    id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    order_id: "f1e2d3c4-b5a6-4968-a7b8-c9d0e1f2a3b4",
    ticket_type: "VIP",
    qr_code: "QR-VIP-001-2024",
    status: "CHECKED_IN",
    checked_in_at: new Date("2025-11-08T10:30:00Z"),
    created_at: new Date("2025-11-05T14:20:00Z"),
    updated_at: new Date("2025-11-08T10:30:00Z"),
    event_id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  },
  {
    id: "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
    order_id: "f1e2d3c4-b5a6-4968-a7b8-c9d0e1f2a3b4",
    ticket_type: "VIP",
    qr_code: "QR-VIP-002-2024",
    status: "PURCHASED",
    checked_in_at: null,
    created_at: new Date("2025-11-05T14:20:00Z"),
    updated_at: new Date("2025-11-05T14:20:00Z"),
    event_id:"a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",

  },
  {
    id: "c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f",
    order_id: "a2b3c4d5-e6f7-4a5b-8c9d-0e1f2a3b4c5d",
    ticket_type: "General Admission",
    qr_code: "QR-GA-001-2024",
    status: "DEFAULT",
    checked_in_at: null,
    created_at: new Date("2025-11-06T09:15:00Z"),
    updated_at: new Date("2025-11-06T09:15:00Z"),
    event_id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",

  },
  {
    id: "d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a",
    order_id: "a2b3c4d5-e6f7-4a5b-8c9d-0e1f2a3b4c5d",
    ticket_type: "General Admission",
    qr_code: "QR-GA-002-2024",
    status: "NULL",
    checked_in_at: new Date("2025-11-07T18:45:00Z"),
    created_at: new Date("2025-11-06T09:15:00Z"),
    updated_at: new Date("2025-11-07T18:45:00Z"),  
    event_id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  },
  {
    id: "e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b",
    order_id: "b3c4d5e6-f7a8-4b5c-9d0e-1f2a3b4c5d6e",
    ticket_type: "Early Bird",
    qr_code: "QR-EB-001-2024",
    status: "PURCHASED",
    checked_in_at: null,
    created_at: new Date("2025-11-03T12:00:00Z"),
    updated_at: new Date("2025-11-03T12:00:00Z"),
    event_id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  },
];

export const mockTicketTypes: TicketType[] = [
  {
    id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    event_id: 1,
    name: "VIP",
    description: "Premium VIP access with exclusive benefits",
    price: 299.99,
    total_quantity: 100,
    sold_count: 87,
    is_active: true,
    created_at: new Date("2025-11-01T08:00:00Z"),
    updated_at: new Date("2025-11-01T08:00:00Z"),
  },
  {
    id: "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
    event_id: 1,
    name: "General Admission",
    description: "Standard ticket for general event access",
    price: 79.99,
    total_quantity: 500,
    sold_count: 456,
    is_active: true,
    created_at: new Date("2025-11-01T08:00:00Z"),
    updated_at: new Date("2025-11-01T08:00:00Z"),
  },
  {
    id: "d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a",
    event_id: 2,
    name: "Student",
    description: "Discounted tickets for students",
    price: 39.99,
    total_quantity: 200,
    sold_count: 178,
    is_active: true,
    created_at: new Date("2025-11-01T08:00:00Z"),
    updated_at: new Date("2025-11-01T08:00:00Z"),
  },
  {
    id: "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6v",
    event_id: 2,
    name: "General Admission",
    description: "Standard ticket for general event access",
    price: 79.99,
    total_quantity: 500,
    sold_count: 456,
    is_active: true,
    created_at: new Date("2025-11-01T08:00:00Z"),
    updated_at: new Date("2025-11-01T08:00:00Z"),
  },
];
