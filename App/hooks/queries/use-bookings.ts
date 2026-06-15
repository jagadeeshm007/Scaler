'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchBookings, fetchBooking, fetchPublicBooking } from '@/lib/api/bookings';
import { queryKeys } from '@/lib/constants/query-keys';
import { useAuthReady } from '@/hooks/use-auth-ready';
import { useAuthStore } from '@/store/auth.store';

export function useBookings() {
  const isAuthReady = useAuthReady();
  return useQuery({
    queryKey: queryKeys.bookings.list({}),
    queryFn: () => fetchBookings(),
    staleTime: 0,
    refetchOnWindowFocus: true,
    enabled: isAuthReady,
  });
}

export function useBooking(id: string) {
  const isAuthenticated = useAuthStore((s) => s.accessToken !== null);
  return useQuery({
    queryKey: queryKeys.bookings.byId(id),
    queryFn: () => fetchBooking(id),
    enabled: Boolean(id) && isAuthenticated,
  });
}

export function usePublicBooking(uid: string) {
  return useQuery({
    queryKey: queryKeys.bookings.publicByUid(uid),
    queryFn: () => fetchPublicBooking(uid),
    enabled: Boolean(uid),
  });
}
