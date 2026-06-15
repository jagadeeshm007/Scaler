'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchAvailabilityList, fetchAvailability } from '@/lib/api/availability';
import { queryKeys } from '@/lib/constants/query-keys';
import { useAuthReady } from '@/hooks/use-auth-ready';

export function useAvailability() {
  const isAuthReady = useAuthReady();
  return useQuery({
    queryKey: queryKeys.availability.list(),
    queryFn: () => fetchAvailabilityList(),
    staleTime: 30_000,
    enabled: isAuthReady,
  });
}

export function useSchedule(id: string) {
  const isAuthReady = useAuthReady();
  return useQuery({
    queryKey: queryKeys.availability.byId(id),
    queryFn: () => fetchAvailability(id),
    enabled: Boolean(id) && isAuthReady,
  });
}
