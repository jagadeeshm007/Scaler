'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchEventTypes } from '@/lib/api/event-types';
import { useAuthReady } from '@/hooks/use-auth-ready';
import { queryKeys } from '@/lib/constants/query-keys';

export function useEventTypes() {
  const isAuthReady = useAuthReady();
  return useQuery({
    queryKey: queryKeys.eventTypes.list(),
    queryFn: () => fetchEventTypes(),
    staleTime: 30_000,
    enabled: isAuthReady,
  });
}
