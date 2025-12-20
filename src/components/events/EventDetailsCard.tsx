import { PublishedEvent } from "@/types";
import { Calendar, MapPin, User, Clock } from "lucide-react";

interface EventDetailsCardProps {
    event: PublishedEvent;
}

export function EventDetailsCard({ event }: EventDetailsCardProps) {
    return (
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-6 backdrop-blur-md">
            <h2 className="mb-6 text-xl font-semibold text-white">Event Details</h2>
            <dl className="space-y-6">
                <div className="flex items-start justify-between border-b border-[var(--color-border)] pb-4">
                    <dt className="flex items-center gap-2 text-[var(--color-secondary)]">
                        <MapPin className="h-4 w-4 text-[var(--color-primary)]" />
                        Location
                    </dt>
                    <dd className="text-right font-medium text-white">{event.location}</dd>
                </div>
                <div className="flex items-start justify-between border-b border-[var(--color-border)] pb-4">
                    <dt className="flex items-center gap-2 text-[var(--color-secondary)]">
                        <Calendar className="h-4 w-4 text-[var(--color-primary)]" />
                        Start Time
                    </dt>
                    <dd className="text-right font-medium text-white" suppressHydrationWarning>
                        {new Date(event.startTime).toLocaleString(undefined, {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </dd>
                </div>
                <div className="flex items-start justify-between border-b border-[var(--color-border)] pb-4">
                    <dt className="flex items-center gap-2 text-[var(--color-secondary)]">
                        <Clock className="h-4 w-4 text-[var(--color-primary)]" />
                        End Time
                    </dt>
                    <dd className="text-right font-medium text-white" suppressHydrationWarning>
                        {new Date(event.endTime).toLocaleString(undefined, {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </dd>
                </div>
                <div className="flex items-start justify-between">
                    <dt className="flex items-center gap-2 text-[var(--color-secondary)]">
                        <User className="h-4 w-4 text-[var(--color-primary)]" />
                        Organizer
                    </dt>
                    <dd className="text-right font-medium text-white">
                        {event.organizerName ?? "TBD"}
                    </dd>
                </div>
            </dl>
        </div>
    );
}
