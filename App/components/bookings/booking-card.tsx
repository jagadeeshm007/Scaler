'use client';

import { ExternalLink, User } from 'lucide-react';

import { BookingActionMenu } from '@/components/bookings/booking-action-menu';
import { Button } from '@/components/ui/button';
import { formatBookingDate, formatBookingTimeRange } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Booking } from '@/types';

interface BookingCardProps {
  booking: Booking;
  timezone: string;
  onSelect: (booking: Booking) => void;
  onReschedule: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  className?: string;
}

export function BookingCard({
  booking,
  timezone,
  onSelect,
  onReschedule,
  onCancel,
  className,
}: BookingCardProps) {
  const isCancelled = booking.status === 'CANCELLED';

  return (
    <div
      className={cn(
        'group flex cursor-pointer items-center gap-4 border-b border-border px-4 py-4 last:border-0 transition-colors hover:bg-accent/30',
        isCancelled && 'opacity-60',
        className,
      )}
      onClick={() => onSelect(booking)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(booking);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="hidden w-14 shrink-0 flex-col text-center sm:flex">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {formatBookingDate(booking.start_time, timezone).split(',')[0]}
        </span>
        <span className="text-lg font-semibold text-foreground">
          {formatBookingDate(booking.start_time, timezone).split(' ').slice(-2).join(' ')}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">
          {formatBookingTimeRange(booking.start_time, booking.end_time, timezone)}
        </p>
        <p className="truncate font-medium text-foreground">{booking.event_type.title}</p>
        <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
          <User className="size-3.5 shrink-0" />
          {booking.guest_name}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {booking.meeting_url && !isCancelled ? (
          <Button size="sm" variant="secondary" asChild>
            <a href={booking.meeting_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3.5" />
              Join
            </a>
          </Button>
        ) : null}
        {!isCancelled ? (
          <BookingActionMenu
            onReschedule={() => onReschedule(booking)}
            onCancel={() => onCancel(booking)}
          />
        ) : null}
      </div>
    </div>
  );
}
