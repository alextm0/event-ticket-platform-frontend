import { TicketTypeManagementWrapper } from "@/components/organizer/TicketTypeManagementWrapper";
import type { EventTicketType } from "@/types";

interface TicketsTabProps {
  eventId: string;
  ticketTypes: EventTicketType[];
}

export function TicketsTab({ eventId, ticketTypes }: TicketsTabProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <TicketTypeManagementWrapper eventId={eventId} ticketTypes={ticketTypes} />
    </div>
  );
}

