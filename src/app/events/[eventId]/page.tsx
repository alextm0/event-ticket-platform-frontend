import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { Calendar, MapPin, Clock, ArrowLeft, User, Share2 } from "lucide-react";

import { getPublishedEvent, getEvent, getEventTicketTypes } from "@/lib/backend-client";
import { TicketTypeList } from "@/components/events/TicketTypeList";
import { PublishedEvent } from "@/types";

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

export default async function EventDetailsPage({ params }: EventDetailsPageProps) {
  const { eventId } = await params;

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

    let ticketTypes = event.ticketTypes || [];
    if (ticketTypes.length === 0) {
      ticketTypes = await getEventTicketTypes(eventId).catch((err) => {
        console.warn("Failed to fetch ticket types (might be empty or unauthorized):", err.message);
        return [];
      });
    }

    const cookieStore = await cookies();
    const userRole = cookieStore.get("userRole")?.value;
    const isOrganizer = userRole === "organizer";

    // Staff management data (only for organizers)
    let assignedStaff: Array<{ id: string; email: string; name: string; role: string }> = [];
    let availableStaff: Array<{ id: string; email: string; name: string; role: string }> = [];
    if (isOrganizer) {
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
          isOrganizer={isOrganizer}
          assignedStaff={assignedStaff}
          availableStaff={availableStaff}
        />
      </div>
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
}
