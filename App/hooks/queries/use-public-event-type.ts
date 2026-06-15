'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchPublicEventType, fetchSlots } from '@/lib/api/event-types';
import { queryKeys } from '@/lib/constants/query-keys';

interface UsePublicEventTypeParams {
  username: string;
  slug: string;
  enabled?: boolean;
}

export function usePublicEventType({ username, slug, enabled = true }: UsePublicEventTypeParams) {
  return useQuery({
    queryKey: queryKeys.eventTypes.public(username, slug),
    queryFn: () => fetchPublicEventType(username, slug),
    enabled: enabled && Boolean(username && slug),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useSlots(eventTypeId: string, date: string | null, timezone: string) {
  return useQuery({
    queryKey: queryKeys.slots.byDate(eventTypeId, date ?? '', timezone),
    queryFn: () => fetchSlots(eventTypeId, date ?? '', timezone),
    enabled: Boolean(eventTypeId && date && timezone),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
