'use client';

import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { queryKeys } from '@/lib/query-keys';
import { useAuthReady } from '@/hooks/use-auth-ready';
import type { EventType } from '@/types';

export function useEventType(id: string) {
  const isAuthReady = useAuthReady();
  return useQuery({
    queryKey: queryKeys.eventTypes.byId(id),
    queryFn: () => api.get<EventType>(ENDPOINTS.eventTypes.byId(id)),
    staleTime: 60_000,
    enabled: Boolean(id) && isAuthReady,
  });
}
