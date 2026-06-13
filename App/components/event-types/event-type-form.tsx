'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createEventTypeSchema,
  updateEventTypeSchema,
  type CreateEventTypeInput,
  type UpdateEventTypeInput,
} from '@scaler/types';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  useCreateEventType,
  useUpdateEventType,
} from '@/hooks/mutations/use-event-type-mutations';
import { useDebounce } from '@/hooks/use-debounce';
import { slugify } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { useAuthStore } from '@/store/auth.store';
import type { EventType } from '@/types';

const LOCATION_OPTIONS = [
  { value: 'GOOGLE_MEET', label: 'Google Meet' },
  { value: 'ZOOM', label: 'Zoom' },
  { value: 'CAL_VIDEO', label: 'Cal Video' },
  { value: 'IN_PERSON', label: 'In person' },
  { value: 'PHONE', label: 'Phone call' },
] as const;

interface EventTypeFormProps {
  mode: 'create' | 'edit';
  eventType?: EventType;
}

export function EventTypeForm({ mode, eventType }: EventTypeFormProps) {
  const router = useRouter();
  const username = useAuthStore((s) => s.user?.username ?? '');
  const createMutation = useCreateEventType();
  const updateMutation = useUpdateEventType();
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(mode === 'edit');

  const form = useForm<CreateEventTypeInput>({
    resolver: zodResolver(
      mode === 'create' ? createEventTypeSchema.shape.body : updateEventTypeSchema.shape.body,
    ),
    defaultValues: {
      title: eventType?.title ?? '',
      slug: eventType?.slug ?? '',
      description: eventType?.description ?? '',
      duration_mins: eventType?.duration_mins ?? 30,
      location_type: eventType?.location_type ?? 'GOOGLE_MEET',
      is_hidden: eventType?.is_hidden ?? false,
    },
  });

  const title = form.watch('title');
  const slug = form.watch('slug');
  const debouncedTitle = useDebounce(title, 500);

  useEffect(() => {
    if (mode === 'create' && !slugManuallyEdited && debouncedTitle) {
      form.setValue('slug', slugify(debouncedTitle), { shouldValidate: true });
    }
  }, [debouncedTitle, slugManuallyEdited, form, mode]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: CreateEventTypeInput | UpdateEventTypeInput) => {
    if (mode === 'create') {
      createMutation.mutate(values as CreateEventTypeInput, {
        onSuccess: () => router.push(ROUTES.eventTypes),
      });
      return;
    }

    if (!eventType) return;

    updateMutation.mutate(
      { id: eventType.id, data: values as UpdateEventTypeInput },
      { onSuccess: () => router.push(ROUTES.eventTypes) },
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-2xl space-y-6 px-6 py-6">
        <div>
          <h1 className="text-xl font-semibold text-white">
            {mode === 'create' ? 'Create event type' : 'Edit event type'}
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Configure how this event appears on your booking page.
          </p>
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Quick chat" {...field} />
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
              <FormLabel>URL slug</FormLabel>
              <FormControl>
                <Input
                  placeholder="quick-chat"
                  {...field}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    field.onChange(e);
                  }}
                />
              </FormControl>
              <FormDescription>
                <span className="text-neutral-500">{username || 'username'}/</span>
                <span className="text-white">{slug || 'event-slug'}</span>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A brief description of this event"
                  className="min-h-24 resize-none"
                  {...field}
                  value={field.value ?? ''}
                />
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
              <FormLabel>Duration (minutes)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="border-neutral-800 bg-neutral-900">
                  {LOCATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_hidden"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-4">
              <div className="space-y-0.5">
                <FormLabel>Hidden</FormLabel>
                <FormDescription>
                  Hide this event type from your public booking page.
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isPending}>
            {mode === 'create' ? 'Create event type' : 'Save changes'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push(ROUTES.eventTypes)}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
