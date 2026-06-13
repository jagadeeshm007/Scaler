'use client';

import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { queryKeys } from '@/lib/query-keys';
import type { Slot } from '@/types';

interface UseSlotsParams {
  eventTypeId: string;
  date: string | null;
  timezone: string;
  enabled?: boolean;
}

export function useSlots({ eventTypeId, date, timezone, enabled = true }: UseSlotsParams) {
  return useQuery({
    queryKey: queryKeys.slots.byDate(eventTypeId, date ?? '', timezone),
    queryFn: () =>
      api.get<Slot[]>(
        `${ENDPOINTS.slots}?eventTypeId=${eventTypeId}&date=${date}&timezone=${encodeURIComponent(timezone)}`,
      ),
    enabled: enabled && Boolean(eventTypeId && date && timezone),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
