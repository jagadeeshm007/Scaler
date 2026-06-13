'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { BookingConfirmed } from '@/components/booking-page/booking-confirmed';
import { Skeleton } from '@/components/ui/skeleton';
import { useBooking } from '@/hooks/queries/use-bookings';
import { useAuthStore } from '@/store/auth.store';
import type { Booking } from '@/types';

function ConfirmedContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId') ?? '';
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: fetchedBooking, isLoading } = useBooking(bookingId);
  const [storedBooking, setStoredBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    const raw = sessionStorage.getItem(`booking-${bookingId}`);
    if (raw) {
      try {
        setStoredBooking(JSON.parse(raw) as Booking);
      } catch {
        setStoredBooking(null);
      }
    }
  }, [bookingId]);

  const booking = fetchedBooking ?? storedBooking;

  if (isAuthenticated && isLoading) {
    return <Skeleton className="mx-auto mt-12 h-96 max-w-lg rounded-xl" />;
  }

  if (!booking) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg font-semibold text-white">Your booking has been confirmed</p>
        <p className="mt-2 text-sm text-muted-foreground">Check your email for details.</p>
      </div>
    );
  }

  return <BookingConfirmed booking={booking} />;
}

export default function BookingConfirmedPage() {
  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-12">
      <Suspense fallback={<Skeleton className="mx-auto h-96 max-w-lg rounded-xl" />}>
        <ConfirmedContent />
      </Suspense>
    </div>
  );
}
