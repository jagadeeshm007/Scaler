'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { queryKeys } from '@/lib/query-keys';
import type { Booking, CreateBookingInput } from '@/types';

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, idempotencyKey }: { data: CreateBookingInput; idempotencyKey: string }) =>
      api.post<Booking>(ENDPOINTS.bookings.create, data, { idempotencyKey }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() });
      toast.success('Booking confirmed');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function usePublicMarkRescheduled() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, timezone }: { uid: string; timezone: string }) =>
      api.patch<Booking>(
        `${ENDPOINTS.publicBookings.status(uid)}?timezone=${encodeURIComponent(timezone)}`,
        { status: 'RESCHEDULED', cancellation_reason: null },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function usePublicCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, reason, timezone }: { uid: string; reason?: string; timezone: string }) =>
      api.patch<Booking>(
        `${ENDPOINTS.publicBookings.status(uid)}?timezone=${encodeURIComponent(timezone)}`,
        { status: 'CANCELLED', cancellation_reason: reason ?? null },
      ),
    onSuccess: (_data, { uid }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.publicByUid(uid) });
      toast.success('Booking cancelled');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useMarkRescheduled() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, timezone }: { id: string; timezone: string }) =>
      api.patch<Booking>(
        `${ENDPOINTS.bookings.status(id)}?timezone=${encodeURIComponent(timezone)}`,
        { status: 'RESCHEDULED', cancellation_reason: null },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason, timezone }: { id: string; reason?: string; timezone: string }) =>
      api.patch<Booking>(
        `${ENDPOINTS.bookings.status(id)}?timezone=${encodeURIComponent(timezone)}`,
        { status: 'CANCELLED', cancellation_reason: reason ?? null },
      ),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.bookings.list({}) });
      const previous = queryClient.getQueryData<Booking[]>(queryKeys.bookings.list({}));
      queryClient.setQueryData<Booking[]>(queryKeys.bookings.list({}), (old) =>
        old?.map((b) => (b.id === id ? { ...b, status: 'CANCELLED' as const } : b)),
      );
      return { previous };
    },
    onError: (err: Error, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.bookings.list({}), ctx.previous);
      toast.error(err.message);
    },
    onSuccess: () => toast.success('Booking cancelled'),
    onSettled: () => void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() }),
  });
}
