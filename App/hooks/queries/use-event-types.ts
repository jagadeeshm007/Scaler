'use client';

import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { queryKeys } from '@/lib/query-keys';
import type { EventType } from '@/types';

export function useEventTypes() {
  return useQuery({
    queryKey: queryKeys.eventTypes.list(),
    queryFn: () => api.get<EventType[]>(ENDPOINTS.eventTypes.list),
    staleTime: 30_000,
  });
}
