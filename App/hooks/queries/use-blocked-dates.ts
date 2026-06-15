'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchBlockedDates } from '@/lib/api/event-types';
import { queryKeys } from '@/lib/constants/query-keys';

interface UseBlockedDatesParams {
  username: string;
  month: string; // "YYYY-MM"
  enabled?: boolean;
}

export function useBlockedDates({ username, month, enabled = true }: UseBlockedDatesParams) {
  return useQuery({
    queryKey: queryKeys.blockedDates.byMonth(username, month),
    queryFn: () => fetchBlockedDates(username, month),
    staleTime: 5 * 60_000,
    enabled: enabled && Boolean(username && month),
  });
}
