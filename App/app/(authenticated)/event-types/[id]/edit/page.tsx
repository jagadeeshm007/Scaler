'use client';

import { use } from 'react';

import { EditEventTypeForm } from '@/components/event-types/edit-event-type-form';
import { Skeleton } from '@/components/ui/skeleton';
import { useEventType } from '@/hooks/queries/use-event-type';

export default function EditEventTypePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = useEventType(id);

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full max-w-xl" />
      </div>
    );
  }

  if (!data) {
    return <p className="p-6 text-sm text-neutral-500">Event type not found</p>;
  }

  return <EditEventTypeForm eventType={data} />;
}
