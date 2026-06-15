'use client';

import { ExternalLink, Video, Flag } from 'lucide-react';

import { BookingActionMenu } from '@/components/bookings/booking-action-menu';
import { Button } from '@/components/ui/button';
import { formatBookingDate, formatBookingTimeRange } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useUserProfile } from '@/hooks/queries/use-user-profile';
import type { Booking } from '@/types';

interface BookingCardProps {
  booking: Booking;
  timezone: string;
  onSelect: (booking: Booking) => void;
  onReschedule: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  isSelected?: boolean;
  className?: string;
}

export function BookingCard({
  booking,
  timezone,
  onSelect,
  onReschedule,
  onCancel,
  isSelected,
  className,
}: BookingCardProps) {
  const isCancelled = booking.status === 'CANCELLED' || booking.status === 'RESCHEDULED';
  const { data: user } = useUserProfile();
  const hostName = booking.host?.full_name || user?.full_name || 'Host';

  return (
    <div
      className={cn(
        'group relative flex cursor-pointer flex-col gap-4 border-b border-border last:border-0 bg-card p-4 sm:p-5 transition-all sm:flex-row sm:items-start',
        'hover:bg-muted/50',
        'data-[state=selected]:bg-muted',
        className,
      )}
      data-state={isSelected ? 'selected' : 'closed'}
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
      <div className="hidden w-56 shrink-0 flex-col border-l-2 border-foreground pl-3 sm:flex">
        <span className="text-sm font-semibold text-foreground">
          {formatBookingDate(booking.start_time, timezone)}
        </span>
        <span className="mt-0.5 text-sm text-muted-foreground">
          {formatBookingTimeRange(booking.start_time, booking.end_time, timezone)}
        </span>

        {booking.meeting_url ? (
          <div className="mt-2.5" onClick={(e) => e.stopPropagation()}>
            <a
              href={booking.meeting_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-6 w-max items-center gap-1.5 rounded-md border border-border/50 bg-secondary/40 px-2.5 text-[11px] font-medium text-foreground transition-all shadow-sm dark:shadow-[0_1px_8px_rgba(255,255,255,0.02)] hover:bg-secondary/80"
            >
              <Video className="size-3" />
              Join Google Meet
            </a>
          </div>
        ) : null}
      </div>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col pl-2 sm:pl-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <p
                className={cn(
                  'truncate font-semibold sm:text-base',
                  isCancelled ? 'text-muted-foreground line-through' : 'text-foreground',
                )}
              >
                {booking.event_type.title} between {hostName} and {booking.guest_name}
              </p>
            </div>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              You and {booking.guest_name}
            </p>
            {booking.guest_notes && (
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                &ldquo;{booking.guest_notes}&rdquo;
              </p>
            )}
            {(booking.status === 'RESCHEDULED' ||
              booking.rescheduled_from_uid ||
              booking.rescheduled_to_uid) && (
              <div className="mt-1.5 flex items-center">
                <span className="inline-flex shrink-0 items-center rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-500">
                  Rescheduled
                </span>
              </div>
            )}

            {/* Mobile Date/Time Details */}
            <div className="mt-2 flex flex-col gap-0.5 text-sm text-muted-foreground sm:hidden">
              <p>{formatBookingDate(booking.start_time, timezone)}</p>
              <p>{formatBookingTimeRange(booking.start_time, booking.end_time, timezone)}</p>
            </div>

            {/* Desktop Time Details */}
            {/* <p className="hidden text-sm text-muted-foreground sm:block">
              {formatBookingTimeRange(booking.start_time, booking.end_time, timezone)}
            </p> */}
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
          {booking.meeting_url ? (
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
      <div className="hidden sm:block" onClick={(e) => e.stopPropagation()}>
        {isCancelled ? (
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-8 shrink-0 border border-border/40 bg-secondary/40 shadow-[0_1px_8px_rgba(0,0,0,0.02)] dark:shadow-[0_1px_8px_rgba(255,255,255,0.02)] backdrop-blur-sm transition-all hover:bg-secondary/80"
            >
              <Flag className="size-4 text-destructive" />
              <span className="sr-only">Report booking</span>
            </Button>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-2">
            <BookingActionMenu
              onReschedule={() => onReschedule?.(booking)}
              onCancel={() => onCancel?.(booking)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
