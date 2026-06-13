import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { EventTypeList } from '@/components/event-types/event-type-list';
import { getServerAccessToken, serverFetch } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { getQueryClient } from '@/lib/query-client';
import { queryKeys } from '@/lib/query-keys';
import type { EventType } from '@/types';

export default async function EventTypesPage() {
  const queryClient = getQueryClient();

  try {
    const token = await getServerAccessToken();
    await queryClient.prefetchQuery({
      queryKey: queryKeys.eventTypes.list(),
      queryFn: () => serverFetch<EventType[]>(ENDPOINTS.eventTypes.list, token),
    });
  } catch {
    // client will refetch after auth hydrate
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EventTypeList />
    </HydrationBoundary>
  );
}
