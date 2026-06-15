'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Circle, User, Users, RefreshCw, Building2 } from 'lucide-react';
import { env } from '@/lib/env';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEventTypeSchema, type CreateEventTypeInput } from '@bolt/types';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCreateEventType } from '@/hooks/mutations/use-event-type-mutations';
import { slugify } from '@/lib/format';
import { Switch } from '@/components/ui/switch';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';
import { useUserProfile } from '@/hooks/queries/use-user-profile';

const EVENT_KINDS = [
  {
    id: 'solo',
    icon: User,
    title: 'For myself',
    description: 'Create an event on your personal profile.',
  },
  {
    id: 'collective',
    icon: Users,
    title: 'Collective',
    description: 'Schedule meetings when all selected team members are available.',
    disabled: true,
  },
  {
    id: 'round-robin',
    icon: RefreshCw,
    title: 'Round robin',
    description: 'Cycle meetings between multiple team members.',
    disabled: true,
  },
  {
    id: 'managed',
    icon: Building2,
    title: 'Managed event',
    description: 'Create & distribute event types in bulk to team members.',
    disabled: true,
  },
] as const;

export function CreateEventTypeForm() {
  const router = useRouter();
  const { data: user } = useUserProfile();
  const username = user?.username ?? '';
  const createMutation = useCreateEventType();
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [eventKind, setEventKind] = useState<string>('solo');

  const form = useForm<CreateEventTypeInput>({
    resolver: zodResolver(createEventTypeSchema.shape.body),
    defaultValues: {
      title: '',
      slug: '',
      duration_mins: 15,
      location_type: 'GOOGLE_MEET',
      is_hidden: false,
      theme_config: {
        party_mode_enabled: true,
      },
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedTitle = form.watch('title');

  useEffect(() => {
    if (!slugManuallyEdited && watchedTitle) {
      const timer = setTimeout(() => {
        form.setValue('slug', slugify(watchedTitle), { shouldValidate: true });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [watchedTitle, slugManuallyEdited, form]);

  const onSubmit = (values: CreateEventTypeInput) => {
    createMutation.mutate(values, {
      onSuccess: (created) => router.push(ROUTES.eventTypeEdit(created.id)),
    });
  };

  const appUrl = env.NEXT_PUBLIC_APP_URL;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-start justify-center px-4 py-8 md:items-center md:py-12">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-xl md:p-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Add a new event type</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set up event types to offer different types of meetings.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-300">Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Quick chat"
                      className="h-10 rounded-md border-border bg-background"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-300">URL</FormLabel>
                  <FormControl>
                    <div className="flex w-full flex-col sm:h-10 sm:flex-row overflow-hidden rounded-md border border-border bg-background focus-within:ring-2 focus-within:ring-white/20">
                      <span className="flex shrink-0 sm:max-w-[60%] items-center border-b sm:border-b-0 sm:border-r border-border px-3 py-2 sm:py-0 text-sm text-muted-foreground overflow-hidden">
                        <span className="whitespace-nowrap overflow-hidden w-full text-left [mask-image:linear-gradient(to_right,black_calc(100%-1rem),transparent_100%)]">
                          {appUrl}/{username}/
                        </span>
                      </span>
                      <input
                        {...field}
                        placeholder="quick-chat"
                        onChange={(e) => {
                          setSlugManuallyEdited(true);
                          field.onChange(e);
                        }}
                        className="min-w-0 flex-1 bg-transparent px-3 py-2 sm:py-0 text-sm text-foreground outline-none placeholder:text-neutral-600"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration_mins"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-300">Duration</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        min={1}
                        className="h-10 rounded-md border-border bg-background pr-20"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
                        Minutes
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-300">Event type</p>
              {EVENT_KINDS.map((kind) => {
                const { id, icon: Icon, title: kindTitle, description } = kind;
                const disabled = 'disabled' in kind ? kind.disabled : false;
                const selected = eventKind === id;
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && setEventKind(id)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                      selected
                        ? 'border-neutral-600 bg-accent/60'
                        : 'border-border bg-background hover:border-border',
                      disabled && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{kindTitle}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                    </div>
                    <Circle
                      className={cn(
                        'mt-0.5 size-4 shrink-0',
                        selected ? 'fill-white text-foreground' : 'text-neutral-600',
                      )}
                    />
                  </button>
                );
              })}
            </div>

            <FormField
              control={form.control}
              name="theme_config.party_mode_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border bg-background p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm text-foreground">Party Mode</FormLabel>
                    <FormDescription className="text-xs text-muted-foreground">
                      Play confetti animation upon successful booking.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? true}
                      onCheckedChange={(checked) => field.onChange(checked)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="h-10 w-full rounded-md text-sm font-medium"
              >
                Continue
              </Button>
              <Button
                type="button"
                variant="ghost"
                render={<Link href={ROUTES.eventTypes} />}
                className="text-muted-foreground hover:text-foreground"
              >
                Close
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
