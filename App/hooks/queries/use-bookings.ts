'use client';

import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { queryKeys } from '@/lib/query-keys';
import { useAuthStore } from '@/store/auth.store';
import type { Booking } from '@/types';

export function useBookings() {
  return useQuery({
    queryKey: queryKeys.bookings.list({}),
    queryFn: () => api.get<Booking[]>(ENDPOINTS.bookings.list),
    staleTime: 0,
    refetchOnWindowFocus: true,
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
