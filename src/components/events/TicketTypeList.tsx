"use client";

import PurchaseTicketButton from "./PurchaseTicketButton";

// Initial type definition based on usage in page.tsx
interface TicketType {
    id: string;
    name: string;
    description?: string;
    price: number;
    currency?: string;
    totalQuantity: number;
    soldCount: number;
    active: boolean;
}

interface TicketTypeListProps {
    eventId: string;
    ticketTypes: TicketType[];
}

export function TicketTypeList({ eventId, ticketTypes }: TicketTypeListProps) {
    const remainingQuantity = (ticketType: TicketType) =>
        ticketType.totalQuantity - ticketType.soldCount;

    if (ticketTypes.length === 0) {
        return (
            <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-6 backdrop-blur-md">
                <h2 className="mb-6 text-xl font-semibold text-white">Ticket Types</h2>
                <p className="text-sm text-[var(--color-secondary)]">
                    No ticket types available for this event yet.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-6 backdrop-blur-md">
            <h2 className="mb-6 text-xl font-semibold text-white">Ticket Types</h2>
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
                                    <h3 className="font-semibold text-white">{ticketType.name}</h3>
                                    {ticketType.description && (
                                        <p className="mt-1 text-sm text-[var(--color-secondary)]">
                                            {ticketType.description}
                                        </p>
                                    )}
                                </div>
                                <div className="ml-4 text-right">
                                    <div className="text-lg font-bold text-white">
                                        {ticketType.currency || "$"}
                                        {ticketType.price.toFixed(2)}
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
                                        className={`font-medium ${remaining <= 10
                                                ? "text-yellow-400"
                                                : remaining === 0
                                                    ? "text-red-400"
                                                    : "text-green-400"
                                            }`}
                                    >
                                        {remaining}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center gap-2">
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
                            <div>
                                <PurchaseTicketButton
                                    eventId={eventId}
                                    ticketTypeId={ticketType.id}
                                    isSoldOut={isSoldOut}
                                    isInactive={isInactive}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
