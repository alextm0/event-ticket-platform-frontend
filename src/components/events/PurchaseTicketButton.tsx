'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PurchaseTicketButtonProps {
  eventId: string;
  ticketTypeId: string;
  isSoldOut: boolean;
  isInactive: boolean;
}

export default function PurchaseTicketButton({
  eventId,
  ticketTypeId,
  isSoldOut,
  isInactive,
}: PurchaseTicketButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/purchase-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          ticketTypeId,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to purchase ticket');
      }

      const data = await response.json();
      // Redirect to my-tickets page
      router.push(`/my-tickets?orderId=${data.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        disabled={isSoldOut || isInactive || isLoading}
        className="mt-4 w-full rounded-[var(--radius-md)] bg-[var(--color-primary)] px-3 py-2 text-sm font-medium text-[var(--color-background)] hover:bg-[var(--color-primary)]/90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-surface)] disabled:text-[var(--color-secondary)] transition-all duration-200"
        onClick={handleClick}
      >
        {isLoading ? 'Processing...' : isSoldOut || isInactive ? 'Unavailable' : 'Purchase Ticket'}
      </button>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </>
  );
}
