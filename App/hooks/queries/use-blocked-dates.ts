'use client';

import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { queryKeys } from '@/lib/query-keys';
import type { BlockedDatesData } from '@/types';

interface UseBlockedDatesParams {
  username: string;
  month: string; // "YYYY-MM"
  enabled?: boolean;
}

export function useBlockedDates({ username, month, enabled = true }: UseBlockedDatesParams) {
  return useQuery({
    queryKey: queryKeys.blockedDates.byMonth(username, month),
    queryFn: () =>
      api.get<BlockedDatesData>(`${ENDPOINTS.eventTypes.blockedDates(username)}?month=${month}`),
    staleTime: 5 * 60_000,
    enabled: enabled && Boolean(username && month),
  });
}
