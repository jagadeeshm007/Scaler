'use client';

import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { Clock, EyeOff, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { toast } from 'sonner';

import { EventTypeActions } from '@/components/event-types/event-type-actions';
import { EventTypeActiveToggle } from '@/components/event-types/event-type-active-toggle';
import {
  EventTypeActionGroup,
  EventTypeActionGroupButton,
  EventTypeBadge,
  EventTypeDragHandleIcon,
  EventTypeLinkIcon,
} from '@/components/event-types/event-type-ui';
import { SURFACE } from '@/components/shared/page-section';
import { cn } from '@/lib/utils';
import { useUpdateEventType } from '@/hooks/mutations/use-event-type-mutations';
import { formatDuration, getEventTypeDurations } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import type { EventType } from '@/types';

function stopDragPointer(e: React.PointerEvent) {
  e.stopPropagation();
}

interface EventTypeCardProps {
  eventType: EventType;
  username: string;
  isSortable?: boolean;
  isOverlay?: boolean;
  showDragHandle?: boolean;
  dragProps?: {
    attributes: DraggableAttributes;
    listeners: SyntheticListenerMap | undefined;
  };
}

export function EventTypeCard({
  eventType,
  username,
  isSortable = false,
  isOverlay = false,
  showDragHandle = false,
  dragProps,
}: EventTypeCardProps) {
  const router = useRouter();
  const updateMutation = useUpdateEventType();
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}${ROUTES.publicBooking(username, eventType.slug)}`;
  const durations = getEventTypeDurations(eventType);
  const editHref = ROUTES.eventTypeEdit(eventType.id);

  const copyLink = async () => {
    await navigator.clipboard.writeText(publicUrl);
    toast.success('Link copied to clipboard');
  };

  const openEdit = () => {
    router.push(editHref);
  };

  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const handleSortableClick = (event: React.MouseEvent) => {
    if (dragStart.current) {
      const dx = Math.abs(event.clientX - dragStart.current.x);
      const dy = Math.abs(event.clientY - dragStart.current.y);
      dragStart.current = null;
      if (dx > 4 || dy > 4) return;
    }

    openEdit();
  };

  const dragListeners = dragProps?.listeners
    ? {
        ...dragProps.listeners,
        onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
          dragStart.current = { x: event.clientX, y: event.clientY };
          dragProps.listeners?.onPointerDown?.(event as unknown as PointerEvent);
        },
      }
    : undefined;

  const content = (
    <div className="flex items-center justify-between gap-3 md:gap-4">
      {isSortable ? (
        <div
          className={cn(
            'flex w-4 shrink-0 items-center justify-center text-neutral-500 transition-opacity duration-150',
            showDragHandle ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-active:opacity-100',
          )}
          aria-hidden
        >
          <EventTypeDragHandleIcon />
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-sm font-semibold text-white md:text-[15px]">
            {eventType.title}
          </span>
          <span className="hidden truncate text-sm text-neutral-500 md:inline">
            /{username}/{eventType.slug}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-1.5">
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

      <div
        className="hidden shrink-0 items-center gap-2.5 md:flex"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        onPointerDown={stopDragPointer}
      >
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
            <EventTypeLinkIcon className="size-3.5" />
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

      <div
        className="md:hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        onPointerDown={stopDragPointer}
      >
        <EventTypeActions
          eventTypeId={eventType.id}
          slug={eventType.slug}
          username={username}
          eventType={eventType}
          variant="mobile"
        />
      </div>
    </div>
  );

  const rowClass = 'px-4 py-2.5 transition-colors md:px-6 md:py-2.5';

  if (isOverlay) {
    return <div className={cn(rowClass, SURFACE.innerList)}>{content}</div>;
  }

  if (isSortable && dragProps) {
    return (
      <div
        className={cn(
          'group',
          rowClass,
          'cursor-grab active:cursor-grabbing hover:bg-neutral-800/30',
        )}
        {...dragProps.attributes}
        {...dragListeners}
        onClick={handleSortableClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openEdit();
          }
        }}
        role="link"
        tabIndex={0}
        aria-label={`Edit ${eventType.title}`}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className={cn(rowClass, 'cursor-pointer hover:bg-neutral-800/30')}
      onClick={openEdit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openEdit();
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`Edit ${eventType.title}`}
    >
      {content}
    </div>
  );
}
