import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { ScheduleList } from '@/components/availability/schedule-list';
import { getQueryClient } from '@/lib/query-client';

export default function AvailabilityPage() {
  const queryClient = getQueryClient();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ScheduleList />
      </HydrationBoundary>
    </main>
  );
}
