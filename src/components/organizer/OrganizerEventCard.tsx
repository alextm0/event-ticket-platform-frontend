"use client";

import Link from "next/link";
import React, { useState, useTransition } from "react";
import { Event } from "@/types";
import { deleteEventAction, updateEventAction } from "@/app/organizer/actions";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Trash2, Globe, Pencil, Lock, AlertTriangle } from "lucide-react";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

interface OrganizerEventCardProps {
    event: Event;
}

type ModalType = "publish" | "unpublish" | "delete" | null;

export function OrganizerEventCard({ event }: OrganizerEventCardProps) {
    const [isPending, startTransition] = useTransition();
    const [activeModal, setActiveModal] = useState<ModalType>(null);

    const handleAction = (type: ModalType) => {
        setActiveModal(null);
        startTransition(async () => {
            if (type === "delete") {
                await deleteEventAction(event.id as string);
            } else {
                const newStatus = type === "publish" ? "PUBLISHED" : "DRAFT";
                const formData = new FormData();
                formData.append("status", newStatus);
                await updateEventAction(event.id as string, formData);
            }
        });
    };

    const openModal = (type: ModalType) => (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveModal(type);
    };

    return (
        <>
            <article
                className="group relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-[var(--color-primary)]/50 hover:shadow-[var(--color-primary)]/10"
            >
                <Link href={`/events/${event.id}`} className="block">
                    <div className="mb-4 flex items-start justify-between">
                        <h2 className="line-clamp-1 text-xl font-bold text-white group-hover:text-[var(--color-primary)] transition-colors">
                            {event.title || event.name}
                        </h2>
                        {event.status && (
                            <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${event.status === "PUBLISHED"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : event.status === "DRAFT"
                                        ? "bg-yellow-500/20 text-yellow-400"
                                        : "bg-slate-500/20 text-slate-400"
                                    }`}
                            >
                                {event.status}
                            </span>
                        )}
                    </div>

                    <p className="mb-6 line-clamp-2 text-sm text-[var(--color-secondary)]">
                        {event.description}
                    </p>

                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-[var(--color-secondary)]">
                            <MapPin className="h-4 w-4 text-[var(--color-primary)]" />
                            <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[var(--color-secondary)]">
                            <Calendar className="h-4 w-4 text-[var(--color-primary)]" />
                            <span suppressHydrationWarning>
                                {event.startTime
                                    ? new Date(event.startTime).toLocaleDateString()
                                    : event.date
                                        ? new Date(event.date).toLocaleDateString()
                                        : "N/A"}
                            </span>
                        </div>
                    </div>
                </Link>

                <div className="mt-6 flex items-center gap-2 pt-4 border-t border-[var(--color-border)]">
                    {event.status === "DRAFT" ? (
                        <Button
                            size="sm"
                            variant="mint"
                            className="flex-1 gap-2"
                            onClick={openModal("publish")}
                            disabled={isPending}
                        >
                            <Globe className="h-4 w-4" />
                            Publish
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-2 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400"
                            onClick={openModal("unpublish")}
                            disabled={isPending}
                        >
                            <Lock className="h-4 w-4" />
                            Unpublish
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-400 hover:bg-slate-500/10 hover:text-white"
                        asChild
                    >
                        <Link href={`/organizer/edit-event/${event.id}`}>
                            <Pencil className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        onClick={openModal("delete")}
                        disabled={isPending}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </article>

            <ConfirmationModal
                isOpen={activeModal === "publish"}
                onClose={() => setActiveModal(null)}
                onConfirm={() => handleAction("publish")}
                title="Publish Event?"
                description={`Are you sure you want to publish "${event.title || event.name}"? This will make it visible to all users.`}
                confirmText="Publish"
                variant="mint"
                isLoading={isPending}
                icon={<Globe className="h-5 w-5" />}
            />

            <ConfirmationModal
                isOpen={activeModal === "unpublish"}
                onClose={() => setActiveModal(null)}
                onConfirm={() => handleAction("unpublish")}
                title="Unpublish Event?"
                description={`Hide "${event.title || event.name}" from public browse? active links will stop working.`}
                confirmText="Unpublish"
                variant="yellow"
                isLoading={isPending}
                icon={<Lock className="h-5 w-5" />}
            />

            <ConfirmationModal
                isOpen={activeModal === "delete"}
                onClose={() => setActiveModal(null)}
                onConfirm={() => handleAction("delete")}
                title="Delete Event?"
                description={`Permanently delete "${event.title || event.name}"? This action cannot be reversed.`}
                confirmText="Delete"
                variant="destructive"
                isLoading={isPending}
                icon={<AlertTriangle className="h-5 w-5" />}
            />
        </>
    );
}
