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
                        <Shield className="h-7 w-7 text-[var(--color-primary)] opacity-90" />
                        Staff Management
                    </h2>
                    <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                        Assign staff members to handle ticket scanning and on-site entry. Staff members will receive access to the validation tools for this event.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Assigned Staff List */}
                <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            Assigned Staff
                            <span className="text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-0.5 rounded-full border border-[var(--color-primary)]/20">
                                {assignedStaff.length}
                            </span>
                        </h3>
                    </div>

                    {assignedStaff.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                            <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4 rotate-3">
                                <Shield className="h-7 w-7 text-slate-500 opacity-50" />
                            </div>
                            <p className="text-slate-400 font-medium">No staff assigned yet</p>
                            <p className="text-slate-600 text-xs mt-1">Add members from the available list</p>
                        </div>
                    ) : (
                        <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                            {assignedStaff.map((staff) => (
                                <div
                                    key={staff.id}
                                    className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[var(--color-primary)]/30 hover:bg-white/[0.05] transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-11 w-11 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center border border-[var(--color-primary)]/20 text-[var(--color-primary)] font-bold shadow-inner">
                                            {staff.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-white group-hover:text-[var(--color-primary)] transition-colors truncate">{staff.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{staff.email}</p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-9 w-9 rounded-xl p-0 text-red-400/70 hover:bg-red-500/10 hover:text-red-400 hover:border hover:border-red-500/20 transition-all shrink-0"
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

                {/* Available Staff Section */}
                <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            Available Staff
                        </h3>
                    </div>

                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/20 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar flex-1">
                        {filteredAvailable.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Search className="h-8 w-8 text-slate-700 mb-3" />
                                <p className="text-slate-500 text-sm font-medium">
                                    {searchQuery ? "No staff found matching search" : "No more available staff"}
                                </p>
                            </div>
                        ) : (
                            filteredAvailable.map((staff) => (
                                <div
                                    key={staff.id}
                                    className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-[var(--color-primary)]/30 hover:bg-black/60 transition-all group"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-11 w-11 rounded-xl bg-slate-800/50 flex items-center justify-center border border-white/10 text-slate-400 group-hover:text-white group-hover:bg-slate-700/50 transition-all font-bold uppercase shadow-inner shrink-0">
                                            {staff.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-slate-200 group-hover:text-white transition-colors truncate">{staff.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{staff.email}</p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="h-9 gap-2 px-4 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 hover:bg-[var(--color-primary)] hover:text-black hover:border-transparent font-medium transition-all shrink-0 active:scale-95"
                                        onClick={() => handleAssign(staff.id)}
                                        disabled={isPending}
                                    >
                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                                        <span className="hidden xs:inline text-xs">Add</span>
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
