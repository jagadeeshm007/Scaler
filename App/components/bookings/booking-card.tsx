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
        'group flex cursor-pointer flex-col gap-4 border-b border-border px-4 py-4 last:border-0 transition-colors hover:bg-accent/30 sm:flex-row sm:items-center',
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
      {/* Desktop Date Sidebar */}
      <div className="hidden w-14 shrink-0 flex-col text-center sm:flex">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {formatBookingDate(booking.start_time, timezone).split(',')[0]}
        </span>
        <span className="text-lg font-semibold text-foreground">
          {formatBookingDate(booking.start_time, timezone).split(' ').slice(-2).join(' ')}
        </span>
      </div>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-foreground sm:text-base">
              {booking.event_type.title}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
              <User className="size-3.5 shrink-0" />
              {booking.guest_name}
            </p>

            {/* Mobile Date/Time Details */}
            <div className="mt-2 flex flex-col gap-0.5 text-sm text-muted-foreground sm:hidden">
              <p>{formatBookingDate(booking.start_time, timezone)}</p>
              <p>{formatBookingTimeRange(booking.start_time, booking.end_time, timezone)}</p>
            </div>

            {/* Desktop Time Details */}
            <p className="hidden text-sm text-muted-foreground sm:block">
              {formatBookingTimeRange(booking.start_time, booking.end_time, timezone)}
            </p>
          </div>

          {/* Mobile Action Menu */}
          <div className="shrink-0 sm:hidden" onClick={(e) => e.stopPropagation()}>
            {!isCancelled ? (
              <BookingActionMenu
                onReschedule={() => onReschedule(booking)}
                onCancel={() => onCancel(booking)}
              />
            ) : null}
          </div>
        </div>

        {/* Mobile Join Button */}
        <div className="mt-3 flex items-center sm:hidden" onClick={(e) => e.stopPropagation()}>
          {booking.meeting_url && !isCancelled ? (
            <Button size="sm" variant="secondary" className="gap-2" asChild>
              <a href={booking.meeting_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-3.5" />
                Join Google Meet
              </a>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Desktop Actions */}
      <div
        className="hidden shrink-0 items-center gap-2 sm:flex"
        onClick={(e) => e.stopPropagation()}
      >
        {booking.meeting_url && !isCancelled ? (
          <Button size="sm" variant="secondary" className="gap-2" asChild>
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
