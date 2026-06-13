'use client';

import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { queryKeys } from '@/lib/query-keys';
import type { PublicEventType, Slot } from '@/types';

interface UsePublicEventTypeParams {
  username: string;
  slug: string;
  enabled?: boolean;
}

export function usePublicEventType({ username, slug, enabled = true }: UsePublicEventTypeParams) {
  return useQuery({
    queryKey: queryKeys.eventTypes.public(username, slug),
    queryFn: () => api.get<PublicEventType>(ENDPOINTS.eventTypes.public(username, slug)),
    enabled: enabled && Boolean(username && slug),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useSlots(eventTypeId: string, date: string | null, timezone: string) {
  return useQuery({
    queryKey: queryKeys.slots.byDate(eventTypeId, date ?? '', timezone),
    queryFn: () =>
      api.get<Slot[]>(
        `${ENDPOINTS.slots}?eventTypeId=${eventTypeId}&date=${date}&timezone=${encodeURIComponent(timezone)}`,
      ),
    enabled: Boolean(eventTypeId && date && timezone),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
