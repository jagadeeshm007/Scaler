'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { queryKeys } from '@/lib/query-keys';
import type { CreateScheduleInput, Schedule, UpdateScheduleInput } from '@/types';

export function useCreateSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateScheduleInput) =>
      api.post<Schedule>(ENDPOINTS.availability.create, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.availability.all() });
      toast.success('Schedule created');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScheduleInput }) =>
      api.put<Schedule>(ENDPOINTS.availability.update(id), data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.availability.all() });
      toast.success('Schedule saved');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<void>(ENDPOINTS.availability.delete(id)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.availability.all() });
      toast.success('Schedule deleted');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
