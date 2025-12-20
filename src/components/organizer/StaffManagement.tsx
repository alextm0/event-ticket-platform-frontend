"use client";

import React, { useState, useTransition } from "react";
import { UserPlus, UserMinus, Shield, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaffMember } from "@/lib/backend-client";
import { assignStaffAction, removeStaffAction } from "@/app/organizer/actions";
import { cn } from "@/lib/utils";

interface StaffManagementProps {
    eventId: string;
    assignedStaff: StaffMember[];
    availableStaff: StaffMember[];
}

export function StaffManagement({ eventId, assignedStaff, availableStaff }: StaffManagementProps) {
    const [isPending, startTransition] = useTransition();
    const [searchQuery, setSearchQuery] = useState("");

    const handleAssign = (staffId: string) => {
        startTransition(async () => {
            await assignStaffAction(eventId, staffId);
        });
    };

    const handleRemove = (staffId: string) => {
        if (!confirm("Are you sure you want to remove this staff member from the event?")) return;
        startTransition(async () => {
            await removeStaffAction(eventId, staffId);
        });
    };

    const filteredAvailable = availableStaff.filter(staff =>
        !assignedStaff.some(a => a.id === staff.id) &&
        (staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <section className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Shield className="h-6 w-6 text-[var(--color-primary)]" />
                        Staff Management
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Assign staff members to handle ticket scanning and on-site entry for this event.
                    </p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Assigned Staff List */}
                <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        Assigned Staff ({assignedStaff.length})
                    </h3>

                    {assignedStaff.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-white/5 rounded-xl">
                            <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <Shield className="h-6 w-6 text-slate-500" />
                            </div>
                            <p className="text-slate-400 font-medium">No staff assigned yet</p>
                            <p className="text-slate-500 text-xs mt-1">Staff members you add will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {assignedStaff.map((staff) => (
                                <div
                                    key={staff.id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-[var(--color-primary)]/30 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center border border-[var(--color-primary)]/20 text-[var(--color-primary)] font-bold">
                                            {staff.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white group-hover:text-[var(--color-primary)] transition-colors">{staff.name}</p>
                                            <p className="text-xs text-slate-500">{staff.email}</p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                        onClick={() => handleRemove(staff.id)}
                                        disabled={isPending}
                                    >
                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4" />}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Addition Section */}
                <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        Available Staff
                    </h3>

                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-primary)]/50 transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredAvailable.length === 0 ? (
                            <p className="text-center py-8 text-slate-500 text-sm italic">
                                {searchQuery ? "No staff found matching your search" : "No more available staff found"}
                            </p>
                        ) : (
                            filteredAvailable.map((staff) => (
                                <div
                                    key={staff.id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5 hover:border-[var(--color-primary)]/30 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 text-slate-400 font-bold uppercase">
                                            {staff.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">{staff.name}</p>
                                            <p className="text-xs text-slate-500">{staff.email}</p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="default" // Changed from "mint" to standard shadcn "default" if "mint" was a typo
                                        className="h-8 gap-1.5"
                                        onClick={() => handleAssign(staff.id)}
                                        disabled={isPending}
                                    >
                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                                        <span className="sr-only sm:not-sr-only text-xs">Add</span>
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}