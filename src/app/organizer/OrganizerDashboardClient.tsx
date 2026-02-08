"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Event } from "@/types";
import { OrganizerEventCard } from "@/components/organizer/OrganizerEventCard";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar } from "lucide-react";
import { DateFilterInput } from "@/components/ui/date-filter-input";
import { parse } from "date-fns";

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

interface OrganizerDashboardClientProps {
    initialEvents: Event[];
}

export default function OrganizerDashboardClient({ initialEvents }: OrganizerDashboardClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const filteredEvents = useMemo(() => {
        return initialEvents.filter((event) => {
            // Search filter
            const matchesSearch =
                !searchQuery.trim() ||
                event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                event.location.toLowerCase().includes(searchQuery.toLowerCase());

            // Date filter: All / Upcoming / Past
            const eventDate = new Date(event.startTime);
            const now = new Date();
            now.setHours(0, 0, 0, 0);

            let matchesDate = true;
            if (filter === "upcoming") {
                matchesDate = eventDate >= now;
            } else if (filter === "past") {
                matchesDate = eventDate < now;
            }

            // Filter by start date: event starts on or after this date
            const filterStart = parseDateDMY(startDate);
            if (filterStart) {
                const start = new Date(filterStart);
                start.setHours(0, 0, 0, 0);
                const eventStartDay = new Date(eventDate);
                eventStartDay.setHours(0, 0, 0, 0);
                matchesDate = matchesDate && eventStartDay >= start;
            }

            // Filter by end date: event ends on or before this date
            const filterEnd = parseDateDMY(endDate);
            if (filterEnd) {
                const end = new Date(filterEnd);
                end.setHours(23, 59, 59, 999);
                const eventEnd = new Date(event.endTime);
                matchesDate = matchesDate && eventEnd <= end;
            }

            return matchesSearch && matchesDate;
        });
    }, [initialEvents, searchQuery, filter, startDate, endDate]);

    const hasActiveFilters = searchQuery.trim() || filter !== "all" || startDate || endDate;

    const clearFilters = () => {
        setSearchQuery("");
        setFilter("all");
        setStartDate("");
        setEndDate("");
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <PageHeader title="Organizer Dashboard">
                <Button asChild variant="mint">
                    <Link href="/organizer/create-event">Create Event</Link>
                </Button>
            </PageHeader>

            {initialEvents.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-[var(--color-secondary)] text-lg mb-6">
                        You haven&apos;t created any events yet.
                    </p>
                    <Button asChild variant="mint">
                        <Link href="/organizer/create-event">Create Your First Event</Link>
                    </Button>
                </div>
            ) : (
                <>
                    {/* Filter Bar */}
                    <div className="flex flex-wrap gap-4 items-center mb-8 p-4 rounded-2xl border border-white/10 bg-white/5">
                        <div className="relative w-full md:w-80 shrink-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search events, locations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50"
                            />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Button
                                variant={filter === "all" ? "mint" : "outline"}
                                size="sm"
                                onClick={() => setFilter("all")}
                                className={filter !== "all" ? "bg-transparent border-white/10 text-slate-300 hover:text-white" : ""}
                            >
                                All Events
                            </Button>
                            <Button
                                variant={filter === "upcoming" ? "mint" : "outline"}
                                size="sm"
                                onClick={() => setFilter("upcoming")}
                                className={filter !== "upcoming" ? "bg-transparent border-white/10 text-slate-300 hover:text-white" : ""}
                            >
                                Upcoming
                            </Button>
                            <Button
                                variant={filter === "past" ? "mint" : "outline"}
                                size="sm"
                                onClick={() => setFilter("past")}
                                className={filter !== "past" ? "bg-transparent border-white/10 text-slate-300 hover:text-white" : ""}
                            >
                                Past
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

                    {/* Results */}
                    {filteredEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="rounded-full bg-white/5 p-6 mb-4">
                                <Calendar className="h-10 w-10 text-slate-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
                            <p className="text-slate-400 max-w-md">
                                No events match your filters. Try adjusting your search or date range.
                            </p>
                            <Button variant="link" className="text-emerald-400 mt-4" onClick={clearFilters}>
                                Clear all filters
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredEvents.map((event) => (
                                <OrganizerEventCard key={event.id} event={event} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
