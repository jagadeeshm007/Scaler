'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchSlots } from '@/lib/api/event-types';
import { queryKeys } from '@/lib/constants/query-keys';

interface UseSlotsParams {
  eventTypeId: string;
  date: string | null;
  timezone: string;
  enabled?: boolean;
}

export function useSlots({ eventTypeId, date, timezone, enabled = true }: UseSlotsParams) {
  return useQuery({
    queryKey: queryKeys.slots.byDate(eventTypeId, date ?? '', timezone),
    queryFn: () => fetchSlots(eventTypeId, date ?? '', timezone),
    enabled: enabled && Boolean(eventTypeId && date && timezone),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
