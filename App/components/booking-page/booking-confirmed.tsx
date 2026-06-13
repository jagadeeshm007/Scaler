'use client';

import { CheckCircle2 } from 'lucide-react';
import { m } from 'motion/react';

import { formatBookingDate, formatBookingTimeRange, formatDuration } from '@/lib/format';
import { useTimezone } from '@/hooks/use-timezone';
import type { Booking } from '@/types';

interface BookingConfirmedProps {
  booking: Booking;
}

export function BookingConfirmed({ booking }: BookingConfirmedProps) {
  const { timezone } = useTimezone();

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-neutral-800 bg-neutral-900 p-8 text-center">
      <m.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <CheckCircle2 className="mx-auto size-12 text-green-500" />
      </m.div>
      <h1 className="mt-4 text-xl font-semibold text-white">This meeting is scheduled</h1>
      <p className="mt-2 text-sm text-muted-foreground">We sent an email with a calendar invitation.</p>
      <div className="mt-8 space-y-4 text-left text-sm">
        <div>
          <p className="text-muted-foreground">What</p>
          <p className="text-white">{booking.event_type.title} · {formatDuration(booking.event_type.duration_mins)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">When</p>
          <p className="text-white">
            {formatBookingDate(booking.start_time, timezone)},{' '}
            {formatBookingTimeRange(booking.start_time, booking.end_time, timezone)} ({timezone})
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Who</p>
          <p className="text-white">{booking.guest_name} · {booking.guest_email}</p>
        </div>
        {booking.meeting_url && (
          <div>
            <p className="text-muted-foreground">Where</p>
            <a href={booking.meeting_url} className="text-blue-500 hover:underline">{booking.meeting_url}</a>
          </div>
        )}
      </div>
    </div>
  );
}
