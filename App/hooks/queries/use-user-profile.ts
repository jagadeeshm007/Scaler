'use client';

import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { queryKeys } from '@/lib/query-keys';
import type { AuthUser } from '@/types';

export function useUserProfile() {
  return useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: () => api.get<AuthUser>(ENDPOINTS.users.me),
    staleTime: 60_000,
  });
}
