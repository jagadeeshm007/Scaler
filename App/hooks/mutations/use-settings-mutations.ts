'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { connectIntegration, disconnectIntegration } from '@/lib/api/apps';
import { updateUserProfile, updateUserSettings } from '@/lib/api/users';
import { queryKeys } from '@/lib/constants/query-keys';
import type { UpdateUserInput, UpdateUserSettingsInput, UserProfile } from '@/types';

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
      const previous = queryClient.getQueryData<UserProfile>(queryKeys.user.me());
      if (previous) {
        queryClient.setQueryData<UserProfile>(queryKeys.user.me(), { ...previous, ...data });
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
    mutationFn: (data: UpdateUserSettingsInput) => updateUserSettings(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.user.me() });
      const previous = queryClient.getQueryData<UserProfile>(queryKeys.user.me());
      if (previous?.settings) {
        queryClient.setQueryData<UserProfile>(queryKeys.user.me(), {
          ...previous,
          settings: {
            ...previous.settings,
            ...data,
          },
        });
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
