'use client';

import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { queryKeys } from '@/lib/query-keys';
import { useAuthReady } from '@/hooks/use-auth-ready';
import type { Integration } from '@/types';

export function useIntegrations() {
  const isAuthReady = useAuthReady();
  return useQuery({
    queryKey: queryKeys.integrations.list(),
    queryFn: () => api.get<Integration[]>(ENDPOINTS.integrations.list),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    enabled: isAuthReady,
  });
}
