"use client";

import { useState } from "react";
import { ValidationLogsList } from "@/components/staff/ValidationLogsList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AssignedEvent {
  eventId: string;
  eventName: string;
}

interface ValidationLogsClientProps {
  initialEvents: AssignedEvent[];
}

export function ValidationLogsClient({ initialEvents }: ValidationLogsClientProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>(
    initialEvents.length > 0 ? initialEvents[0].eventId : "",
  );

  const selectedEvent = initialEvents.find((e) => e.eventId === selectedEventId);

  if (initialEvents.length === 0) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-8 backdrop-blur-md text-center">
        <p className="text-sm text-[var(--color-secondary)] mb-4">
          You are not assigned to any events yet.
        </p>
        <p className="text-xs text-[var(--color-secondary)]">
          Contact an organizer to be assigned to an event.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <label htmlFor="event-select" className="text-sm font-medium text-white">
          Filter by Event:
        </label>
        <Select value={selectedEventId} onValueChange={setSelectedEventId}>
          <SelectTrigger
            id="event-select"
            className="w-[300px] bg-[var(--color-background)] border-[var(--color-border)] focus:border-[var(--color-primary)]"
          >
            <SelectValue placeholder="Select an event" />
          </SelectTrigger>
          <SelectContent className="bg-[var(--color-surface)] border-[var(--color-border)]">
            {initialEvents.map((event) => (
              <SelectItem key={event.eventId} value={event.eventId}>
                {event.eventName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedEventId && (
        <ValidationLogsList
          eventId={selectedEventId}
          eventName={selectedEvent?.eventName}
        />
      )}
    </div>
  );
}

