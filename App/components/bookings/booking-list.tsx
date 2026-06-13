'use client';

import { CalendarX2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { BookingCard } from '@/components/bookings/booking-card';
import { BookingDetailPanel } from '@/components/bookings/booking-detail-panel';
import { BookingFilters, useBookingFilter } from '@/components/bookings/booking-filters';
import { BookingSkeleton } from '@/components/bookings/booking-skeleton';
import { CancelBookingDialog } from '@/components/bookings/cancel-booking-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { useBookings } from '@/hooks/queries/use-bookings';
import { useTimezone } from '@/hooks/use-timezone';
import { filterBookingsByTab } from '@/lib/booking-utils';
import type { BookingStatusTab } from '@/lib/constants';
import type { Booking } from '@/types';

const EMPTY_MESSAGES: Record<BookingStatusTab, { title: string; description: string }> = {
  upcoming: {
    title: 'No upcoming bookings',
    description: 'When someone books a meeting with you, it will appear here.',
  },
  unconfirmed: {
    title: 'No unconfirmed bookings',
    description: 'Bookings awaiting your confirmation will show up here.',
  },
  recurring: {
    title: 'No recurring bookings',
    description: 'Recurring meeting series will appear here when scheduled.',
  },
  past: {
    title: 'No past bookings',
    description: 'Your completed meetings will be listed here.',
  },
  cancelled: {
    title: 'No cancelled bookings',
    description: 'Cancelled meetings will appear here.',
  },
};

export function BookingList() {
  const [status] = useBookingFilter();
  const { timezone } = useTimezone();
  const { data: bookings, isLoading, isError } = useBookings();

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  const filtered = useMemo(
    () => filterBookingsByTab(bookings ?? [], status),
    [bookings, status],
  );

  if (isLoading) return <BookingSkeleton />;

  if (isError) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="Failed to load bookings"
        description="Something went wrong while fetching your bookings."
      />
    );
  }

  const empty = EMPTY_MESSAGES[status];

  return (
    <>
      <PageHeader
        title="Bookings"
        description="See upcoming and past events booked through your event types."
      />

      <BookingFilters className="mb-6" />

      {!filtered.length ? (
        <EmptyState icon={CalendarX2} title={empty.title} description={empty.description} />
      ) : (
        <Card className="overflow-hidden border-neutral-800 bg-neutral-900 p-0">
          {filtered.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              timezone={timezone}
              onSelect={(b) => {
                setSelectedBooking(b);
                setDetailOpen(true);
              }}
              onReschedule={() => {
                // Reschedule flow wired in a future phase
              }}
              onCancel={(b) => {
                setCancelTarget(b);
                setCancelOpen(true);
              }}
            />
          ))}
        </Card>
      )}

      <BookingDetailPanel
        booking={selectedBooking}
        timezone={timezone}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <CancelBookingDialog
        booking={cancelTarget}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
      />
    </>
  );
}
