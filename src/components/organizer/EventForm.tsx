"use client";

import * as React from "react";
import { useState } from "react";
import { Loader2, Check, X, MapPin, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { createEventAction, updateEventAction } from "@/app/organizer/actions";
import { Event } from "@/types";
import { GoogleMapEmbed } from "@/components/ui/google-map-embed";

export default function EventForm({ initialData }: { initialData?: Event }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Location state with debounce
    const [location, setLocation] = useState(initialData?.location || "");
    const [debouncedLocation, setDebouncedLocation] = useState(location);

    const [isCheckingLocation, setIsCheckingLocation] = useState(false);
    const [locationValidity, setLocationValidity] = useState<boolean | null>(initialData?.location ? true : null);

    // Suggestions state
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const blurTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    // Clean up timeout on unmount
    React.useEffect(() => {
        return () => {
            if (blurTimeoutRef.current) {
                clearTimeout(blurTimeoutRef.current);
            }
        };
    }, []);

    // Debounce and Validate Location
    React.useEffect(() => {
        const controller = new AbortController();
        const timer = setTimeout(() => {
            if (location.trim()) {
                setDebouncedLocation(location);
                validateLocation(location, controller.signal);
            } else {
                setDebouncedLocation("");
                setLocationValidity(null);
                setSuggestions([]);
            }
        }, 1000); // 1s debounce

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [location]);

    const validateLocation = async (query: string, signal?: AbortSignal) => {
        setIsCheckingLocation(true);
        try {
            // Fetch 5 results for suggestions
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
                {
                    signal,
                    headers: {
                        "User-Agent": "EventTicketPlatform/1.0 (contact@eventticketplatform.com)",
                        "Referer": typeof window !== "undefined" ? window.location.origin : ""
                    }
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Location search failed (${response.status}): ${errorText}`);
            }

            const data = await response.json();

            if (data && data.length > 0) {
                setLocationValidity(true);
                setSuggestions(data);
                if (document.activeElement?.id === "location") {
                    setShowSuggestions(true);
                }
            } else {
                setLocationValidity(false);
                setSuggestions([]);
                setShowSuggestions(false);
            }
        } catch (error: any) {
            if (error.name === 'AbortError') return;
            console.warn("Location validation failed (network error):", error);
            setLocationValidity(null);
            setSuggestions([]);
        } finally {
            if (!signal?.aborted) {
                setIsCheckingLocation(false);
            }
        }
    };

    const handleSuggestionClick = (suggestion: any) => {
        setLocation(suggestion.display_name);
        setDebouncedLocation(suggestion.display_name); // Immediate update for map
        setLocationValidity(true);
        setShowSuggestions(false);
    };

    // Default to today + 1 hour for start, today + 3 hours for end
    const [startDate, setStartDate] = useState<Date | undefined>(() => {
        if (initialData?.startTime) return new Date(initialData.startTime);
        const d = new Date();
        d.setHours(d.getHours() + 1, 0, 0, 0);
        return d;
    });
    const [endDate, setEndDate] = useState<Date | undefined>(() => {
        if (initialData?.endTime) return new Date(initialData.endTime);
        const d = new Date();
        d.setHours(d.getHours() + 3, 0, 0, 0);
        return d;
    });

    async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        // Block submit if location is explicitly invalid
        if (locationValidity === false) {
            setError("Please enter a valid location recognized by maps.");
            setLoading(false);
            return;
        }

        const formData = new FormData(event.currentTarget);
        const now = new Date();

        if (!startDate || !endDate) {
            setError("Please select both start and end dates.");
            setLoading(false);
            return;
        }

        // Only enforce future start date if creating a new event
        if (!initialData && startDate < now) {
            setError("Start time must be in the future.");
            setLoading(false);
            return;
        }

        if (endDate <= startDate) {
            setError("End time must be after start time.");
            setLoading(false);
            return;
        }

        formData.set("startTime", startDate.toISOString());
        formData.set("endTime", endDate.toISOString());

        try {
            if (initialData) {
                await updateEventAction(initialData.id, formData);
            } else {
                await createEventAction(formData);
            }
        } catch (err: any) {
            // Next.js redirect() throws an error that should be allowed to bubble up
            // or handled specifically. In client components, we usually just don't catch it
            // if we want the redirect to happen.
            if (err.message === "NEXT_REDIRECT") {
                return;
            }
            console.error(err);
            setError(`Failed to ${initialData ? 'update' : 'create'} event. Information might be invalid or there was a server error.`);
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleFormSubmit} className="space-y-6 bg-[var(--color-surface)] p-8 rounded-2xl border border-[var(--color-border)] shadow-xl w-full">
            {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-200">Event Title</Label>
                <Input
                    id="title"
                    name="title"
                    placeholder="e.g. Summer Music Festival"
                    required
                    defaultValue={initialData?.title}
                    className="bg-[var(--color-background)] border-[var(--color-border)] focus:border-emerald-500 focus:ring-emerald-500/20 h-11"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-200">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your event..."
                    required
                    defaultValue={initialData?.description}
                    className="min-h-[120px] bg-[var(--color-background)] border-[var(--color-border)] focus:border-emerald-500 focus:ring-emerald-500/20"
                />
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="location" className="text-slate-200">Location</Label>
                    <div className="relative group">
                        <Input
                            id="location"
                            name="location"
                            placeholder="e.g. Central Park, New York"
                            required
                            value={location}
                            onChange={(e) => {
                                setLocation(e.target.value);
                                if (locationValidity !== null) setLocationValidity(null);
                            }}
                            onFocus={() => {
                                if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
                                if (suggestions.length > 0) setShowSuggestions(true);
                            }}
                            onBlur={() => {
                                // Delay hiding to allow click event to register
                                if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
                                blurTimeoutRef.current = setTimeout(() => setShowSuggestions(false), 200);
                            }}
                            autoComplete="off"
                            className={cn(
                                "bg-[var(--color-background)] border-[var(--color-border)] focus:ring-emerald-500/20 h-11 pr-10",
                                locationValidity === true && "border-emerald-500/50 focus:border-emerald-500",
                                locationValidity === false && "border-red-500/50 focus:border-red-500"
                            )}
                        />
                        <div className="absolute right-3 top-3 transition-opacity duration-300">
                            {isCheckingLocation ? (
                                <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
                            ) : locationValidity === true ? (
                                <Check className="h-5 w-5 text-emerald-500" />
                            ) : locationValidity === false ? (
                                <X className="h-5 w-5 text-red-500" />
                            ) : (
                                <MapPin className="h-5 w-5 text-slate-500" />
                            )}
                        </div>

                        {/* Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <ul className="max-h-[200px] overflow-y-auto py-1">
                                    {suggestions.map((item, index) => (
                                        <li
                                            key={index}
                                            onClick={() => handleSuggestionClick(item)}
                                            className="px-4 py-2.5 hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] cursor-pointer text-sm text-slate-300 transition-colors flex items-start gap-2 border-b border-[var(--color-border)]/50 last:border-0"
                                        >
                                            <MapPin className="h-4 w-4 mt-0.5 shrink-0 opacity-50" />
                                            <span className="line-clamp-2">{item.display_name}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="px-2 py-1 bg-black/20 text-[10px] text-right text-slate-500">
                                    Powered by OpenStreetMap
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Validation Feedback Message */}
                    <div className="flex justify-between items-start">
                        <p className={cn(
                            "text-xs transition-colors",
                            locationValidity === true ? "text-emerald-400" :
                                locationValidity === false ? "text-red-400" : "text-slate-500"
                        )}>
                            {isCheckingLocation ? "Verifying location..." :
                                locationValidity === true ? "Location verified." :
                                    locationValidity === false ? "Location not found. Please try a more specific address." :
                                        "Type a location to see the map preview."}
                        </p>
                    </div>
                </div>

                {/* Map Preview */}
                {(locationValidity === true || locationValidity === null) && (
                    <div className={cn(
                        "h-[250px] w-full rounded-xl overflow-hidden border border-white/10 shadow-inner bg-black/20 relative transition-all duration-500",
                        locationValidity === null && !debouncedLocation ? "opacity-50 grayscale" : "opacity-100"
                    )}>
                        <GoogleMapEmbed location={debouncedLocation || "World"} />
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-white/70 pointer-events-none">
                            Live Preview
                        </div>
                    </div>
                )}
            </div>

            {initialData && (
                <input type="hidden" name="status" value={initialData.status} />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DateTimePicker
                    label="Start Date & Time"
                    date={startDate}
                    setDate={setStartDate}
                    minDate={new Date()}
                />
                <DateTimePicker
                    label="End Date & Time"
                    date={endDate}
                    setDate={setEndDate}
                    minDate={startDate || new Date()}
                />
            </div>

            <div className="pt-4 flex justify-end gap-4">
                <Button variant="outline" type="button" onClick={() => window.history.back()} className="h-11 px-8 border-[var(--color-border)]">
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="mint"
                    disabled={loading}
                    className="min-w-[140px] h-11 px-8"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {initialData ? "Updating..." : "Creating..."}
                        </>
                    ) : (
                        initialData ? "Update Event" : "Create Event"
                    )}
                </Button>
            </div>
        </form>
    );
}
