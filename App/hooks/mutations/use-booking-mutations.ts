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
    mutationFn: ({
      data,
      idempotencyKey,
    }: {
      data: CreateBookingInput;
      idempotencyKey: string;
    }) => api.post<Booking>(ENDPOINTS.bookings.create, data, { idempotencyKey }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() });
      toast.success('Booking confirmed');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      reason,
      timezone,
    }: {
      id: string;
      reason?: string;
      timezone: string;
    }) =>
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
