'use client';

import { Clock, ExternalLink, MapPin, User } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { formatBookingDate, formatBookingTimeRange } from '@/lib/format';
import type { Booking } from '@/types';

interface BookingDetailPanelProps {
  booking: Booking | null;
  timezone: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <div className="mt-1 text-sm text-foreground">{children}</div>
      </div>
    </div>
  );
}

export function BookingDetailPanel({
  booking,
  timezone,
  open,
  onOpenChange,
}: BookingDetailPanelProps) {
  if (!booking) return null;

  const locationLabel =
    booking.event_type.location_type === 'in_person'
      ? (booking.event_type.location_details ?? 'In person')
      : booking.event_type.location_type.replace(/_/g, ' ');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-border bg-background sm:max-w-md">
        <SheetHeader className="border-b border-border pb-4">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div>
              <SheetTitle className="text-left text-foreground">
                {booking.event_type.title}
              </SheetTitle>
              <SheetDescription className="text-left">{booking.guest_name}</SheetDescription>
            </div>
            <Badge variant="secondary" className="capitalize">
              {booking.status.toLowerCase()}
            </Badge>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <DetailRow icon={Clock} label="When">
            <p>{formatBookingDate(booking.start_time, timezone)}</p>
            <p className="text-muted-foreground">
              {formatBookingTimeRange(booking.start_time, booking.end_time, timezone)}
            </p>
          </DetailRow>

          <Separator className="bg-accent" />

          <DetailRow icon={User} label="Who">
            <p>{booking.guest_name}</p>
            <p className="text-muted-foreground">{booking.guest_email}</p>
            {booking.guest_notes ? (
              <p className="mt-2 text-muted-foreground">&ldquo;{booking.guest_notes}&rdquo;</p>
            ) : null}
          </DetailRow>

          <Separator className="bg-accent" />

          <DetailRow icon={MapPin} label="Where">
            <p className="capitalize">{locationLabel}</p>
            {booking.meeting_url ? (
              <Button variant="link" className="h-auto p-0 text-sm" asChild>
                <a href={booking.meeting_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1 inline size-3.5" />
                  Join meeting
                </a>
              </Button>
            ) : null}
          </DetailRow>
        </div>
      </SheetContent>
    </Sheet>
  );
}
