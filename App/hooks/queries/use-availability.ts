'use client';

import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { queryKeys } from '@/lib/query-keys';
import type { Schedule } from '@/types';

export function useAvailability() {
  return useQuery({
    queryKey: queryKeys.availability.list(),
    queryFn: () => api.get<Schedule[]>(ENDPOINTS.availability.list),
    staleTime: 30_000,
  });
}

export function useSchedule(id: string) {
  return useQuery({
    queryKey: queryKeys.availability.byId(id),
    queryFn: () => api.get<Schedule>(ENDPOINTS.availability.byId(id)),
    enabled: Boolean(id),
  });
}
