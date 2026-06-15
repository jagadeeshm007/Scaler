'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { updateUserSchema } from '@scaler/types';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useUpdateProfile } from '@/hooks/mutations/use-settings-mutations';
import { useUserProfile } from '@/hooks/queries/use-user-profile';
import type { AuthUser, UpdateUserInput } from '@/types';

interface ProfileFormProps {
  user?: AuthUser;
}

export function ProfileForm({ user: userProp }: ProfileFormProps) {
  const { data: fetchedUser, isLoading } = useUserProfile();
  const user = userProp ?? fetchedUser;
  const updateProfile = useUpdateProfile();

  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema.shape.body),
    values: user
      ? { full_name: user.full_name, timezone: user.timezone, avatar_url: user.avatar_url }
      : undefined,
  });

  if (!userProp && isLoading) return <Skeleton className="h-64 w-full max-w-lg" />;
  if (!user) return null;

  const initials = user.full_name
    .split(' ')
    .map((part: string) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const onSubmit = form.handleSubmit((values) => updateProfile.mutate(values));

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="max-w-lg space-y-6">
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            <AvatarImage src={user.avatar_url ?? undefined} alt={user.full_name} />
            <AvatarFallback className="bg-pink-600 text-foreground">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">{user.full_name}</p>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>
        </div>

        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input disabled={updateProfile.isPending} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <FormControl>
                <Input placeholder="Asia/Kolkata" disabled={updateProfile.isPending} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="avatar_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/avatar.jpg"
                  disabled={updateProfile.isPending}
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-medium text-foreground">Email</p>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>

        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          Update
        </Button>
      </form>
    </Form>
  );
}
