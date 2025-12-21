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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-white">Ticket Types</h2>
                    <Button
                        variant="mint"
                        size="sm"
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="gap-2 rounded-full px-4"
                    >
                        <Plus className="h-4 w-4" />
                        Add Ticket Type
                    </Button>
                </div>
            </div>

            {ticketTypes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-12 text-center">
                    <div className="mx-auto w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
                        <Plus className="h-6 w-6 text-slate-400" />
                    </div>
                    <h3 className="text-base font-semibold text-white">No tickets created</h3>
                    <p className="mt-1 text-sm text-slate-400 mb-6">
                        Get started by adding your first ticket type.
                    </p>
                    <Button
                        variant="secondary"
                        onClick={() => setIsCreateDialogOpen(true)}
                    >
                        Create Ticket Type
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {ticketTypes.map((ticketType) => {
                        const remaining = remainingQuantity(ticketType);
                        const isSoldOut = remaining <= 0;
                        const percentSold = ticketType.totalQuantity > 0
                            ? Math.min(100, Math.round((ticketType.soldCount / ticketType.totalQuantity) * 100))
                            : 0;

                        return (
                            <div
                                key={ticketType.id}
                                className="group relative flex flex-col md:flex-row md:items-center gap-4 md:gap-6 bg-slate-800/50 hover:bg-slate-800 transition-all duration-200 border border-white/5 hover:border-white/10 rounded-xl p-5"
                            >
                                {/* Identity (Far Left) */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-semibold text-white truncate">
                                            {ticketType.name}
                                        </h3>
                                        {!ticketType.active && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                                Paused
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-400 line-clamp-1 mt-0.5">
                                        {ticketType.description || "No description provided"}
                                    </p>
                                </div>

                                {/* Price (Center-Left) */}
                                <div className="shrink-0">
                                    <div className="text-xl font-bold text-white tabular-nums">
                                        ${ticketType.price.toFixed(2)}
                                    </div>
                                </div>

                                {/* Progress (Center-Right) */}
                                <div className="w-full md:w-64 shrink-0">
                                    <div className="flex justify-between text-xs font-medium mb-2">
                                        <span className={isSoldOut ? "text-red-400" : "text-emerald-400"}>
                                            {isSoldOut ? "Sold Out" : `${percentSold}% Sold`}
                                        </span>
                                        <span className="text-slate-400">
                                            {ticketType.soldCount} of {ticketType.totalQuantity}
                                        </span>
                                    </div>
                                    <div className="h-2.5 w-full rounded-full bg-black/20 overflow-hidden ring-1 ring-white/5">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${isSoldOut ? 'bg-red-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${percentSold}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Actions (Far Right) */}
                                <div className="flex items-center gap-1 shrink-0 ml-auto md:ml-0 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 mt-2 md:mt-0 w-full md:w-auto justify-end">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-slate-400 hover:text-white hover:bg-white/10"
                                        onClick={() => setEditingTicketType(ticketType)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                        onClick={() => setDeletingTicketTypeId(ticketType.id)}
                                        disabled={ticketType.soldCount > 0}
                                        title={ticketType.soldCount > 0 ? "Cannot delete ticket type with sales" : "Delete"}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

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
        </div>
    );
}
