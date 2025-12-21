"use client";

import { useState } from "react";
import { Loader2, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { EventTicketType } from "@/types";
import { createTicketTypeAction, updateTicketTypeAction } from "@/app/organizer/actions";

interface TicketTypeFormProps {
    eventId: string;
    ticketType?: EventTicketType;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function TicketTypeForm({
    eventId,
    ticketType,
    isOpen,
    onClose,
    onSuccess,
}: TicketTypeFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: ticketType?.name || "",
        description: ticketType?.description || "",
        price: ticketType?.price?.toString() || "",
        totalQuantity: ticketType?.totalQuantity?.toString() || "",
        active: ticketType?.active ?? true,
    });

    const isEditMode = !!ticketType;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Validation
        if (!formData.name.trim()) {
            setError("Ticket type name is required.");
            setIsLoading(false);
            return;
        }

        const price = parseFloat(formData.price);
        if (isNaN(price) || price < 0) {
            setError("Price must be a valid positive number.");
            setIsLoading(false);
            return;
        }

        const quantity = parseInt(formData.totalQuantity, 10);
        if (isNaN(quantity) || quantity < 1) {
            setError("Quantity must be at least 1.");
            setIsLoading(false);
            return;
        }

        // If editing, check if quantity is less than sold count
        if (isEditMode && ticketType && quantity < ticketType.soldCount) {
            setError(
                `Quantity cannot be less than the number of tickets already sold (${ticketType.soldCount}).`,
            );
            setIsLoading(false);
            return;
        }

        try {
            const formDataObj = new FormData();
            formDataObj.append("name", formData.name.trim());
            if (formData.description) {
                formDataObj.append("description", formData.description.trim());
            }
            formDataObj.append("price", price.toString());
            formDataObj.append("totalQuantity", quantity.toString());
            formDataObj.append("active", formData.active.toString());

            if (isEditMode && ticketType) {
                await updateTicketTypeAction(eventId, ticketType.id, formDataObj);
            } else {
                await createTicketTypeAction(eventId, formDataObj);
            }

            // Reset form
            setFormData({
                name: "",
                description: "",
                price: "",
                totalQuantity: "",
                active: true,
            });
            setError(null);
            onClose();
            if (onSuccess) {
                onSuccess();
            }
        } catch (err: any) {
            console.error("Failed to save ticket type", err);
            setError(err.message || `Failed to ${isEditMode ? "update" : "create"} ticket type.`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setError(null);
            if (!isEditMode) {
                setFormData({
                    name: "",
                    description: "",
                    price: "",
                    totalQuantity: "",
                    active: true,
                });
            }
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-[var(--color-surface)] border-[var(--color-border)] text-white max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-white">
                        {isEditMode ? "Edit Ticket Type" : "Create New Ticket Type"}
                    </DialogTitle>
                    <DialogDescription className="text-[var(--color-secondary)]">
                        {isEditMode
                            ? "Update the ticket type details. Note: quantity cannot be less than tickets already sold."
                            : "Add a new ticket type for this event. You can manage quantities and pricing."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-200">
                            Ticket Type Name <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. VIP, General Admission, Early Bird"
                            required
                            disabled={isLoading}
                            className="bg-[var(--color-background)] border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20 h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-slate-200">
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            placeholder="Describe what's included with this ticket type..."
                            rows={3}
                            disabled={isLoading}
                            className="bg-[var(--color-background)] border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-slate-200">
                                Price ($) <span className="text-red-400">*</span>
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="0.00"
                                required
                                disabled={isLoading}
                                className="bg-[var(--color-background)] border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20 h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="totalQuantity" className="text-slate-200">
                                Total Quantity <span className="text-red-400">*</span>
                            </Label>
                            <Input
                                id="totalQuantity"
                                type="number"
                                min="1"
                                value={formData.totalQuantity}
                                onChange={(e) =>
                                    setFormData({ ...formData, totalQuantity: e.target.value })
                                }
                                placeholder="100"
                                required
                                disabled={isLoading || (isEditMode && !!ticketType?.soldCount)}
                                className="bg-[var(--color-background)] border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20 h-11"
                            />
                            {isEditMode && ticketType && ticketType.soldCount > 0 && (
                                <p className="text-xs text-[var(--color-secondary)]">
                                    {ticketType.soldCount} tickets already sold
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="active"
                            checked={formData.active}
                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                            disabled={isLoading}
                            className="h-4 w-4 rounded border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]/20"
                        />
                        <Label htmlFor="active" className="text-slate-200 cursor-pointer">
                            Active (available for purchase)
                        </Label>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="border-[var(--color-border)] hover:bg-[var(--color-background)]"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="mint"
                            disabled={isLoading}
                            className="gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {isEditMode ? "Updating..." : "Creating..."}
                                </>
                            ) : (
                                <>
                                    {isEditMode ? (
                                        <>
                                            <Pencil className="h-4 w-4" />
                                            Update Ticket Type
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4" />
                                            Create Ticket Type
                                        </>
                                    )}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

