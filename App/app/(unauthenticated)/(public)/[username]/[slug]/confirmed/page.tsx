'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { LazyMotion, domAnimation } from 'motion/react';

import { BookingConfirmed } from '@/components/booking-page/booking-confirmed';
import { Skeleton } from '@/components/ui/skeleton';
import { useBooking, usePublicBooking } from '@/hooks/queries/use-bookings';
import { useAuthStore } from '@/store/auth.store';
import type { Booking } from '@/types';

function ConfirmedContent() {
  const searchParams = useSearchParams();
  const bookingUid = searchParams.get('uid') ?? '';
  const bookingId = searchParams.get('bookingId') ?? '';
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: publicBooking, isLoading: isPublicLoading } = usePublicBooking(bookingUid);
  const { data: authBooking, isLoading: isAuthLoading } = useBooking(bookingId);
  const [storedBooking, setStoredBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (bookingUid) {
      const raw = sessionStorage.getItem(`booking-uid-${bookingUid}`);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Booking;
          queueMicrotask(() => setStoredBooking(parsed));
          return;
        } catch {
          queueMicrotask(() => setStoredBooking(null));
        }
      }
    }

    if (!bookingId) return;
    const raw = sessionStorage.getItem(`booking-${bookingId}`);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Booking;
        queueMicrotask(() => setStoredBooking(parsed));
      } catch {
        queueMicrotask(() => setStoredBooking(null));
      }
    }
  }, [bookingUid, bookingId]);

  const booking = publicBooking ?? authBooking ?? storedBooking;
  const isLoading = bookingUid ? isPublicLoading : isAuthenticated && isAuthLoading;

  if (isLoading && !booking) {
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
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-neutral-950 px-4 py-12">
        <Suspense fallback={<Skeleton className="mx-auto h-96 max-w-lg rounded-xl" />}>
          <ConfirmedContent />
        </Suspense>
      </div>
    </LazyMotion>
  );
}
