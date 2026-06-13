'use client';

import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { queryKeys } from '@/lib/query-keys';
import { useAuthReady } from '@/hooks/use-auth-ready';
import { useAuthStore } from '@/store/auth.store';
import type { Booking } from '@/types';

export function useBookings() {
  const isAuthReady = useAuthReady();
  return useQuery({
    queryKey: queryKeys.bookings.list({}),
    queryFn: () => api.get<Booking[]>(ENDPOINTS.bookings.list),
    staleTime: 0,
    refetchOnWindowFocus: true,
    enabled: isAuthReady,
  });
}

export function useBooking(id: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: queryKeys.bookings.byId(id),
    queryFn: () => api.get<Booking>(ENDPOINTS.bookings.byId(id)),
    enabled: Boolean(id) && isAuthenticated,
  });
}

export function usePublicBooking(uid: string) {
  return useQuery({
    queryKey: queryKeys.bookings.publicByUid(uid),
    queryFn: () => api.get<Booking>(ENDPOINTS.publicBookings.byUid(uid)),
    enabled: Boolean(uid),
  });
}
