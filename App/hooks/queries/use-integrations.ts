'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchIntegrations } from '@/lib/api/apps';
import { queryKeys } from '@/lib/constants/query-keys';
import { useAuthReady } from '@/hooks/use-auth-ready';
export function useIntegrations() {
  const isAuthReady = useAuthReady();
  return useQuery({
    queryKey: queryKeys.integrations.list(),
    queryFn: () => fetchIntegrations(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    enabled: isAuthReady,
  });
}
