'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isClientAuthenticated, isClientAttendee } from '@/lib/client-auth';
import { SESSION_UPDATED_EVENT } from '@/lib/session-events';
import Link from 'next/link';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAttendee, setIsAttendee] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const updateAuthState = () => {
      setIsAuthenticated(isClientAuthenticated());
      setIsAttendee(isClientAttendee());
    };

    // Initial check
    updateAuthState();

    // Listen for auth state changes (login/logout)
    window.addEventListener('storage', updateAuthState);
    window.addEventListener(SESSION_UPDATED_EVENT, updateAuthState);

    return () => {
      window.removeEventListener('storage', updateAuthState);
      window.removeEventListener(SESSION_UPDATED_EVENT, updateAuthState);
    };
  }, []);

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

  if (!isMounted) {
    return (
      <div className="mt-4 h-10 w-full animate-pulse rounded-[var(--radius-md)] bg-[var(--color-surface)]/50" />
    );
  }

  // Don't show button if not authenticated or not an attendee
  if (!isAuthenticated) {
    return (
      <Link
        href="/sign-in"
        className="mt-4 block w-full rounded-[var(--radius-md)] bg-[var(--color-primary)] px-3 py-2 text-center text-sm font-medium text-[var(--color-background)] hover:bg-[var(--color-primary)]/90 hover:shadow-lg transition-all duration-200"
      >
        Sign in to Purchase
      </Link>
    );
  }

  if (!isAttendee) {
    // Staff, organizers, etc. should not see purchase button
    return null;
  }

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
