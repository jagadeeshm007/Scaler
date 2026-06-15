'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { connectIntegration, disconnectIntegration } from '@/lib/api/apps';
import { updateUserProfile, updateUserSettings } from '@/lib/api/users';
import { queryKeys } from '@/lib/constants/query-keys';
import type { AuthUser, UpdateUserInput } from '@/types';

export function useConnectIntegration() {
  return useMutation({
    mutationFn: async (slug: string) => {
      const data = await connectIntegration(slug);
      window.location.href = data.authUrl;
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDisconnectIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => disconnectIntegration(slug),
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
    mutationFn: (data: UpdateUserInput) => updateUserProfile(data),
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
    mutationFn: (data: unknown) => updateUserSettings(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.user.me() });
      const previous = queryClient.getQueryData<AuthUser>(queryKeys.user.me());
      if (previous) {
        // Optimistically update settings
        const newSettings = {
          ...(previous as unknown as { settings: Record<string, string> }).settings,
          ...(data as Record<string, string>),
        };
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
