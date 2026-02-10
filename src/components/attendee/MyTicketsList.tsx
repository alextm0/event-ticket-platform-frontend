"use client";

import { useState, useMemo } from "react";
import { parse } from "date-fns";
import type Ticket from "@/types/ticket-model";
import TicketCard from "./TicketCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Ticket as TicketIcon, AlertCircle, Search, X, Calendar } from "lucide-react";
import { DateFilterInput } from "@/components/ui/date-filter-input";

function parseDateDMY(value: string): Date | null {
  if (!value?.trim()) return null;
  const normalized = value.trim().replace(/\//g, ".");
  try {
    const d = parse(normalized, "d.M.yyyy", new Date());
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

interface MyTicketsListProps {
  tickets: Ticket[];
  error?: string | null;
}

export default function MyTicketsList({ tickets, error }: MyTicketsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { upcomingEvents, pastEvents, filteredUpcoming, filteredPast } = useMemo(() => {
    const now = new Date();
    const upcoming: Ticket[] = [];
    const past: Ticket[] = [];

    tickets.forEach(ticket => {
      let eventDate = now;
      if (ticket.event_end_time) {
        eventDate = new Date(ticket.event_end_time);
      } else if (ticket.event_start_time) {
        eventDate = new Date(ticket.event_start_time);
      } else {
        upcoming.push(ticket);
        return;
      }

      if (eventDate < now) {
        past.push(ticket);
      } else {
        upcoming.push(ticket);
      }
    });

    // Sort upcoming by START date ascending (soonest first)
    upcoming.sort((a, b) => {
      const dateA = new Date(a.event_start_time || 0).getTime();
      const dateB = new Date(b.event_start_time || 0).getTime();
      if (dateA === 0 && dateB === 0) return 0;
      if (dateA === 0) return 1;
      if (dateB === 0) return -1;
      return dateA - dateB;
    });

    // Sort past by START date descending (most recent first)
    past.sort((a, b) => {
      const dateA = new Date(a.event_start_time || 0).getTime();
      const dateB = new Date(b.event_start_time || 0).getTime();
      return dateB - dateA;
    });

    // Apply search filter
    const filterTickets = (ticketList: Ticket[]) => {
      if (!searchQuery.trim()) return ticketList;
      const query = searchQuery.toLowerCase();
      return ticketList.filter(ticket =>
        ticket.event_title?.toLowerCase().includes(query) ||
        ticket.event_location?.toLowerCase().includes(query) ||
        ticket.ticket_type_name?.toLowerCase().includes(query) ||
        ticket.status?.toLowerCase().includes(query)
      );
    };

    // Apply date filter (event start/end)
    const filterByDate = (ticketList: Ticket[]) => {
      let list = ticketList;
      const filterStart = parseDateDMY(startDate);
      if (filterStart) {
        const start = new Date(filterStart);
        start.setHours(0, 0, 0, 0);
        list = list.filter((t) => {
          const eventStart = t.event_start_time ? new Date(t.event_start_time) : null;
          if (!eventStart) return false;
          const eventStartDay = new Date(eventStart);
          eventStartDay.setHours(0, 0, 0, 0);
          return eventStartDay >= start;
        });
      }
      const filterEnd = parseDateDMY(endDate);
      if (filterEnd) {
        const end = new Date(filterEnd);
        end.setHours(23, 59, 59, 999);
        list = list.filter((t) => {
          const eventEnd = t.event_end_time ? new Date(t.event_end_time) : t.event_start_time ? new Date(t.event_start_time) : null;
          if (!eventEnd) return false;
          return eventEnd <= end;
        });
      }
      return list;
    };

    const searchFilteredUpcoming = filterTickets(upcoming);
    const searchFilteredPast = filterTickets(past);
    const dateFilteredUpcoming = filterByDate(searchFilteredUpcoming);
    const dateFilteredPast = filterByDate(searchFilteredPast);

    return {
      upcomingEvents: upcoming,
      pastEvents: past,
      filteredUpcoming: dateFilteredUpcoming,
      filteredPast: dateFilteredPast,
    };
  }, [tickets, searchQuery, startDate, endDate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[var(--radius-xl)] border border-red-500/20 bg-red-500/5 p-12 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-red-500/10 p-4 rounded-full mb-4 ring-1 ring-red-500/20">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Oops! Something went wrong</h3>
        <p className="text-slate-400 mb-6 max-w-sm">
          {error}
        </p>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full border-white/10 hover:bg-white/5">
          Try Again
        </Button>
      </div>
    );
  }

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

  // Determine which tickets to display based on filter
  const showUpcoming = filter === "all" || filter === "upcoming";
  const showPast = filter === "all" || filter === "past";
  const displayedUpcoming = showUpcoming ? filteredUpcoming : [];
  const displayedPast = showPast ? filteredPast : [];
  const hasActiveFilters = searchQuery.trim() || filter !== "all" || startDate || endDate;
  const hasNoResults = displayedUpcoming.length === 0 && displayedPast.length === 0 && hasActiveFilters;

  const clearFilters = () => {
    setSearchQuery("");
    setFilter("all");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="space-y-8">
      {/* Search and Filter Bar */}
      <div className="flex flex-wrap gap-4 items-center bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by event, location, ticket type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={filter === "all" ? "mint" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className={filter !== "all" ? "bg-transparent border-white/10 text-slate-300 hover:text-white" : ""}
          >
            All ({upcomingEvents.length + pastEvents.length})
          </Button>
          <Button
            variant={filter === "upcoming" ? "mint" : "outline"}
            size="sm"
            onClick={() => setFilter("upcoming")}
            className={filter !== "upcoming" ? "bg-transparent border-white/10 text-slate-300 hover:text-white" : ""}
          >
            Upcoming ({upcomingEvents.length})
          </Button>
          <Button
            variant={filter === "past" ? "mint" : "outline"}
            size="sm"
            onClick={() => setFilter("past")}
            className={filter !== "past" ? "bg-transparent border-white/10 text-slate-300 hover:text-white" : ""}
          >
            Past ({pastEvents.length})
          </Button>
        </div>
        <div className="flex items-center gap-2 flex-wrap border-l border-white/10 pl-4">
          <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-sm text-slate-400 shrink-0">Start:</span>
          <DateFilterInput value={startDate} onChange={setStartDate} placeholder="e.g. 2.7.2026" />
          <span className="text-sm text-slate-400 shrink-0">End:</span>
          <DateFilterInput value={endDate} onChange={setEndDate} placeholder="e.g. 15.7.2026" />
        </div>
        {hasActiveFilters && (
          <Button variant="link" size="sm" className="text-emerald-400 shrink-0" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {/* No Results State */}
      {hasNoResults && (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in zoom-in duration-300">
          <Search className="h-12 w-12 text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No tickets found</h3>
          <p className="text-slate-400 mb-4">
            No tickets match your filters.
          </p>
          <Button
            variant="outline"
            onClick={clearFilters}
            className="border-white/10 hover:bg-white/5"
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* Tickets List */}
      {!hasNoResults && (
        <div className="space-y-16">
          {displayedUpcoming.length > 0 && (
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <h2 className="text-2xl font-bold text-white tracking-tight">Upcoming Events</h2>
                <span className="flex items-center justify-center min-w-[1.5rem] h-6 rounded-full bg-emerald-500 text-[11px] font-bold text-black px-2 shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                  {displayedUpcoming.length}
                </span>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {displayedUpcoming.map(t => <TicketCard key={t.id} ticket={t} />)}
              </div>
            </section>
          )}

          {displayedPast.length > 0 && (
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <h2 className="text-2xl font-bold text-slate-500 tracking-tight">Past Events</h2>
                <span className="flex items-center justify-center min-w-[1.5rem] h-6 rounded-full bg-slate-800 text-[11px] font-bold text-slate-400 px-2 border border-slate-700">
                  {displayedPast.length}
                </span>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 opacity-60 grayscale-[0.3] hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                {displayedPast.map(t => <TicketCard key={t.id} ticket={t} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
