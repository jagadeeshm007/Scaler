'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetClose, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatBookingDate, formatBookingTimeRange } from '@/lib/format';
import { useUserProfile } from '@/hooks/queries/use-user-profile';
import type { Booking } from '@/types';
import { Copy, MoreHorizontal, Video, ChevronUp, ChevronDown, X, Flag } from 'lucide-react';
import { BookingActionMenu } from '@/components/bookings/booking-action-menu';
import { Badge } from '@/components/ui/badge';

interface BookingDetailPanelProps {
  booking: Booking | null;
  timezone: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  canPrevious?: boolean;
  canNext?: boolean;
  onReschedule?: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

export function BookingDetailPanel({
  booking,
  timezone,
  open,
  onOpenChange,
  onPrevious,
  onNext,
  canPrevious,
  canNext,
  onReschedule,
  onCancel,
}: BookingDetailPanelProps) {
  const { data: user } = useUserProfile();
  if (!booking) return null;

  const isCancelled = booking.status === 'CANCELLED' || booking.status === 'RESCHEDULED';

  const locationLabel =
    booking.event_type.location_type === 'in_person'
      ? (booking.event_type.location_details ?? 'In person')
      : booking.event_type.location_type.replace(/_/g, ' ');

  const hostName = booking.host?.full_name || user?.full_name || 'Host';
  const hostEmail = booking.host?.email || user?.email || 'host@example.com';
  const hostAvatarUrl = booking.host?.avatar_url || user?.avatar_url || undefined;

  const hostInitial = hostName.charAt(0).toUpperCase();
  const guestInitial = booking.guest_name.charAt(0).toUpperCase();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        className="flex w-full flex-col overflow-hidden border-border bg-card p-0 sm:max-w-md"
      >
        {/* Top Right Navigation & Close */}
        <div className="absolute right-4 top-4 flex items-center gap-1 z-10 text-muted-foreground">
          {onPrevious && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md"
              disabled={!canPrevious}
              onClick={onPrevious}
            >
              <ChevronUp className="size-4" />
            </Button>
          )}
          {onNext && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md"
              disabled={!canNext}
              onClick={onNext}
            >
              <ChevronDown className="size-4" />
            </Button>
          )}
          <SheetClose className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent hover:text-foreground">
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </div>

        <div className="flex-1 overflow-y-auto">
          <SheetHeader className="relative border-b border-border p-6 text-left">
            {(isCancelled || booking.rescheduled_from_uid || booking.rescheduled_to_uid) && (
              <div className="mb-2">
                {isCancelled && booking.status !== 'RESCHEDULED' ? (
                  <Badge variant="destructive" className="rounded-md font-medium px-2 py-0 text-xs">
                    Canceled
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="rounded-md font-medium px-2 py-0 text-xs">
                    Rescheduled
                  </Badge>
                )}
              </div>
            )}
            <SheetTitle className="pr-12 text-xl font-semibold leading-tight text-foreground">
              {booking.event_type.title} between {hostName} and {booking.guest_name}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-8 p-6">
            <DetailSection title="When">
              <p className="font-medium">{formatBookingDate(booking.start_time, timezone)}</p>
              <p className="text-muted-foreground">
                {formatBookingTimeRange(booking.start_time, booking.end_time, timezone)}
              </p>
            </DetailSection>

            {isCancelled && (
              <>
                <DetailSection
                  title={booking.status === 'RESCHEDULED' ? 'Rescheduled By' : 'Cancelled By'}
                >
                  <p className="text-sm text-foreground">{booking.guest_name}</p>
                </DetailSection>
                {booking.cancellation_reason && (
                  <DetailSection title="Reason">
                    <p className="text-sm text-foreground">{booking.cancellation_reason}</p>
                  </DetailSection>
                )}
              </>
            )}

            <DetailSection title="Who">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-8 bg-pink-500/20 text-pink-500">
                    <AvatarImage src={hostAvatarUrl} />
                    <AvatarFallback className="bg-pink-500/20 text-pink-500">
                      {hostInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {hostName}{' '}
                      <span className="ml-1 text-xs font-normal text-blue-400">Host</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{hostEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Avatar className="size-8 bg-pink-500/20 text-pink-500">
                    <AvatarFallback className="bg-pink-500/20 text-pink-500">
                      {guestInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{booking.guest_name}</p>
                    <p className="text-xs text-muted-foreground">{booking.guest_email}</p>
                  </div>
                </div>
              </div>
              {booking.guest_notes && (
                <p className="mt-4 text-sm text-muted-foreground">
                  &ldquo;{booking.guest_notes}&rdquo;
                </p>
              )}
            </DetailSection>

            <DetailSection title="Where">
              <div className="flex items-center gap-2">
                <span className="capitalize">{locationLabel}:</span>
                {booking.meeting_url ? (
                  <a
                    href={booking.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    {booking.meeting_url}
                  </a>
                ) : null}
              </div>
            </DetailSection>
          </div>
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-card p-4">
          {booking.meeting_url && !isCancelled ? (
            <div className="flex items-center overflow-hidden rounded-md border border-border bg-secondary shadow-sm">
              <Button
                size="sm"
                variant="ghost"
                className="h-9 gap-2 rounded-none px-4 hover:bg-muted/50"
                asChild
              >
                <a href={booking.meeting_url} target="_blank" rel="noopener noreferrer">
                  <Video className="size-4" />
                  Join Video
                </a>
              </Button>
              <div className="h-5 w-px bg-border" />
              <Button size="sm" variant="ghost" className="h-9 rounded-none px-3 hover:bg-muted/50">
                <Copy className="size-4" />
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="secondary" className="px-3">
              <Copy className="size-4" />
            </Button>
          )}
          {isCancelled ? (
            <Button size="sm" variant="secondary" className="px-2 hover:bg-muted">
              <Flag className="size-4 text-destructive" />
            </Button>
          ) : (
            onReschedule &&
            onCancel && (
              <BookingActionMenu
                onReschedule={() => onReschedule(booking)}
                onCancel={() => onCancel(booking)}
                trigger={
                  <Button size="sm" variant="secondary" className="px-2 hover:bg-muted">
                    <MoreHorizontal className="size-4" />
                  </Button>
                }
              />
            )
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
