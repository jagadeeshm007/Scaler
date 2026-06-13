'use client';

import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { queryKeys } from '@/lib/query-keys';
import { useAuthReady } from '@/hooks/use-auth-ready';
import type { EventType } from '@/types';

export function useEventTypes() {
  const isAuthReady = useAuthReady();
  return useQuery({
    queryKey: queryKeys.eventTypes.list(),
    queryFn: () => api.get<EventType[]>(ENDPOINTS.eventTypes.list),
    staleTime: 30_000,
    enabled: isAuthReady,
  });
}
