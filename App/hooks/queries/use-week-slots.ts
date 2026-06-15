'use client';

import { useQueries } from '@tanstack/react-query';

import { fetchSlots } from '@/lib/api/event-types';
import { queryKeys } from '@/lib/constants/query-keys';
import { Slot } from '@/types';

interface UseWeekSlotsParams {
  eventTypeId: string;
  dates: string[];
  timezone: string;
  enabled?: boolean;
}

export function useWeekSlots({ eventTypeId, dates, timezone, enabled = true }: UseWeekSlotsParams) {
  const results = useQueries({
    queries: dates.map((date) => ({
      queryKey: queryKeys.slots.byDate(eventTypeId, date, timezone),
      queryFn: () => fetchSlots(eventTypeId, date, timezone),
      enabled: enabled && Boolean(eventTypeId && date && timezone),
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    })),
  });

  const slotsByDate: Record<string, Slot[]> = {};
  dates.forEach((date, i) => {
    const r = results[i];
    slotsByDate[date] = r?.data?.filter((s) => s.available) ?? [];
  });

  const isLoading = results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);

  return { slotsByDate, isLoading, isError };
}
