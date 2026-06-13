'use client';

import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { defaultAnimateLayoutChanges, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { EventTypeCard } from '@/components/event-types/event-type-card';
import { EventTypeListRowPlaceholder } from '@/components/event-types/event-type-ui';
import { SURFACE } from '@/components/shared/page-section';
import { cn } from '@/lib/utils';
import type { EventType } from '@/types';

const SORT_TRANSITION = {
  duration: 250,
  easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
};

interface SortableEventTypeCardProps {
  eventType: EventType;
  username: string;
  isListDragging: boolean;
}

export function SortableEventTypeCard({
  eventType,
  username,
  isListDragging,
}: SortableEventTypeCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: eventType.id,
    animateLayoutChanges: defaultAnimateLayoutChanges,
    transition: SORT_TRANSITION,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dragProps: {
    attributes: DraggableAttributes;
    listeners: SyntheticListenerMap | undefined;
  } = { attributes, listeners };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        isListDragging &&
          !isDragging &&
          cn('overflow-hidden rounded-lg border border-neutral-800', SURFACE.innerList),
      )}
    >
      {isDragging ? (
        <EventTypeListRowPlaceholder className="min-h-[64px]" />
      ) : (
        <EventTypeCard
          eventType={eventType}
          username={username}
          isSortable
          dragProps={dragProps}
        />
      )}
    </div>
  );
}
