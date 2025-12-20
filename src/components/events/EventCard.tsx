"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, User } from "lucide-react";
import { PublishedEvent } from "@/types";

interface EventCardProps {
    event: PublishedEvent;
}

export function EventCard({ event }: EventCardProps) {
    return (
        <article className="group relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-[var(--color-primary)]/50 hover:shadow-[var(--color-primary)]/10">
            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold text-white group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
                        {event.title}
                    </h2>
                    <p className="mt-2 text-sm text-[var(--color-secondary)] line-clamp-2">
                        {event.description}
                    </p>
                </div>

                <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2 text-sm text-[var(--color-secondary)]">
                        <MapPin className="h-4 w-4 text-[var(--color-primary)]" />
                        <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--color-secondary)]">
                        <Calendar className="h-4 w-4 text-[var(--color-primary)]" />
                        <span suppressHydrationWarning>{new Date(event.startTime).toLocaleDateString()}</span>

                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--color-secondary)]">
                        <User className="h-4 w-4 text-[var(--color-primary)]" />
                        <span>{event.organizerName ?? "Organizer"}</span>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <Button asChild className="w-full" variant="mint">
                    <Link href={`/events/${event.id}`}>View Details</Link>
                </Button>
            </div>
        </article>
    );
}
