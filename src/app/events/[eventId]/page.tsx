import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Calendar, MapPin, Clock, ArrowLeft, User, Share2 } from "lucide-react";

import { getPublishedEvent, getEvent, getEventTicketTypes, getCurrentUserId } from "@/lib/backend-client";
import { TicketTypeList } from "@/components/events/TicketTypeList";
import { PublishedEvent, type EventTicketType, type RawTicketType } from "@/types";

import { StaffManagement } from "@/components/organizer/StaffManagement";
import { TicketTypeManagementWrapper } from "@/components/organizer/TicketTypeManagementWrapper";
import { getGlobalStaffMembers, getEventStaffMembers } from "@/lib/backend-client";
import { Button } from "@/components/ui/button";
import { GoogleMapEmbed } from "@/components/ui/google-map-embed";
import { EventDetailsView } from "@/components/events/EventDetailsView";

interface EventDetailsPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EventDetailsPage({ params }: EventDetailsPageProps) {
  const { eventId } = await params;

  if (!UUID_REGEX.test(eventId)) {
    notFound();
  }

  try {
    let event: PublishedEvent;
    try {
      event = await getPublishedEvent(eventId);
    } catch (error: any) {
      if (error.message.includes("400") || error.message.includes("Event not published")) {
        const internalEvent = await getEvent(eventId);
        event = {
          ...internalEvent,
          organizerName: internalEvent.organizer?.name || internalEvent.name || "Organizer",
          ticketTypes: [] // Will be populated by separate call
        } as PublishedEvent;
      } else {
        console.error("Non-400 error fetching published event:", error);
        throw error;
      }
    }

    let ticketTypes: RawTicketType[] | EventTicketType[] = (event.ticketTypes ?? []) as unknown as RawTicketType[];
    if (ticketTypes.length === 0) {
      ticketTypes = await getEventTicketTypes(eventId).catch((err) => {
        console.warn("Failed to fetch ticket types (might be empty or unauthorized):", err.message);
        return [];
      });
    }

    const currentUserId = await getCurrentUserId();
    const eventOrganizerId = event.organizerId ?? (event as { organizer?: { id: string } }).organizer?.id;
    const isOrganizerOfThisEvent = Boolean(currentUserId && eventOrganizerId && currentUserId === eventOrganizerId);

    // Staff management data (only for this event's organizer)
    let assignedStaff: Array<{ id: string; email: string; name: string; role: string }> = [];
    let availableStaff: Array<{ id: string; email: string; name: string; role: string }> = [];
    if (isOrganizerOfThisEvent) {
      try {
        const [assigned, available] = await Promise.all([
          getEventStaffMembers(eventId),
          getGlobalStaffMembers()
        ]);
        assignedStaff = assigned || [];
        availableStaff = available || [];
      } catch (err) {
        console.error("Failed to fetch staff management data:", err);
      }
    }

    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        {/* Admin Toolbar (Sticky Top) */}


        <EventDetailsView
          event={event}
          ticketTypes={ticketTypes}
          isOrganizer={isOrganizerOfThisEvent}
          assignedStaff={assignedStaff}
          availableStaff={availableStaff}
        />
      </div>
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("403") || msg.includes("401")) {
      redirect(`/sign-in?session_expired=1&next=/events/${eventId}`);
    }
    console.error(error);
    notFound();
  }
}
