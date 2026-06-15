'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  createEventType,
  updateEventType,
  deleteEventType,
  reorderEventTypes,
} from '@/lib/api/event-types';
import { queryKeys } from '@/lib/constants/query-keys';
import type {
  CreateEventTypeInput,
  EventType,
  ReorderEventTypesInput,
  UpdateEventTypeInput,
} from '@/types';

export function useCreateEventType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventTypeInput) => createEventType(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.eventTypes.all() });
      toast.success('Event type created');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateEventType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventTypeInput }) =>
      updateEventType(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.eventTypes.list() });
      const previous = queryClient.getQueryData<EventType[]>(queryKeys.eventTypes.list());
      queryClient.setQueryData<EventType[]>(queryKeys.eventTypes.list(), (old) =>
        old?.map((et) => (et.id === id ? { ...et, ...data } : et)),
      );
      return { previous };
    },
    onError: (err: Error, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.eventTypes.list(), ctx.previous);
      toast.error(err.message);
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: queryKeys.eventTypes.all() }),
  });
}

export function useDeleteEventType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEventType(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.eventTypes.list() });
      const previous = queryClient.getQueryData<EventType[]>(queryKeys.eventTypes.list());
      queryClient.setQueryData<EventType[]>(queryKeys.eventTypes.list(), (old) =>
        old?.filter((et) => et.id !== id),
      );
      return { previous };
    },
    onError: (err: Error, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.eventTypes.list(), ctx.previous);
      toast.error(err.message);
    },
    onSuccess: () => toast.success('Event type deleted'),
    onSettled: () => void queryClient.invalidateQueries({ queryKey: queryKeys.eventTypes.all() }),
  });
}

export function useReorderEventTypes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReorderEventTypesInput) => reorderEventTypes(data),
    onMutate: async ({ ids }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.eventTypes.list() });
      const previous = queryClient.getQueryData<EventType[]>(queryKeys.eventTypes.list());
      queryClient.setQueryData<EventType[]>(queryKeys.eventTypes.list(), (old) => {
        if (!old) return old;
        const byId = new Map(old.map((et) => [et.id, et]));
        return ids
          .map((id, index) => {
            const item = byId.get(id);
            return item ? { ...item, position: index } : null;
          })
          .filter((item): item is EventType => item !== null);
      });
      return { previous };
    },
    onError: (err: Error, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.eventTypes.list(), ctx.previous);
      toast.error(err.message);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.eventTypes.list(), data);
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: queryKeys.eventTypes.all() }),
  });
}
