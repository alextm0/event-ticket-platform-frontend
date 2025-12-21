"use client";

import { useState, useMemo } from "react";
import { PublishedEvent } from "@/types";
import { EventCard } from "@/components/events/EventCard";
import { Input } from "@/components/ui/input";
import { Search, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BrowseEventsClientProps {
    initialEvents: PublishedEvent[];
}

export default function BrowseEventsClient({ initialEvents }: BrowseEventsClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

    const filteredEvents = useMemo(() => {
        return initialEvents.filter((event) => {
            // Search filter
            const matchesSearch =
                event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.location.toLowerCase().includes(searchQuery.toLowerCase());

            // Date filter
            const eventDate = new Date(event.startTime);
            const now = new Date();
            let matchesDate = true;

            if (filter === "upcoming") {
                matchesDate = eventDate >= now;
            } else if (filter === "past") {
                matchesDate = eventDate < now;
            }

            return matchesSearch && matchesDate;
        });
    }, [initialEvents, searchQuery, filter]);

    return (
        <div className="space-y-8">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search events, locations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
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
                    {/* Only show Past option if there are past events to save space if not needed? No, standard filter is better. */}
                </div>
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
                    <Button
                        variant="link"
                        className="text-emerald-400 mt-4"
                        onClick={() => { setSearchQuery(""); setFilter("all"); }}
                    >
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
