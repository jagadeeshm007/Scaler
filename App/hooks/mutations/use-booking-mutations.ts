'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createBooking, updateBookingStatus, updatePublicBookingStatus } from '@/lib/api/bookings';
import { queryKeys } from '@/lib/constants/query-keys';
import type { Booking } from '@/types';

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, idempotencyKey }: { data: unknown; idempotencyKey?: string }) =>
      createBooking(data, idempotencyKey || ''),
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
      updatePublicBookingStatus(
        uid,
        { status: 'RESCHEDULED', cancellation_reason: null },
        timezone,
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
      updatePublicBookingStatus(
        uid,
        { status: 'CANCELLED', cancellation_reason: reason ?? null },
        timezone,
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
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { status: string; cancellation_reason?: string | null };
    }) => updateBookingStatus(id, data),
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
      updateBookingStatus(
        id,
        { status: 'CANCELLED', cancellation_reason: reason ?? null },
        timezone,
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
