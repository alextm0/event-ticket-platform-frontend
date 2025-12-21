"use client";

import { useState } from "react";
import type Ticket from "@/types/ticket-model";
import TicketCard from "./TicketCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Ticket as TicketIcon } from "lucide-react";

interface MyTicketsListProps {
  tickets: Ticket[];
}

export default function MyTicketsList({ tickets }: MyTicketsListProps) {
  const now = new Date();

  const upcomingEvents: Ticket[] = [];
  const pastEvents: Ticket[] = [];

  tickets.forEach(ticket => {
    // Logic for determining past/upcoming
    // Use end time if available, otherwise start time, otherwise treat as past if created long ago? 
    // Safe bet: if no dates, treat as upcoming (maybe TBD).
    let eventDate = now; // Default
    if (ticket.event_end_time) {
      eventDate = new Date(ticket.event_end_time);
    } else if (ticket.event_start_time) {
      eventDate = new Date(ticket.event_start_time);
    } else {
      // Fallback for missing dates -> treat as upcoming
      upcomingEvents.push(ticket);
      return;
    }

    // If event ended before now, it's past.
    if (eventDate < now) {
      pastEvents.push(ticket);
    } else {
      upcomingEvents.push(ticket);
    }
  });

  // Sort upcoming by START date ascending (soonest first)
  upcomingEvents.sort((a, b) => {
    const dateA = new Date(a.event_start_time || 0).getTime();
    const dateB = new Date(b.event_start_time || 0).getTime();
    if (dateA === 0 && dateB === 0) return 0;
    if (dateA === 0) return 1;
    if (dateB === 0) return -1;
    return dateA - dateB;
  });

  // Sort past by START date descending (most recent first)
  pastEvents.sort((a, b) => {
    const dateA = new Date(a.event_start_time || 0).getTime();
    const dateB = new Date(b.event_start_time || 0).getTime();
    return dateB - dateA;
  });

  if (upcomingEvents.length === 0 && pastEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[var(--radius-xl)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/30 backdrop-blur-sm p-12 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-emerald-500/10 p-4 rounded-full mb-4 ring-1 ring-emerald-500/20">
          <TicketIcon className="h-8 w-8 text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No tickets yet</h3>
        <p className="text-[var(--color-secondary)] mb-6 max-w-sm">
          You haven't purchased any tickets yet. Explore upcoming events to find your next experience.
        </p>
        <Button asChild variant="mint" size="lg" className="rounded-full shadow-lg shadow-emerald-500/20">
          <Link href="/browse-events">Browse Events</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {upcomingEvents.length > 0 && (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">Upcoming Events</h2>
            <span className="flex items-center justify-center min-w-[1.5rem] h-6 rounded-full bg-emerald-500 text-[11px] font-bold text-black px-2 shadow-[0_0_10px_rgba(16,185,129,0.4)]">
              {upcomingEvents.length}
            </span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map(t => <TicketCard key={t.id} ticket={t} />)}
          </div>
        </section>
      )}

      {pastEvents.length > 0 && (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <h2 className="text-2xl font-bold text-slate-500 tracking-tight">Past Events</h2>
            <span className="flex items-center justify-center min-w-[1.5rem] h-6 rounded-full bg-slate-800 text-[11px] font-bold text-slate-400 px-2 border border-slate-700">
              {pastEvents.length}
            </span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 opacity-60 grayscale-[0.3] hover:opacity-100 hover:grayscale-0 transition-all duration-500">
            {pastEvents.map(t => <TicketCard key={t.id} ticket={t} />)}
          </div>
        </section>
      )}
    </div>
  );
}
