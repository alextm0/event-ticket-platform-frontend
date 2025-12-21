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
            <div className="p-4 text-center">
                <p className="text-sm text-[var(--color-secondary)]">
                    No ticket types available for this event yet.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {ticketTypes.map((ticketType) => {
                const remaining = remainingQuantity(ticketType);
                const isSoldOut = remaining <= 0;
                const isInactive = !ticketType.active;

                return (
                    <div
                        key={ticketType.id}
                        className={`group flex items-center justify-between p-3 rounded-xl border border-transparent hover:bg-white/5 hover:border-white/5 transition-all duration-200 ${isInactive ? 'opacity-50 grayscale' : ''}`}
                    >
                        <div className="flex flex-col gap-0.5 min-w-0 pr-4">
                            <span className="font-medium text-white truncate">
                                {ticketType.name}
                            </span>
                            <span className={`text-[11px] font-medium tracking-wide ${isSoldOut ? 'text-red-400 uppercase' : 'text-emerald-400/80'}`}>
                                {isSoldOut ? "Sold Out" : `${remaining} tickets left`}
                            </span>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <div className="text-sm font-bold text-white tabular-nums">
                                {ticketType.currency || "$"}
                                {ticketType.price.toFixed(2)}
                            </div>

                            <PurchaseTicketButton
                                eventId={eventId}
                                ticketTypeId={ticketType.id}
                                isSoldOut={isSoldOut}
                                isInactive={isInactive}
                                ticketName={ticketType.name}
                                price={ticketType.price}
                                currency={ticketType.currency}
                                compact={true}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
