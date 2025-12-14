'use client';

import { useState } from 'react';
import TicketPurchaseCounter from './TicketPurchaseCounter';
import PurchaseTicketButton from './PurchaseTicketButton';

interface EventDetailsClientProps {
  eventId: string;
  ticketTypes: any[];
}

interface CartItem {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
}

export default function EventDetailsClient({ eventId, ticketTypes }: EventDetailsClientProps) {
  const [cart, setCart] = useState<{ [key: string]: number }>({});

  const handleQuantityChange = (ticketTypeId: string, quantity: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (quantity <= 0) {
        delete newCart[ticketTypeId];
      } else {
        newCart[ticketTypeId] = quantity;
      }
      return newCart;
    });
  };

  const buildTicketsList = (): CartItem[] => {
    return Object.entries(cart)
      .filter(([_, quantity]) => quantity > 0)
      .map(([ticketTypeId, quantity]) => ({
        eventId,
        ticketTypeId,
        quantity,
      }));
  };

  const remainingQuantity = (ticketType: typeof ticketTypes[0]) => 
    ticketType.totalQuantity - ticketType.soldCount;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
      <h2 className="mb-6 text-xl font-semibold text-slate-100">Ticket Types</h2>
      {ticketTypes.length === 0 ? (
        <p className="text-sm text-slate-400">
          No ticket types available for this event yet.
        </p>
      ) : (
        <div className="space-y-4">
          {ticketTypes.map((ticketType) => {
            const remaining = remainingQuantity(ticketType);
            const isSoldOut = remaining <= 0;
            const isInactive = !ticketType.active;

            return (
              <div
                key={ticketType.id}
                className={`rounded-lg border p-4 ${
                  isSoldOut || isInactive
                    ? "border-slate-700 bg-slate-800/50 opacity-60"
                    : "border-slate-800 bg-slate-800/80"
                }`}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-100">{ticketType.name}</h3>
                    {ticketType.description && (
                      <p className="mt-1 text-sm text-slate-400">
                        {ticketType.description}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-lg font-bold text-slate-50">
                      {ticketType.currency || "$"}
                      {ticketType.price.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-700 pt-3 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Total Quantity:</span>
                    <span className="font-medium text-slate-300">
                      {ticketType.totalQuantity}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Sold:</span>
                    <span className="font-medium text-slate-300">
                      {ticketType.soldCount}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Remaining:</span>
                    <span
                      className={`font-medium ${
                        remaining <= 10
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
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      ticketType.active
                        ? "bg-green-500/20 text-green-400"
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
                <div className="mt-3">
                  <TicketPurchaseCounter 
                    eventId={ticketType.eventId}
                    ticketTypeId={ticketType.id}
                    isSoldOut={isSoldOut}
                    isInactive={isInactive}
                    onChange={(quantity) => handleQuantityChange(ticketType.id, quantity)}
                  />
                </div>
              </div>
            );
          })}
          <PurchaseTicketButton ticketsList={buildTicketsList()} />
        </div>
      )}
    </div>
  );
}
