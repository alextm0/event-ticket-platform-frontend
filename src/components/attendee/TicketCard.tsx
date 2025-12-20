"use client";

import { useEffect, useState } from "react";
import Ticket from "@/types/ticket-model";
import TicketDetailsModal from "./TicketDetailsModal";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Ticket as TicketIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { ticket: Ticket };

export default function TicketCard({ ticket }: Props) {
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const eventDate = ticket.event_start_time
    ? new Date(ticket.event_start_time).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    : "TBD";

  const eventTime = ticket.event_start_time
    ? new Date(ticket.event_start_time).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    })
    : null;

  return (
    <>
      <div
        className="group relative flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]/50 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-[var(--color-primary)]/30"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Status Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize shadow-sm backdrop-blur-md",
              ticket.status === "approved" || ticket.status === "purchased"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                : ticket.status === "checked_in" || ticket.status === "checked-in"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/20"
                  : ticket.status === "cancelled"
                    ? "bg-red-500/20 text-red-400 border border-red-500/20"
                    : "bg-slate-500/20 text-slate-400 border border-slate-500/20"
            )}
          >
            {ticket.status?.replace('_', ' ') || "pending"}
          </span>
        </div>

        {/* Card Content */}
        <div className="p-6 flex-1 flex flex-col relative z-0">

          {/* Header */}
          <div className="mb-4 pr-12">
            <h3 className="text-xl font-bold text-white group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
              {ticket.event_title ?? "Event Name"}
            </h3>
            <div className="mt-1 flex items-center text-sm font-medium text-[var(--color-secondary)]">
              <TicketIcon className="mr-2 h-4 w-4 text-[var(--color-primary)]" />
              <span className="truncate">
                {ticket.ticket_type_name ?? ticket.ticket_type ?? "General Admission"}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 mt-auto">
            <div className="flex items-center text-sm text-[var(--color-secondary)]">
              <Calendar className="mr-2 h-4 w-4 text-[var(--color-primary)] shrink-0" />
              <span suppressHydrationWarning>{eventDate}</span>
            </div>
            {eventTime && (
              <div className="flex items-center text-sm text-[var(--color-secondary)]">
                <Clock className="mr-2 h-4 w-4 text-[var(--color-primary)] shrink-0" />
                <span suppressHydrationWarning>{eventTime}</span>
              </div>
            )}
            <div className="flex items-center text-sm text-[var(--color-secondary)]">
              <MapPin className="mr-2 h-4 w-4 text-[var(--color-primary)] shrink-0" />
              <span className="truncate">{ticket.event_location ?? "Location TBD"}</span>
            </div>
          </div>
        </div>

        {/* Styles Bottom Decoration */}
        <div className="relative h-16 bg-[var(--color-background)]/30 border-t border-[var(--color-border)] p-4 flex items-center justify-between backdrop-blur-sm">
          <div className="text-xs text-[var(--color-secondary)]">
            <span className="block opacity-60">Ticket ID</span>
            <span className="font-mono">{ticket.id.slice(0, 8)}...</span>
          </div>

          <Button
            variant="mint"
            size="sm"
            onClick={() => setOpen(true)}
            className="shadow-sm"
          >
            View Ticket
          </Button>
        </div>
      </div>

      <TicketDetailsModal
        isOpen={open}
        onClose={() => setOpen(false)}
        ticket={ticket}
      />
    </>
  );
}
