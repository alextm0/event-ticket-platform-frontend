import { Event } from "@/types";

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