import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { ScheduleEditor } from '@/components/availability/schedule-editor';
import { getQueryClient } from '@/lib/query-client';

interface AvailabilityEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AvailabilityEditPage({ params }: AvailabilityEditPageProps) {
  const { id } = await params;
  const queryClient = getQueryClient();

  return (
    <main className="px-4 py-8 sm:px-6">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ScheduleEditor scheduleId={id} />
      </HydrationBoundary>
    </main>
  );
}
