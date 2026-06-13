'use client';

import { use } from 'react';

import { EventTypeForm } from '@/components/event-types/event-type-form';
import { Skeleton } from '@/components/ui/skeleton';
import { useEventType } from '@/hooks/queries/use-event-type';

export default function EditEventTypePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = useEventType(id);

  if (isLoading) return <Skeleton className="h-96 w-full max-w-2xl" />;
  if (!data) return <p className="text-sm text-muted-foreground">Event type not found</p>;

  return <EventTypeForm mode="edit" eventType={data} />;
}
