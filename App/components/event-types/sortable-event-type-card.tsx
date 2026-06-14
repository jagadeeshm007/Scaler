'use client';

import { defaultAnimateLayoutChanges, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { EventTypeCard } from '@/components/event-types/event-type-card';
import { cn } from '@/lib/utils';
import type { EventType } from '@/types';

import React from 'react';

const SORT_TRANSITION = {
  duration: 250,
  easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
};

interface SortableEventTypeCardProps {
  eventType: EventType;
  username: string;
  isListDragging: boolean;
}

export const SortableEventTypeCard = React.memo(function SortableEventTypeCard({
  eventType,
  username,
  isListDragging,
}: SortableEventTypeCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: eventType.id,
    animateLayoutChanges: defaultAnimateLayoutChanges,
    transition: SORT_TRANSITION,
  });

  const combinedTransition = transition
    ? `${transition}, margin 300ms ease-in-out, border-radius 300ms ease-in-out, border-color 300ms ease-in-out, box-shadow 300ms ease-in-out`
    : 'margin 300ms ease-in-out, border-radius 300ms ease-in-out, border-color 300ms ease-in-out, box-shadow 300ms ease-in-out';

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: combinedTransition,
  };

  const dragProps = React.useMemo(
    () => ({
      attributes,
      listeners,
    }),
    [attributes, listeners],
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'overflow-hidden bg-card',
        isListDragging
          ? 'mb-2 rounded-lg border border-border shadow-sm last:mb-0'
          : 'rounded-none border-b border-transparent border-b-border last:border-b-transparent',
      )}
    >
      {isDragging ? (
        <div className="min-h-[88px] rounded-lg border-2 border-dashed border-border/60 bg-transparent" />
      ) : (
        <EventTypeCard eventType={eventType} username={username} isSortable dragProps={dragProps} />
      )}
    </div>
  );
});
