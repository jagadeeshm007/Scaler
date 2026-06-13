'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  Code2,
  ExternalLink,
  Link2,
  Palette,
  RefreshCw,
  Shield,
  Trash2,
  Users,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateEventTypeSchema, type UpdateEventTypeInput } from '@scaler/types';
import { toast } from 'sonner';

import { EventTypeActiveToggle } from '@/components/event-types/event-type-active-toggle';
import {
  EventTypeActionGroup,
  EventTypeActionGroupButton,
  EventTypeBadge,
} from '@/components/event-types/event-type-ui';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
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
  useDeleteEventType,
  useUpdateEventType,
} from '@/hooks/mutations/use-event-type-mutations';
import { formatDuration } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import type { EventType } from '@/types';

const LOCATION_OPTIONS = [
  { value: 'CAL_VIDEO', label: 'Cal Video (Default)' },
  { value: 'GOOGLE_MEET', label: 'Google Meet' },
  { value: 'ZOOM', label: 'Zoom' },
  { value: 'IN_PERSON', label: 'In person' },
  { value: 'PHONE', label: 'Phone call' },
] as const;

const SIDEBAR_SECTIONS = [
  {
    group: 'Setup',
    items: [
      { id: 'basics', label: 'Basics', icon: Clock, active: true },
      { id: 'availability', label: 'Availability', icon: Calendar, disabled: true },
    ],
  },
  {
    group: 'Booking experience',
    items: [
      { id: 'appearance', label: 'Appearance', icon: Palette, disabled: true },
      { id: 'recurring', label: 'Recurring', icon: RefreshCw, disabled: true },
      { id: 'seats', label: 'Seats', icon: Users, disabled: true },
    ],
  },
  {
    group: 'Policies',
    items: [{ id: 'privacy', label: 'Privacy & security', icon: Shield, disabled: true }],
  },
] as const;

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120];

interface EditEventTypeFormProps {
  eventType: EventType;
}

export function EditEventTypeForm({ eventType }: EditEventTypeFormProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const username = user?.username ?? '';
  const updateMutation = useUpdateEventType();
  const deleteMutation = useDeleteEventType();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [allowMultiple, setAllowMultiple] = useState(
    (eventType.duration_options?.length ?? 0) > 1,
  );
  const [selectedDurations, setSelectedDurations] = useState<number[]>(
    eventType.duration_options?.length
      ? eventType.duration_options
      : [eventType.duration_mins],
  );

  const form = useForm<UpdateEventTypeInput>({
    resolver: zodResolver(updateEventTypeSchema.shape.body),
    defaultValues: {
      title: eventType.title,
      slug: eventType.slug,
      description: eventType.description ?? '',
      duration_mins: eventType.duration_mins,
      location_type: eventType.location_type,
      is_hidden: eventType.is_hidden,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const publicUrl = `${appUrl}${ROUTES.publicBooking(username, eventType.slug)}`;
  const watchedTitle = form.watch('title');
  const watchedDuration = form.watch('duration_mins') ?? eventType.duration_mins;
  const watchedHidden = form.watch('is_hidden') ?? false;

  useEffect(() => {
    if (!allowMultiple) {
      setSelectedDurations([watchedDuration]);
    }
  }, [allowMultiple, watchedDuration]);

  const toggleDuration = (mins: number) => {
    setSelectedDurations((prev) => {
      if (prev.includes(mins)) {
        if (prev.length === 1) return prev;
        return prev.filter((d) => d !== mins);
      }
      return [...prev, mins].sort((a, b) => a - b);
    });
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(publicUrl);
    toast.success('Link copied to clipboard');
  };

  const onSubmit = (values: UpdateEventTypeInput) => {
    const durationOptions = allowMultiple ? selectedDurations : [];
    const primaryDuration = allowMultiple
      ? (selectedDurations[0] ?? values.duration_mins ?? eventType.duration_mins)
      : (values.duration_mins ?? eventType.duration_mins);

    updateMutation.mutate(
      {
        id: eventType.id,
        data: {
          ...values,
          duration_mins: primaryDuration,
          duration_options: durationOptions,
        },
      },
      { onSuccess: () => toast.success('Event type saved') },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(eventType.id, {
      onSuccess: () => router.push(ROUTES.eventTypes),
    });
  };

  const previewDurations = allowMultiple ? selectedDurations : [watchedDuration];

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 border-b border-neutral-800 px-4 py-3 md:px-6">
        <h1 className="truncate text-lg font-semibold text-white">{watchedTitle || eventType.title}</h1>
        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-sm text-neutral-400">Hidden</span>
            <EventTypeActiveToggle
              checked={watchedHidden}
              onCheckedChange={(checked) => form.setValue('is_hidden', checked)}
            />
          </div>
          <EventTypeActionGroup className="hidden md:flex">
            <EventTypeActionGroupButton
              label="Preview"
              onClick={() => window.open(publicUrl, '_blank')}
            >
              <ExternalLink className="size-[15px] stroke-[1.75]" />
            </EventTypeActionGroupButton>
            <EventTypeActionGroupButton label="Copy link" onClick={() => void copyLink()}>
              <Link2 className="size-[15px] stroke-[1.75]" />
            </EventTypeActionGroupButton>
            <EventTypeActionGroupButton
              label="Embed"
              onClick={() => toast.info('Embed coming soon')}
            >
              <Code2 className="size-[15px] stroke-[1.75]" />
            </EventTypeActionGroupButton>
            <EventTypeActionGroupButton
              label="Delete"
              showDivider={false}
              onClick={() => setDeleteOpen(true)}
              className="hover:text-red-400"
            >
              <Trash2 className="size-[15px] stroke-[1.75]" />
            </EventTypeActionGroupButton>
          </EventTypeActionGroup>
          <Button
            type="submit"
            form="edit-event-type-form"
            disabled={updateMutation.isPending}
            className="h-9 rounded-full bg-white px-4 text-sm font-medium text-black hover:bg-neutral-200"
          >
            Save
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar nav */}
        <aside className="hidden w-56 shrink-0 overflow-y-auto border-r border-neutral-800 px-3 py-4 lg:block">
          {SIDEBAR_SECTIONS.map(({ group, items }) => (
            <div key={group} className="mb-4">
              <p className="mb-1 px-2 text-xs font-medium text-neutral-600">{group}</p>
              {items.map((item) => {
                const { id, label, icon: Icon } = item;
                const active = 'active' in item ? item.active : false;
                const disabled = 'disabled' in item ? item.disabled : false;
                return (
                <button
                  key={id}
                  type="button"
                  disabled={disabled}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors',
                    active
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-500 hover:bg-neutral-800/40 hover:text-neutral-300',
                    disabled && 'cursor-not-allowed opacity-40',
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
                );
              })}
            </div>
          ))}
        </aside>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <Form {...form}>
            <form
              id="edit-event-type-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="mx-auto max-w-xl space-y-6"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input className="border-neutral-800 bg-neutral-950" {...field} />
                    </FormControl>
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
                        className="min-h-24 resize-none border-neutral-800 bg-neutral-950"
                        placeholder="A brief description of this event"
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
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <div className="flex h-10 overflow-hidden rounded-md border border-neutral-800 bg-neutral-950">
                        <span className="flex shrink-0 items-center border-r border-neutral-800 px-3 text-sm text-neutral-500">
                          {appUrl.replace(/^https?:\/\//, '')}/{username}/
                        </span>
                        <input
                          {...field}
                          className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="duration_mins"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <div className="relative max-w-xs">
                          <Input
                            type="number"
                            min={1}
                            disabled={allowMultiple}
                            className="border-neutral-800 bg-neutral-950 pr-20"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-neutral-500">
                            Minutes
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">Allow multiple durations</p>
                    <p className="text-xs text-neutral-500">
                      Let bookers choose from several time options.
                    </p>
                  </div>
                  <Switch checked={allowMultiple} onCheckedChange={setAllowMultiple} />
                </div>

                {allowMultiple && (
                  <div className="flex flex-wrap gap-2">
                    {DURATION_PRESETS.map((mins) => {
                      const selected = selectedDurations.includes(mins);
                      return (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => toggleDuration(mins)}
                          className={cn(
                            'inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs transition-colors',
                            selected
                              ? 'border-white bg-white text-black'
                              : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-600',
                          )}
                        >
                          <Clock className="size-3" />
                          {formatDuration(mins)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="location_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-neutral-800 bg-neutral-950">
                          <SelectValue />
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

              <div className="flex items-center gap-3 sm:hidden">
                <FormField
                  control={form.control}
                  name="is_hidden"
                  render={({ field }) => (
                    <FormItem className="flex flex-1 items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
                      <FormLabel>Hidden</FormLabel>
                      <FormControl>
                        <EventTypeActiveToggle
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" asChild>
                  <Link href={ROUTES.eventTypes}>Back</Link>
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Preview panel */}
        <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-neutral-800 bg-neutral-900/50 p-4 xl:block">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-600">Preview</p>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <p className="text-sm font-medium text-white">{user?.full_name ?? 'Host'}</p>
            <h2 className="mt-3 text-lg font-semibold text-white">{watchedTitle || 'Event title'}</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {previewDurations.map((mins) => (
                <span
                  key={mins}
                  className="inline-flex items-center gap-1 text-xs text-neutral-400"
                >
                  <Clock className="size-3" />
                  {formatDuration(mins)}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              {LOCATION_OPTIONS.find((l) => l.value === form.watch('location_type'))?.label ??
                'Location'}
            </p>
            {watchedHidden && (
              <EventTypeBadge variant="hidden" className="mt-3">
                Hidden from profile
              </EventTypeBadge>
            )}
          </div>
          <p className="mt-4 text-center text-xs text-blue-400">
            Save changes to preview all updates.
          </p>
        </aside>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete event type"
        description={`Are you sure you want to delete "${eventType.slug}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
