'use client';

import { Clock, EyeOff, ExternalLink, Link2 } from 'lucide-react';
import { toast } from 'sonner';

import { EventTypeActions } from '@/components/event-types/event-type-actions';
import { EventTypeActiveToggle } from '@/components/event-types/event-type-active-toggle';
import {
  EventTypeActionGroup,
  EventTypeActionGroupButton,
  EventTypeBadge,
} from '@/components/event-types/event-type-ui';
import { SURFACE } from '@/components/shared/page-section';
import { cn } from '@/lib/utils';
import { useUpdateEventType } from '@/hooks/mutations/use-event-type-mutations';
import { formatDuration, getEventTypeDurations } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import type { EventType } from '@/types';

interface EventTypeCardProps {
  eventType: EventType;
  username: string;
}

export function EventTypeCard({ eventType, username }: EventTypeCardProps) {
  const updateMutation = useUpdateEventType();
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}${ROUTES.publicBooking(username, eventType.slug)}`;
  const durations = getEventTypeDurations(eventType);

  const copyLink = async () => {
    await navigator.clipboard.writeText(publicUrl);
    toast.success('Link copied to clipboard');
  };

  return (
    <div className={cn('border-b px-4 py-4 last:border-b-0 md:px-6 md:py-4', SURFACE.rowDivider)}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-[15px] font-semibold text-white md:text-base">
              {eventType.title}
            </span>
            <span className="hidden truncate text-sm text-neutral-500 md:inline">
              /{username}/{eventType.slug}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {durations.map((mins) => (
              <EventTypeBadge key={mins}>
                <Clock className="size-3" />
                {formatDuration(mins)}
              </EventTypeBadge>
            ))}
            {eventType.is_hidden && (
              <EventTypeBadge variant="hidden">
                <EyeOff className="size-3" />
                Hidden
              </EventTypeBadge>
            )}
          </div>
        </div>

        {/* Desktop: toggle + grouped actions */}
        <div className="hidden shrink-0 items-center gap-2.5 md:flex">
          <EventTypeActiveToggle
            checked={!eventType.is_hidden}
            disabled={updateMutation.isPending}
            onCheckedChange={(checked) =>
              updateMutation.mutate({ id: eventType.id, data: { is_hidden: !checked } })
            }
          />

          <EventTypeActionGroup>
            <EventTypeActionGroupButton
              label="Open booking page"
              onClick={() => window.open(publicUrl, '_blank')}
            >
              <ExternalLink className="size-3.5" />
            </EventTypeActionGroupButton>
            <EventTypeActionGroupButton label="Copy link" onClick={() => void copyLink()}>
              <Link2 className="size-3.5" />
            </EventTypeActionGroupButton>
            <EventTypeActions
              eventTypeId={eventType.id}
              slug={eventType.slug}
              username={username}
              eventType={eventType}
              variant="desktop"
            />
          </EventTypeActionGroup>
        </div>

        <div className="md:hidden">
          <EventTypeActions
            eventTypeId={eventType.id}
            slug={eventType.slug}
            username={username}
            eventType={eventType}
            variant="mobile"
          />
        </div>
      </div>
    </div>
  );
}
