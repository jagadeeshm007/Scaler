import { Clock, Globe, MapPin, Video } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDuration } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { EventType, PublicEventType } from '@/types';

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

interface EventInfoPanelProps {
  eventType: EventType | PublicEventType;
  host: Pick<PublicEventType['user'], 'full_name' | 'avatar_url' | 'username'>;
  timezone: string;
  className?: string;
}

export function EventInfoPanel({ eventType, host, timezone, className }: EventInfoPanelProps) {
  const initials = host.full_name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className={cn(
        'flex flex-col gap-6 border-b border-neutral-800 p-6 lg:border-b-0 lg:border-r',
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
        <h1 className="text-xl font-semibold text-white">{eventType.title}</h1>

        {eventType.description && (
          <p className="text-sm text-neutral-400">{eventType.description}</p>
        )}

        <ul className="space-y-3 text-sm text-neutral-400">
          <li className="flex items-center gap-2">
            <Clock className="size-4 shrink-0" />
            <span>{formatDuration(eventType.duration_mins)}</span>
          </li>
          <li className="flex items-center gap-2">
            <Video className="size-4 shrink-0" />
            <span>{getLocationLabel(eventType.location_type, eventType.location_details)}</span>
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" />
            <span>{getLocationLabel(eventType.location_type, null)}</span>
          </li>
          <li className="flex items-center gap-2">
            <Globe className="size-4 shrink-0" />
            <span>{timezone}</span>
          </li>
        </ul>
      </div>
    </aside>
  );
}
