'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { queryKeys } from '@/lib/query-keys';
import type { AuthUser, UpdateUserInput } from '@/types';

export function useConnectIntegration() {
  return useMutation({
    mutationFn: async (slug: string) => {
      const data = await api.get<{ authUrl: string }>(ENDPOINTS.integrations.connect(slug));
      window.location.href = data.authUrl;
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDisconnectIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => api.del<void>(ENDPOINTS.integrations.delete(slug)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.integrations.all() });
      toast.success('Integration disconnected');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserInput) => api.patch<AuthUser>(ENDPOINTS.users.me, data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.user.me() });
      const previous = queryClient.getQueryData<AuthUser>(queryKeys.user.me());
      if (previous) {
        queryClient.setQueryData<AuthUser>(queryKeys.user.me(), { ...previous, ...data });
      }
      return { previous };
    },
    onError: (err: Error, _data, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.user.me(), ctx.previous);
      toast.error(err.message);
    },
    onSuccess: () => toast.success('Profile updated'),
    onSettled: () => void queryClient.invalidateQueries({ queryKey: queryKeys.user.me() }),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.patch<AuthUser>(ENDPOINTS.users.settings, data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.user.me() });
      const previous = queryClient.getQueryData<AuthUser>(queryKeys.user.me());
      if (previous) {
        // Optimistically update settings
        const newSettings = { ...(previous as any).settings, ...data };
        queryClient.setQueryData<AuthUser>(queryKeys.user.me(), {
          ...previous,
          settings: newSettings,
        } as AuthUser);
      }
      return { previous };
    },
    onError: (err: Error, _data, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.user.me(), ctx.previous);
      toast.error(err.message);
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: queryKeys.user.me() }),
  });
}
