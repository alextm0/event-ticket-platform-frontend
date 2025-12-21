"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TicketTypeForm } from "./TicketTypeForm";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { EventTicketType } from "@/types";
import { deleteTicketTypeAction } from "@/app/organizer/actions";
import { useTransition } from "react";

interface TicketTypeManagementProps {
    eventId: string;
    ticketTypes: EventTicketType[];
    onUpdate?: () => void;
}

export function TicketTypeManagement({
    eventId,
    ticketTypes,
    onUpdate,
}: TicketTypeManagementProps) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingTicketType, setEditingTicketType] = useState<EventTicketType | null>(null);
    const [deletingTicketTypeId, setDeletingTicketTypeId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleDelete = (ticketTypeId: string) => {
        setDeletingTicketTypeId(null);
        startTransition(async () => {
            try {
                await deleteTicketTypeAction(eventId, ticketTypeId);
                if (onUpdate) {
                    onUpdate();
                }
            } catch (error) {
                console.error("Failed to delete ticket type", error);
                // Error handling could be improved with toast notifications
            }
        });
    };

    const handleFormSuccess = () => {
        setIsCreateDialogOpen(false);
        setEditingTicketType(null);
        if (onUpdate) {
            onUpdate();
        }
    };

    const remainingQuantity = (ticketType: EventTicketType) =>
        ticketType.totalQuantity - ticketType.soldCount;

    const ticketTypeToDelete = ticketTypes.find((tt) => tt.id === deletingTicketTypeId);
    const hasSoldTickets = ticketTypeToDelete && ticketTypeToDelete.soldCount > 0;

    return (
        <>
            <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-6 backdrop-blur-md">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-white">Ticket Types</h2>
                        <p className="mt-1 text-sm text-[var(--color-secondary)]">
                            Manage ticket types, pricing, and availability for this event
                        </p>
                    </div>
                    <Button
                        variant="mint"
                        size="sm"
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Ticket Type
                    </Button>
                </div>

                {ticketTypes.length === 0 ? (
                    <div className="py-8 text-center">
                        <p className="text-sm text-[var(--color-secondary)]">
                            No ticket types created yet. Add your first ticket type to get started.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {ticketTypes.map((ticketType) => {
                            const remaining = remainingQuantity(ticketType);
                            const isSoldOut = remaining <= 0;
                            const isInactive = !ticketType.active;

                            return (
                                <div
                                    key={ticketType.id}
                                    className={`rounded-[var(--radius-lg)] border p-4 transition-all duration-200 ${isSoldOut || isInactive
                                        ? "border-[var(--color-border)] bg-[var(--color-background)]/30 opacity-60"
                                        : "border-[var(--color-border)] bg-[var(--color-background)]/50 hover:border-[var(--color-primary)]/30"
                                        }`}
                                >
                                    <div className="mb-3 flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-white">
                                                    {ticketType.name}
                                                </h3>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${ticketType.active
                                                        ? "bg-emerald-500/20 text-emerald-400"
                                                        : "bg-red-500/20 text-red-400"
                                                        }`}
                                                >
                                                    {ticketType.active ? "Active" : "Inactive"}
                                                </span>
                                                {isSoldOut && (
                                                    <span className="inline-flex items-center rounded-full bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400">
                                                        Sold Out
                                                    </span>
                                                )}
                                            </div>
                                            {ticketType.description && (
                                                <p className="mt-1 text-sm text-[var(--color-secondary)]">
                                                    {ticketType.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="ml-4 text-right">
                                            <div className="text-lg font-bold text-white">
                                                ${ticketType.price.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 border-t border-[var(--color-border)] pt-3 text-xs">
                                        <div className="flex justify-between text-[var(--color-secondary)]">
                                            <span>Total Quantity:</span>
                                            <span className="font-medium text-slate-300">
                                                {ticketType.totalQuantity}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-[var(--color-secondary)]">
                                            <span>Sold:</span>
                                            <span className="font-medium text-slate-300">
                                                {ticketType.soldCount}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-[var(--color-secondary)]">
                                            <span>Remaining:</span>
                                            <span
                                                className={`font-medium ${remaining === 0
                                                    ? "text-red-400"
                                                    : remaining <= 10
                                                        ? "text-yellow-400"
                                                        : "text-green-400"
                                                    }`}
                                            >
                                                {remaining}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setEditingTicketType(ticketType)}
                                            className="gap-2 border-[var(--color-border)] hover:bg-[var(--color-background)]"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setDeletingTicketTypeId(ticketType.id)}
                                            className="gap-2 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                            disabled={ticketType.soldCount > 0}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create Dialog */}
            <TicketTypeForm
                eventId={eventId}
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                onSuccess={handleFormSuccess}
            />

            {/* Edit Dialog */}
            {editingTicketType && (
                <TicketTypeForm
                    eventId={eventId}
                    ticketType={editingTicketType}
                    isOpen={!!editingTicketType}
                    onClose={() => setEditingTicketType(null)}
                    onSuccess={handleFormSuccess}
                />
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!deletingTicketTypeId}
                onClose={() => setDeletingTicketTypeId(null)}
                onConfirm={() => {
                    if (deletingTicketTypeId) {
                        handleDelete(deletingTicketTypeId);
                    }
                }}
                title="Delete Ticket Type?"
                description={
                    hasSoldTickets
                        ? `Cannot delete this ticket type because ${ticketTypeToDelete?.soldCount} ticket(s) have already been sold. You can deactivate it instead.`
                        : "Are you sure you want to delete this ticket type? This action cannot be undone."
                }
                confirmText="Delete"
                variant="destructive"
                isLoading={isPending}
                icon={<AlertTriangle className="h-5 w-5" />}
            />
        </>
    );
}

