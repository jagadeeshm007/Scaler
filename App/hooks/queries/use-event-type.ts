'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchEventType } from '@/lib/api/event-types';
import { queryKeys } from '@/lib/constants/query-keys';
import { useAuthReady } from '@/hooks/use-auth-ready';
export function useEventType(id: string) {
  const isAuthReady = useAuthReady();
  return useQuery({
    queryKey: queryKeys.eventTypes.byId(id),
    queryFn: () => fetchEventType(id),
    staleTime: 60_000,
    enabled: Boolean(id) && isAuthReady,
  });
}
