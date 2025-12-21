import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

import { getPublishedEvent, getEvent, getEventTicketTypes } from "@/lib/backend-client";

import { EventDetailsCard } from "@/components/events/EventDetailsCard";
import { TicketTypeList } from "@/components/events/TicketTypeList";
import { PageHeader } from "@/components/ui/page-header";
import { PublishedEvent, Event } from "@/types";
import { OrganizerManagementBar } from "@/components/organizer/OrganizerManagementBar";
import { StaffManagement } from "@/components/organizer/StaffManagement";
import { TicketTypeManagementWrapper } from "@/components/organizer/TicketTypeManagementWrapper";
import { getGlobalStaffMembers, getEventStaffMembers } from "@/lib/backend-client";

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
      // If the event is not published, it will return a 400 error.
      // We try to fetch it as a regular event (which requires auth and appropriate role/ownership)
      if (error.message.includes("400") || error.message.includes("Event not published")) {
        const internalEvent = await getEvent(eventId);
        // Map internal Event to PublishedEvent structure
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

    // If no ticket types in the event object (common for internal getEvent call), fetch them separately
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
    let assignedStaff = [];
    let availableStaff = [];
    if (isOrganizer) {
      try {
        [assignedStaff, availableStaff] = await Promise.all([
          getEventStaffMembers(eventId),
          getGlobalStaffMembers()
        ]);
      } catch (err) {
        console.error("Failed to fetch staff management data:", err);
      }
    }

    return (
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 space-y-16">
        {/* Organizer Management Bar */}
        {isOrganizer && (
          <OrganizerManagementBar event={event} />
        )}

        {/* Header Section */}
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
            {event.status}
          </div>
          <PageHeader
            title={event.title}
            description={event.description}
            className="mb-0"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Event Details Card */}
          <div className="lg:col-span-2">
            <EventDetailsCard event={event} />
          </div>

          {/* Ticket Types Card */}
          <div className="lg:col-span-1">
            {isOrganizer ? (
              <TicketTypeManagementWrapper eventId={event.id} ticketTypes={ticketTypes} />
            ) : (
              <TicketTypeList eventId={event.id} ticketTypes={ticketTypes} />
            )}
          </div>
        </div>

        {/* Staff Management Section (Organizers only) */}
        {isOrganizer && (
          <div className="pt-8 border-t border-white/5">
            <StaffManagement
              eventId={eventId}
              assignedStaff={assignedStaff}
              availableStaff={availableStaff}
            />
          </div>
        )}

        {/* Back Link */}
        <div className="mt-10 flex items-center gap-3">
          <Link
            href="/browse-events"
            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:opacity-80 transition-opacity"
          >
            <span aria-hidden="true">&lt;-</span> Back to browse events
          </Link>
        </div>
      </div>
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
}
