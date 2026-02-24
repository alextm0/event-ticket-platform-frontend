import { EventAnalytics } from "@/components/organizer/EventAnalytics";
import type { PublishedEvent, EventTicketType } from "@/types";

interface AnalyticsTabProps {
  event: PublishedEvent;
  eventId: string;
  ticketTypes: EventTicketType[];
}

export function AnalyticsTab({ event, eventId, ticketTypes }: AnalyticsTabProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <EventAnalytics eventId={eventId} ticketTypes={ticketTypes} event={event} />
    </div>
  );
}

