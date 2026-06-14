'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { EventTypeCard } from '@/components/event-types/event-type-card';
import { SortableEventTypeCard } from '@/components/event-types/sortable-event-type-card';
import { SURFACE } from '@/components/shared/page-section';
import { useReorderEventTypes } from '@/hooks/mutations/use-event-type-mutations';
import type { EventType } from '@/types';
import { cn } from '@/lib/utils';

const DROP_ANIMATION = {
  duration: 250,
  easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
} as const;

interface EventTypeSortableListProps {
  items: EventType[];
  username: string;
  onDragStateChange?: (isDragging: boolean) => void;
}

export function EventTypeSortableList({
  items,
  username,
  onDragStateChange,
}: EventTypeSortableListProps) {
  const [orderedItems, setOrderedItems] = useState(items);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeWidth, setActiveWidth] = useState<number | undefined>();
  const reorderMutation = useReorderEventTypes();

  useEffect(() => {
    queueMicrotask(() => {
      setOrderedItems(items);
    });
  }, [items]);

  const activeItem = activeId ? orderedItems.find((item) => item.id === activeId) : null;
  const isListDragging = activeId !== null;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 1 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const clearDragState = () => {
    setActiveId(null);
    setActiveWidth(undefined);
    onDragStateChange?.(false);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    setActiveWidth(event.active.rect.current.initial?.width);
    onDragStateChange?.(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      clearDragState();
      return;
    }

    const oldIndex = orderedItems.findIndex((item) => item.id === active.id);
    const newIndex = orderedItems.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) {
      clearDragState();
      return;
    }

    const nextItems = arrayMove(orderedItems, oldIndex, newIndex);
    setOrderedItems(nextItems);

    // Defer the massive layout reset and the React Query mutation
    // until exactly after the CSS drop animation completes.
    setTimeout(() => {
      clearDragState();
      reorderMutation.mutate({ ids: nextItems.map((item) => item.id) });
    }, DROP_ANIMATION.duration);
  };

  const handleDragCancel = () => {
    clearDragState();
  };

  const itemIds = useMemo(() => orderedItems.map((item) => item.id), [orderedItems]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex flex-col">
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {orderedItems.map((eventType) => (
            <SortableEventTypeCard
              key={eventType.id}
              eventType={eventType}
              username={username}
              isListDragging={isListDragging}
            />
          ))}
        </SortableContext>
      </div>

      <DragOverlay dropAnimation={DROP_ANIMATION}>
        {activeItem ? (
          <div
            className={cn(
              'cursor-grabbing overflow-hidden rounded-lg border border-border shadow-md bg-card',
              SURFACE.innerList,
            )}
            style={activeWidth ? { width: activeWidth } : undefined}
          >
            <EventTypeCard eventType={activeItem} username={username} isOverlay showDragHandle />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
