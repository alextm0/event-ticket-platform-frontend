'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PurchaseTicketButtonProps {
  ticketsList: any[];
}

export default function PurchaseTicketsButton({
  ticketsList: ticketsList
}: PurchaseTicketButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);
    try {
      for (const ticket of ticketsList) {
        const response = await fetch('/api/purchase-ticket', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventId: ticket.eventId,
            ticketTypeId: ticket.ticketTypeId,
            quantity: ticket.quantity,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to purchase ticket');
        }
        
        const data = await response.json();
        // Redirect to my-tickets page
        router.push(`/my-tickets?orderId=${data.orderId}`);
      } 
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        disabled={ ticketsList.length === 0 || isLoading}
        className="mt-4 w-full rounded bg-sky-500 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        onClick={handleClick}
      >
        {isLoading ? 'Processing...' : 'Purchase Tickets'}
      </button>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </>
  );
}
