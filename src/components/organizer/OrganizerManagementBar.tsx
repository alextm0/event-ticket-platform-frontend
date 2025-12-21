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
            <div className="bg-[var(--color-surface)] rounded-xl border border-white/10 shadow-2xl p-5 mb-6">
                <div className="space-y-3">
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-2 h-10 border-white/10 hover:bg-white/5 text-slate-200 hover:text-white transition-colors"
                        asChild
                    >
                        <Link href={`/organizer/edit-event/${event.id}`}>
                            <Pencil className="h-4 w-4" />
                            Edit Event Details
                        </Link>
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                        {event.status === "DRAFT" ? (
                            <Button
                                variant="mint"
                                className="w-full gap-2 shadow-lg shadow-emerald-500/10"
                                onClick={() => setActiveModal("publish")}
                                disabled={isPending}
                            >
                                <Globe className="h-4 w-4" />
                                Publish
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                className="w-full gap-2 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400"
                                onClick={() => setActiveModal("unpublish")}
                                disabled={isPending}
                            >
                                <Lock className="h-4 w-4" />
                                Unpublish
                            </Button>
                        )}

                        <Button
                            variant="destructive"
                            className="w-full gap-2 bg-red-900/20 text-red-400 hover:bg-red-900/40 hover:text-red-300 border border-red-900/30"
                            onClick={() => setActiveModal("delete")}
                            disabled={isPending}
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </Button>
                    </div>
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
