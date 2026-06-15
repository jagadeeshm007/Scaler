'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createAvailability, updateAvailability, deleteAvailability } from '@/lib/api/availability';
import { queryKeys } from '@/lib/constants/query-keys';
export function useCreateSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => createAvailability(data),
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
    mutationFn: ({ id, data }: { id: string; data: unknown }) => updateAvailability(id, data),
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
    mutationFn: (id: string) => deleteAvailability(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.availability.all() });
      toast.success('Schedule deleted');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
