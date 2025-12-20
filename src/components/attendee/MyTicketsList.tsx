"use client";

import { useState } from "react";
import type Ticket from "@/types/ticket-model";
import TicketCard from "./TicketCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

interface MyTicketsListProps {
  tickets: Ticket[];
}

export default function MyTicketsList({ tickets }: MyTicketsListProps) {
  const [sortCriteria, setSortCriteria] = useState<string>("created_at_desc");

  // Sorting logic
  const sortedTickets = [...tickets].sort((a, b) => {
    switch (sortCriteria) {
      case "created_at_desc":
        return a.created_at > b.created_at ? -1 : 1;
      case "created_at_asc":
        return a.created_at < b.created_at ? -1 : 1;
      case "status_asc":
        return a.status.localeCompare(b.status);
      case "status_desc":
        return b.status.localeCompare(a.status);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="w-[200px]">
            <Select value={sortCriteria} onValueChange={setSortCriteria}>
              <SelectTrigger className="bg-[var(--color-surface)] border-[var(--color-border)] text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--color-surface)] border-[var(--color-border)] text-white">
                <SelectItem value="created_at_desc">Newest First</SelectItem>
                <SelectItem value="created_at_asc">Oldest First</SelectItem>
                <SelectItem value="status_asc">Status (A-Z)</SelectItem>
                <SelectItem value="status_desc">Status (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Placeholder for future filter implementations if needed */}
          {/* <Button variant="outline" size="icon" className="border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface)]/80 text-[var(--color-primary)]">
            <SlidersHorizontal className="h-4 w-4" />
          </Button> */}
        </div>

        <div className="text-sm text-[var(--color-secondary)]">
          Showing {sortedTickets.length} ticket{sortedTickets.length !== 1 && "s"}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {sortedTickets.length > 0 ? (
          sortedTickets.map((ticket) => (
            <TicketCard key={String(ticket.id)} ticket={ticket} />
          ))
        ) : (
          <div className="col-span-full py-12 text-center rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]/30 backdrop-blur-sm">
            <p className="text-[var(--color-secondary)]">You don't have any tickets yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
