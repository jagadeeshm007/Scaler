'use client';

import { Clock, EyeOff, ExternalLink, Link2 } from 'lucide-react';
import { toast } from 'sonner';

import { EventTypeActions } from '@/components/event-types/event-type-actions';
import { Switch } from '@/components/ui/switch';
import { useUpdateEventType } from '@/hooks/mutations/use-event-type-mutations';
import { formatDuration } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import type { EventType } from '@/types';

interface EventTypeCardProps {
  eventType: EventType;
  username: string;
}

function IconActionButton({
  label,
  onClick,
  children,
  className,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'flex size-8 items-center justify-center rounded-md border border-neutral-800 bg-neutral-950 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function EventTypeCard({ eventType, username }: EventTypeCardProps) {
  const updateMutation = useUpdateEventType();
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}${ROUTES.publicBooking(username, eventType.slug)}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(publicUrl);
    toast.success('Link copied to clipboard');
  };

  return (
    <div className="border-b border-neutral-800 px-4 py-4 last:border-b-0 md:px-6 md:py-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Title + slug inline on desktop */}
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-[15px] font-semibold text-white md:text-base">
              {eventType.title}
            </span>
            <span className="hidden truncate text-sm text-neutral-500 md:inline">
              /{username}/{eventType.slug}
            </span>
          </div>

          {/* Badges */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md border border-neutral-800 bg-neutral-950 px-2 py-0.5 text-xs text-neutral-400">
              <Clock className="size-3" />
              {formatDuration(eventType.duration_mins)}
            </span>
            {eventType.is_hidden && (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500">
                <EyeOff className="size-3" />
                Hidden
              </span>
            )}
          </div>
        </div>

        {/* Desktop actions */}
        <div className="hidden shrink-0 items-center gap-1.5 md:flex">
          <Switch
            checked={eventType.is_active}
            onCheckedChange={(checked) =>
              updateMutation.mutate({ id: eventType.id, data: { is_active: checked } })
            }
            className="h-5 w-9 border-neutral-700 data-[state=checked]:bg-neutral-500 data-[state=unchecked]:bg-neutral-800 [&_[data-slot=switch-thumb]]:size-4 [&_[data-slot=switch-thumb]]:data-[state=checked]:bg-white [&_[data-slot=switch-thumb]]:data-[state=unchecked]:bg-neutral-500"
          />
          <IconActionButton label="Open booking page" onClick={() => window.open(publicUrl, '_blank')}>
            <ExternalLink className="size-4" />
          </IconActionButton>
          <IconActionButton label="Copy link" onClick={() => void copyLink()}>
            <Link2 className="size-4" />
          </IconActionButton>
          <EventTypeActions
            eventTypeId={eventType.id}
            slug={eventType.slug}
            username={username}
            eventType={eventType}
            variant="desktop"
          />
        </div>

        {/* Mobile: ellipsis only */}
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
