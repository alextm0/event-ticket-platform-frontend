"use client";

import Link from "next/link";
import React, { useState, useTransition } from "react";
import { Globe, Pencil, Trash2, Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteEventAction, updateEventAction } from "@/app/organizer/actions";
import { PublishedEvent } from "@/types";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

interface OrganizerManagementBarProps {
    event: PublishedEvent;
}

type ModalType = "publish" | "unpublish" | "delete" | null;

export function OrganizerManagementBar({ event }: OrganizerManagementBarProps) {
    const [isPending, startTransition] = useTransition();
    const [activeModal, setActiveModal] = useState<ModalType>(null);

    const handleAction = (type: ModalType) => {
        setActiveModal(null);
        startTransition(async () => {
            if (type === "delete") {
                await deleteEventAction(event.id);
            } else if (type === "publish" || type === "unpublish") {
                const formData = new FormData();
                formData.append("status", type === "publish" ? "PUBLISHED" : "DRAFT");
                await updateEventAction(event.id, formData);
            }
        });
    };

    return (
        <>
            <div className="mb-8 flex flex-wrap items-center gap-4 rounded-2xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-4 backdrop-blur-md">
                <div className="flex items-center gap-2 mr-auto">
                    <div className="h-2 w-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
                    <span className="text-sm font-medium text-white">Organizer Management</span>
                </div>
                <div className="flex items-center gap-3">
                    {event.status === "DRAFT" ? (
                        <Button
                            size="sm"
                            variant="mint"
                            className="gap-2"
                            onClick={() => setActiveModal("publish")}
                            disabled={isPending}
                        >
                            <Globe className="h-4 w-4" />
                            Publish Now
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                            onClick={() => setActiveModal("unpublish")}
                            disabled={isPending}
                        >
                            <Lock className="h-4 w-4" />
                            Revert to Draft
                        </Button>
                    )}

                    <Button size="sm" variant="outline" className="gap-2 border-[var(--color-border)]" asChild disabled={isPending}>
                        <Link href={`/organizer/edit-event/${event.id}`}>
                            <Pencil className="h-4 w-4" />
                            Edit details
                        </Link>
                    </Button>

                    <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        onClick={() => setActiveModal("delete")}
                        disabled={isPending}
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={activeModal === "publish"}
                onClose={() => setActiveModal(null)}
                onConfirm={() => handleAction("publish")}
                title="Publish Event?"
                description="This will make your event visible to the public and allow users to purchase tickets."
                confirmText="Publish"
                variant="mint"
                isLoading={isPending}
                icon={<Globe className="h-5 w-5" />}
            />

            <ConfirmationModal
                isOpen={activeModal === "unpublish"}
                onClose={() => setActiveModal(null)}
                onConfirm={() => handleAction("unpublish")}
                title="Revert to Draft?"
                description="This will hide the event from the public view. Active ticket sales will be paused."
                confirmText="Revert to Draft"
                variant="yellow"
                isLoading={isPending}
                icon={<Lock className="h-5 w-5" />}
            />

            <ConfirmationModal
                isOpen={activeModal === "delete"}
                onClose={() => setActiveModal(null)}
                onConfirm={() => handleAction("delete")}
                title="Delete Event?"
                description="Are you sure you want to delete this event? This action is permanent and cannot be undone."
                confirmText="Delete"
                variant="destructive"
                isLoading={isPending}
                icon={<AlertTriangle className="h-5 w-5" />}
            />
        </>
    );
}
