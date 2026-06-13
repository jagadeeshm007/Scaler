'use client';

import { useEffect, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
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
    setOrderedItems(items);
  }, [items]);

  const activeItem = activeId ? orderedItems.find((item) => item.id === activeId) : null;
  const isListDragging = activeId !== null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
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
    clearDragState();

    if (!over || active.id === over.id) return;

    const oldIndex = orderedItems.findIndex((item) => item.id === active.id);
    const newIndex = orderedItems.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const nextItems = arrayMove(orderedItems, oldIndex, newIndex);
    setOrderedItems(nextItems);
    reorderMutation.mutate({ ids: nextItems.map((item) => item.id) });
  };

  const handleDragCancel = () => {
    clearDragState();
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        className={cn(
          isListDragging ? 'flex flex-col gap-2 md:gap-2.5' : 'divide-y divide-neutral-800',
        )}
      >
        <SortableContext
          items={orderedItems.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
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
              'cursor-grabbing overflow-hidden rounded-lg border border-neutral-800',
              SURFACE.innerList,
            )}
            style={activeWidth ? { width: activeWidth } : undefined}
          >
            <EventTypeCard
              eventType={activeItem}
              username={username}
              isOverlay
              showDragHandle
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
