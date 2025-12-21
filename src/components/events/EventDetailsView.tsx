"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, Clock, User, Share2, Users, FileText, BarChart3, Settings, Ticket } from "lucide-react";
import { GoogleMapEmbed } from "@/components/ui/google-map-embed";
import { Button } from "@/components/ui/button";
import { StaffManagement } from "@/components/organizer/StaffManagement";
import { TicketTypeList } from "@/components/events/TicketTypeList";
import { TicketTypeManagementWrapper } from "@/components/organizer/TicketTypeManagementWrapper";
import { TicketSalesPreview } from "@/components/organizer/TicketSalesPreview";
import { OrganizerManagementBar } from "@/components/organizer/OrganizerManagementBar";
import { EventAnalytics } from "@/components/organizer/EventAnalytics";
import { PublishedEvent, StaffMember, TicketType } from "@/types";
import { cn } from "@/lib/utils";

interface EventDetailsViewProps {
    event: PublishedEvent;
    ticketTypes: TicketType[];
    isOrganizer: boolean;
    assignedStaff: StaffMember[];
    availableStaff: StaffMember[];
}

export function EventDetailsView({
    event,
    ticketTypes,
    isOrganizer,
    assignedStaff,
    availableStaff
}: EventDetailsViewProps) {
    const [activeTab, setActiveTab] = useState<"overview" | "staff" | "analytics" | "tickets">("overview");

    const startDate = new Date(event.startTime);
    const coverImage = "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=2074&auto=format&fit=crop";

    return (
        <div className="min-h-screen bg-[var(--color-background)] pb-20">

            {/* Hero Section - Redesigned */}
            <div className="relative w-full h-[50vh] min-h-[500px] flex items-end">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center z-0"
                    style={{ backgroundImage: `url('${coverImage}')` }}
                />

                {/* Gradient Overlay - Darker at bottom for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/60 to-transparent z-10" />

                {/* Content Overlay */}
                <div className="relative z-20 w-full max-w-7xl mx-auto px-6 lg:px-8 pb-12">
                    <div className="mb-6">
                        <Link
                            href="/browse-events"
                            className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-all bg-black/40 hover:bg-black/60 px-4 py-2 rounded-full backdrop-blur-md border border-white/10"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to events
                        </Link>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight drop-shadow-2xl mb-4 text-balance">
                        {event.title}
                    </h1>

                    <div className="flex flex-col md:flex-row md:items-center gap-6 text-slate-300">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-emerald-400" />
                            <span className="text-lg font-medium">
                                {startDate.toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                        <div className="hidden md:block w-px h-6 bg-white/20" />
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-emerald-400" />
                            <span className="text-lg font-medium">
                                {startDate.toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-8">
                {isOrganizer && (
                    <div className="block lg:hidden mb-8">
                        <OrganizerManagementBar event={event} />
                    </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">

                    {/* Left Column (70%) */}
                    <div className="lg:col-span-7 space-y-8">

                        {/* Tabs Navigation */}
                        <div className="flex items-center gap-2 border-b border-white/10 pb-1">
                            <TabButton
                                active={activeTab === "overview"}
                                onClick={() => setActiveTab("overview")}
                                icon={<FileText className="w-4 h-4" />}
                                label="Overview"
                            />
                            {isOrganizer && (
                                <>
                                    <TabButton
                                        active={activeTab === "staff"}
                                        onClick={() => setActiveTab("staff")}
                                        icon={<Users className="w-4 h-4" />}
                                        label="Staff"
                                    />
                                    <TabButton
                                        active={activeTab === "tickets"}
                                        onClick={() => setActiveTab("tickets")}
                                        icon={<Ticket className="w-4 h-4" />}
                                        label="Tickets"
                                    />
                                    <TabButton
                                        active={activeTab === "analytics"}
                                        onClick={() => setActiveTab("analytics")}
                                        icon={<BarChart3 className="w-4 h-4" />}
                                        label="Analytics"
                                    />
                                </>
                            )}
                        </div>

                        {/* Tab Content: Overview */}
                        {activeTab === "overview" && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Description */}
                                <section className="space-y-4">
                                    <h3 className="text-2xl font-bold text-white">About this Event</h3>
                                    <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                                        <p className="whitespace-pre-wrap">{event.description}</p>
                                    </div>
                                </section>

                                {/* Host Info */}
                                <section className="flex items-center gap-4 bg-[var(--color-surface)]/50 p-6 rounded-xl border border-white/5">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-black/20">
                                        {event.organizerName?.charAt(0) ?? "O"}
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Hosted by</p>
                                        <p className="text-white font-bold text-lg">{event.organizerName ?? "Event Organizer"}</p>
                                    </div>
                                </section>

                                {/* Location (Map) */}
                                <section className="space-y-6">
                                    <h3 className="text-2xl font-bold text-white">Location</h3>

                                    <div className="bg-[var(--color-surface)] rounded-2xl p-1 border border-white/10 shadow-xl overflow-hidden">
                                        <div className="bg-[var(--color-background)]/50 px-6 py-4 border-b border-white/5 flex items-start gap-4">
                                            <div className="p-2 bg-emerald-500/10 rounded-lg shrink-0">
                                                <MapPin className="w-6 h-6 text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-white font-semibold text-lg leading-tight">{event.location}</p>
                                                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`} target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300 text-sm mt-1 inline-block">
                                                    Get Directions &rarr;
                                                </a>
                                            </div>
                                        </div>
                                        <div className="h-[400px] w-full relative grayscale-[50%] hover:grayscale-0 transition-all duration-500">
                                            <GoogleMapEmbed location={event.location} className="h-full w-full" />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* Tab Content: Staff Management */}
                        {activeTab === "staff" && isOrganizer && (
                            <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-white/10 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <StaffManagement
                                    eventId={event.id}
                                    assignedStaff={assignedStaff}
                                    availableStaff={availableStaff}
                                />
                            </div>
                        )}

                        {/* Tab Content: Tickets Management */}
                        {activeTab === "tickets" && isOrganizer && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <TicketTypeManagementWrapper eventId={event.id} ticketTypes={ticketTypes} />
                            </div>
                        )}

                        {/* Tab Content: Analytics */}
                        {activeTab === "analytics" && isOrganizer && (
                            <EventAnalytics eventId={event.id} ticketTypes={ticketTypes} />
                        )}
                    </div>

                    {/* Right Column (30%) - Sticky Sidebar */}
                    <div className="lg:col-span-3 relative lg:pt-12">
                        <div className="sticky top-28 space-y-6">
                            {isOrganizer && (
                                <div className="hidden lg:block">
                                    <OrganizerManagementBar event={event} />
                                </div>
                            )}
                            <div className="bg-[var(--color-surface)] rounded-xl border border-white/10 shadow-2xl overflow-hidden">
                                <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Settings className="w-5 h-5 text-emerald-400" />
                                        {isOrganizer ? "Ticket Preview" : "Select Tickets"}
                                    </h3>
                                </div>

                                <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                    {isOrganizer ? (
                                        <TicketSalesPreview ticketTypes={ticketTypes} />
                                    ) : (
                                        <TicketTypeList eventId={event.id} ticketTypes={ticketTypes} />
                                    )}
                                </div>

                                <div className="p-4 bg-[var(--color-background)]/50 border-t border-white/5 text-center">
                                    <p className="text-xs text-slate-500">Secure payment via Stripe</p>
                                </div>
                            </div>

                            <Button variant="ghost" className="w-full justify-center gap-2 text-slate-400 hover:text-white hover:bg-white/5">
                                <Share2 className="w-4 h-4" /> Share Event
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200",
                active
                    ? "border-emerald-500 text-emerald-400"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
            )}
        >
            {icon}
            {label}
        </button>
    );
}
