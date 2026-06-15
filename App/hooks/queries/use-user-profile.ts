'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchUserProfile } from '@/lib/api/users';
import { queryKeys } from '@/lib/constants/query-keys';
import { useAuthReady } from '@/hooks/use-auth-ready';
export function useUserProfile() {
  const isAuthReady = useAuthReady();
  return useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: () => fetchUserProfile(),
    staleTime: 30 * 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: isAuthReady,
  });
}
