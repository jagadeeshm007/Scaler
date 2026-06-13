import { CalendarDays, Clock, Globe, Video } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  formatBookingDate,
  formatBookingTimeRange,
  formatDuration,
  getEventTypeDurations,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import type { EventType, PublicEventType, Slot } from '@/types';

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
        'flex flex-col gap-6 border-b border-neutral-800 p-7 lg:w-[320px] lg:shrink-0 lg:border-b-0 lg:border-r',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar size="lg">
          <AvatarImage src={host.avatar_url ?? undefined} alt={host.full_name} />
          <AvatarFallback className="bg-pink-600 text-white">{initials}</AvatarFallback>
        </Avatar>
        <span className="text-sm text-neutral-400">{host.full_name}</span>
      </div>

      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-white">{eventType.title}</h1>

        {hasMultipleDurations && onDurationChange && (
          <div className="flex flex-wrap gap-2">
            {durations.map((d) => (
              <button
                key={d}
                onClick={() => onDurationChange(d)}
                className={cn(
                  'rounded-full border px-3 py-1 text-sm transition-colors',
                  d === activeDuration
                    ? 'border-neutral-400 bg-neutral-800 text-white'
                    : 'border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200',
                )}
              >
                {formatDuration(d)}
              </button>
            ))}
          </div>
        )}

        {eventType.description && (
          <p className="text-sm text-neutral-400">{eventType.description}</p>
        )}

        <ul className="space-y-3 text-sm text-neutral-400">
          {selectedSlot ? (
            <>
              <li className="flex items-center gap-2">
                <CalendarDays className="size-4 shrink-0 text-neutral-500" />
                <span>{formatBookingDate(selectedSlot.startTime, timezone)}</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="size-4 shrink-0 text-neutral-500" />
                <span>
                  {formatBookingTimeRange(selectedSlot.startTime, selectedSlot.endTime, timezone)}
                </span>
              </li>
              <li>
                <span className="inline-block rounded-full bg-neutral-800 px-2 py-0.5 text-xs">
                  {formatDuration(activeDuration)}
                </span>
              </li>
            </>
          ) : !hasMultipleDurations ? (
            <li className="flex items-center gap-2">
              <Clock className="size-4 shrink-0" />
              <span>{formatDuration(activeDuration)}</span>
            </li>
          ) : null}

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
                    className="-ml-2 h-auto px-2 py-0.5 text-sm text-neutral-400 hover:text-white"
                  >
                    {shortTz} ›
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="max-h-64 overflow-y-auto border-neutral-700 bg-neutral-900"
                  align="start"
                >
                  {COMMON_TIMEZONES.map((tz) => (
                    <DropdownMenuItem
                      key={tz}
                      className={cn(
                        'cursor-pointer text-sm',
                        tz === timezone && 'font-medium text-white',
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
