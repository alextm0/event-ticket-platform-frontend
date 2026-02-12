"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, Clock, User, Share2, Users, FileText, BarChart3, Settings, Ticket, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TicketSalesPreview } from "@/components/organizer/TicketSalesPreview";
import { OrganizerManagementBar } from "@/components/organizer/OrganizerManagementBar";
import { PublishedEvent, StaffMember, EventTicketType, normalizeTicketType, type RawTicketType } from "@/types";
import { cn } from "@/lib/utils";
import { shareEvent } from "@/lib/share-utils";
import { TicketTypeList } from "@/components/events/TicketTypeList";
import { OverviewTab } from "@/components/events/tabs/OverviewTab";
import { StaffTab } from "@/components/events/tabs/StaffTab";
import { TicketsTab } from "@/components/events/tabs/TicketsTab";
import { AnalyticsTab } from "@/components/events/tabs/AnalyticsTab";

interface EventDetailsViewProps {
    event: PublishedEvent;
    ticketTypes: RawTicketType[] | EventTicketType[];
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
    const [sharing, setSharing] = useState(false);
    const [shareSuccess, setShareSuccess] = useState(false);

    const handleShareEvent = async () => {
        setSharing(true);
        setShareSuccess(false);

        try {
            const success = await shareEvent(event.id, event.title);
            if (success) {
                setShareSuccess(true);
                setTimeout(() => setShareSuccess(false), 2000);
            }
        } catch (error) {
            console.error("Error sharing event:", error);
        } finally {
            setSharing(false);
        }
    };

    const normalizedTicketTypes: EventTicketType[] = ticketTypes.map((t) =>
        normalizeTicketType(t as RawTicketType),
    );

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

                    <DateRow event={event} />
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

                        {/* Tab Content */}
                        {activeTab === "overview" && <OverviewTab event={event} />}

                        {activeTab === "staff" && isOrganizer && (
                            <StaffTab
                                eventId={event.id}
                                assignedStaff={assignedStaff}
                                availableStaff={availableStaff}
                            />
                        )}

                        {activeTab === "tickets" && isOrganizer && (
                            <TicketsTab eventId={event.id} ticketTypes={normalizedTicketTypes} />
                        )}

                        {activeTab === "analytics" && isOrganizer && (
                            <AnalyticsTab
                                event={event}
                                eventId={event.id}
                                ticketTypes={normalizedTicketTypes}
                            />
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
                                        <TicketSalesPreview ticketTypes={normalizedTicketTypes} />
                                    ) : (
                                        <TicketTypeList eventId={event.id} ticketTypes={normalizedTicketTypes} />
                                    )}
                                </div>

                                <div className="p-4 bg-[var(--color-background)]/50 border-t border-white/5 text-center">
                                    <p className="text-xs text-slate-500">Secure payment via Stripe</p>
                                </div>
                            </div>

                            <Button 
                                onClick={handleShareEvent}
                                disabled={sharing || shareSuccess}
                                variant="ghost" 
                                className="w-full justify-center gap-2 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {shareSuccess ? (
                                    <>
                                        <Check className="w-4 h-4" /> Copied!
                                    </>
                                ) : (
                                    <>
                                        <Share2 className="w-4 h-4" /> {sharing ? "Sharing..." : "Share Event"}
                                    </>
                                )}
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

function DateRow({ event }: { event: PublishedEvent }) {
    const startDate = new Date(event.startTime);
    return (
        <div className="flex flex-col md:flex-row md:items-center gap-6 text-slate-300">
            <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <span className="text-lg font-medium">
                    {startDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                    })}
                </span>
            </div>
            <div className="hidden md:block w-px h-6 bg-white/20" />
            <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <span className="text-lg font-medium">
                    {startDate.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                    })}
                </span>
            </div>
        </div>
    );
}
