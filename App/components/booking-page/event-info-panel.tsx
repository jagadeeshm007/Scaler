'use client';

import { CalendarDays, Clock, Globe, Video } from 'lucide-react';
import { AnimatePresence, LazyMotion, domAnimation, m } from 'motion/react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { formatBookingTimeRange, formatDuration, getEventTypeDurations } from '@/lib/format';
import { cn } from '@/lib/utils';
import { formatBookingDate } from '@/lib/format';
import type { Booking, EventType, PublicEventType, Slot } from '@/types';

const LOCATION_LABELS: Record<string, string> = {
  GOOGLE_MEET: 'Google Meet',
  ZOOM: 'Zoom',
  MS_TEAMS: 'Microsoft Teams',
  CAL_VIDEO: 'Cal Video',
  IN_PERSON: 'In Person',
  CUSTOM: 'Custom location',
};

function getLocationLabel(locationType: string, details: string | null): string {
  if (details) return details;
  return LOCATION_LABELS[locationType] ?? locationType.replace(/_/g, ' ');
}

const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Kolkata',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Australia/Sydney',
];

interface EventInfoPanelProps {
  eventType: EventType | PublicEventType;
  host: Pick<PublicEventType['user'], 'full_name' | 'avatar_url' | 'username'>;
  timezone: string;
  onTimezoneChange?: (tz: string) => void;
  selectedSlot?: Slot | null;
  selectedDuration?: number;
  onDurationChange?: (d: number) => void;
  rescheduleBooking?: Booking;
  className?: string;
}

export function EventInfoPanel({
  eventType,
  host,
  timezone,
  onTimezoneChange,
  selectedSlot,
  selectedDuration,
  onDurationChange,
  rescheduleBooking,
  className,
}: EventInfoPanelProps) {
  const initials = host.full_name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const durations = getEventTypeDurations(eventType);
  const activeDuration = selectedDuration ?? eventType.duration_mins;
  const hasMultipleDurations = durations.length > 1;

  const shortTz = timezone.split('/').pop()?.replace(/_/g, ' ') ?? timezone;

  return (
    <aside
      className={cn(
        'flex flex-col gap-6 border-b border-border p-7 lg:w-[320px] lg:shrink-0 lg:border-b-0 lg:border-r',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar size="lg">
          <AvatarImage src={host.avatar_url ?? undefined} alt={host.full_name} />
          <AvatarFallback className="bg-pink-600 text-foreground">{initials}</AvatarFallback>
        </Avatar>
        <span className="text-sm text-muted-foreground">{host.full_name}</span>
      </div>

      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-foreground">{eventType.title}</h1>

        {hasMultipleDurations && onDurationChange && !selectedSlot && (
          <ToggleGroup
            type="single"
            value={String(activeDuration)}
            onValueChange={(v) => {
              if (v) onDurationChange(Number(v));
            }}
            variant="outline"
            size="sm"
            className="flex-wrap justify-start gap-y-1"
          >
            {durations.map((d) => (
              <ToggleGroupItem key={d} value={String(d)} aria-label={formatDuration(d)}>
                {formatDuration(d)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}

        {eventType.description && (
          <p className="text-sm text-muted-foreground">{eventType.description}</p>
        )}

        <ul className="space-y-3 text-sm text-muted-foreground">
          <LazyMotion features={domAnimation}>
            <AnimatePresence mode="wait" initial={false}>
              {/* ── Reschedule mode ── */}
              {rescheduleBooking ? (
                <m.div
                  key={selectedSlot ? 'reschedule-new' : 'reschedule-former'}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
                  className="space-y-3"
                >
                  {/* Former time — always visible in reschedule mode */}
                  <li className="flex items-start gap-2">
                    <CalendarDays className="mt-0.5 size-4 shrink-0 text-neutral-600" />
                    <div>
                      <p className="mb-0.5 text-xs text-muted-foreground">Former time</p>
                      <p className="text-muted-foreground line-through">
                        {formatBookingDate(rescheduleBooking.start_time, timezone)}
                      </p>
                      <p className="text-muted-foreground line-through">
                        {formatBookingTimeRange(
                          rescheduleBooking.start_time,
                          rescheduleBooking.end_time,
                          timezone,
                        )}
                      </p>
                    </div>
                  </li>
                  {/* New time — visible once a slot is picked */}
                  {selectedSlot && (
                    <li className="flex items-start gap-2">
                      <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">
                          {formatBookingDate(selectedSlot.startTime, timezone)}
                        </p>
                        <p className="text-muted-foreground">
                          {formatBookingTimeRange(
                            selectedSlot.startTime,
                            selectedSlot.endTime,
                            timezone,
                          )}
                        </p>
                      </div>
                    </li>
                  )}
                  <li className="flex items-center gap-2">
                    <Clock className="size-4 shrink-0 text-muted-foreground" />
                    <span>{formatDuration(activeDuration)}</span>
                  </li>
                </m.div>
              ) : /* ── Normal booking mode ── */
              selectedSlot ? (
                <m.div
                  key="slot-info"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
                  className="space-y-3"
                >
                  <li className="flex items-center gap-2">
                    <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
                    <span>{formatBookingDate(selectedSlot.startTime, timezone)}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="size-4 shrink-0 text-muted-foreground" />
                    <span>
                      {formatBookingTimeRange(
                        selectedSlot.startTime,
                        selectedSlot.endTime,
                        timezone,
                      )}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="size-4 shrink-0 text-muted-foreground" />
                    <span>{formatDuration(activeDuration)}</span>
                  </li>
                </m.div>
              ) : !hasMultipleDurations ? (
                <m.li
                  key="duration"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <Clock className="size-4 shrink-0" />
                  <span>{formatDuration(activeDuration)}</span>
                </m.li>
              ) : null}
            </AnimatePresence>
          </LazyMotion>

          <li className="flex items-center gap-2">
            <Video className="size-4 shrink-0" />
            <span>{getLocationLabel(eventType.location_type, eventType.location_details)}</span>
          </li>

          <li className="flex items-center gap-2">
            <Globe className="size-4 shrink-0" />

            {onTimezoneChange ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-2 h-auto px-2 py-0.5 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {shortTz} ›
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="max-h-64 overflow-y-auto border-border bg-card"
                  align="start"
                >
                  {COMMON_TIMEZONES.map((tz) => (
                    <DropdownMenuItem
                      key={tz}
                      className={cn(
                        'cursor-pointer text-sm',
                        tz === timezone && 'font-medium text-foreground',
                      )}
                      onClick={() => onTimezoneChange(tz)}
                    >
                      {tz.replace(/_/g, ' ')}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <span>{shortTz}</span>
            )}
          </li>
        </ul>
      </div>
    </aside>
  );
}
