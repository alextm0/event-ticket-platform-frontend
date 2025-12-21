'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isClientAuthenticated, isClientAttendee } from '@/lib/client-auth';
import { SESSION_UPDATED_EVENT } from '@/lib/session-events';
import Link from 'next/link';
import { StripeMockModal } from '@/components/payment/StripeMockModal';

interface PurchaseTicketButtonProps {
  eventId: string;
  ticketTypeId: string;
  isSoldOut: boolean;
  isInactive: boolean;
  ticketName: string;
  price: number;
  currency?: string;
  compact?: boolean;
}

export default function PurchaseTicketButton({
  eventId,
  ticketTypeId,
  isSoldOut,
  isInactive,
  ticketName,
  price,
  currency = "$",
  compact = false,
}: PurchaseTicketButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAttendee, setIsAttendee] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
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

  const handlePurchase = async () => {
    // This function is called by the modal on success
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
  };

  if (!isMounted) {
    return (
      <div className={`animate-pulse rounded-[var(--radius-md)] bg-[var(--color-surface)]/50 ${compact ? 'h-7 w-16' : 'mt-4 h-10 w-full'}`} />
    );
  }

  // Don't show button if not authenticated or not an attendee
  if (!isAuthenticated) {
    return (
      <Link
        href="/sign-in"
        className={`rounded-[var(--radius-md)] bg-[var(--color-primary)] font-medium text-[var(--color-background)] hover:bg-[var(--color-primary)]/90 transition-all duration-200 ${compact
            ? 'px-3 py-1 text-xs'
            : 'mt-4 block w-full px-3 py-2 text-center text-sm hover:shadow-lg'
          }`}
      >
        {compact ? 'Sign in' : 'Sign in to Purchase'}
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
        className={`rounded-[var(--radius-md)] bg-[var(--color-primary)] font-medium text-[var(--color-background)] hover:bg-[var(--color-primary)]/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-surface)] disabled:text-[var(--color-secondary)] transition-all duration-200 ${compact
            ? 'px-3 py-1 text-xs'
            : 'mt-4 w-full px-3 py-2 text-sm hover:shadow-lg'
          }`}
        onClick={() => setShowPaymentModal(true)}
      >
        {isLoading
          ? '...'
          : isSoldOut || isInactive
            ? (compact ? 'Sold' : 'Unavailable')
            : (compact ? 'Buy' : 'Purchase Ticket')}
      </button>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      <StripeMockModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePurchase}
        ticketName={ticketName}
        price={price}
        currency={currency}
      />
    </>
  );
}
