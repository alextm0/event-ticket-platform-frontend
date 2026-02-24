"use client";

import { useState, useMemo } from "react";
import { PublishedEvent } from "@/types";
import { EventCard } from "@/components/events/EventCard";
import { Input } from "@/components/ui/input";
import { Search, Calendar } from "lucide-react";
import { DateFilterInput } from "@/components/ui/date-filter-input";
import { Button } from "@/components/ui/button";
import { parseDateDMY } from "@/lib/utils";

interface BrowseEventsClientProps {
    initialEvents: PublishedEvent[];
}

export default function BrowseEventsClient({ initialEvents }: BrowseEventsClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const filteredEvents = useMemo(() => {
        return initialEvents.filter((event) => {
            // Search filter
            const matchesSearch =
                event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        <div className="space-y-8">
            {/* Search and Filters */}
            <div className="flex flex-wrap gap-4 items-center p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
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

            {/* Results Grid */}
            {filteredEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="rounded-full bg-white/5 p-6 mb-4">
                        <Calendar className="h-10 w-10 text-slate-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
                    <p className="text-slate-400 max-w-md">
                        We couldn't find any events matching your search criteria. Try adjusting your filters or search terms.
                    </p>
                    <Button variant="link" className="text-emerald-400 mt-4" onClick={clearFilters}>
                        Clear all filters
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {filteredEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            )}
        </div>
    );
}
