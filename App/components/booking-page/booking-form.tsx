'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDays, Loader2, Plus, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { createBookingSchema } from '@scaler/types';
import { z } from 'zod';

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
import { Textarea } from '@/components/ui/textarea';
import { useCreateBooking } from '@/hooks/mutations/use-booking-mutations';
import { getErrorMessage } from '@/lib/api';
import { formatBookingDate, formatBookingTimeRange } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import type { Booking, CreateBookingInput, PublicEventType, Slot } from '@/types';

const bookingFormSchema = z.object({
  guest_name: z.string().min(2, 'Name must be at least 2 characters'),
  guest_email: z.string().email('Invalid email address'),
  guest_notes: z.string().optional().nullable(),
  additional_guests: z
    .array(z.object({ email: z.string().email('Invalid email address') }))
    .optional()
    .default([]),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  eventType: PublicEventType;
  slot: Slot;
  timezone: string;
  onBack: () => void;
  rescheduleBooking?: Booking;
  className?: string;
}

export function BookingForm({
  eventType,
  slot,
  timezone,
  onBack,
  rescheduleBooking,
  className,
}: BookingFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [submitError, setSubmitError] = useState<string | null>(null);
  const createBooking = useCreateBooking();

  const isReschedule = Boolean(rescheduleBooking);
  const prefillName = searchParams.get('name') ?? '';
  const prefillEmail = searchParams.get('email') ?? searchParams.get('rescheduledBy') ?? '';

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      guest_name: rescheduleBooking?.guest_name ?? prefillName,
      guest_email: rescheduleBooking?.guest_email ?? prefillEmail,
      guest_notes: '',
      additional_guests:
        // @ts-expect-error - Prisma client in App might not have additional_guests typed yet
        rescheduleBooking?.additional_guests?.map((email: string) => ({ email })) ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: 'additional_guests',
    control: form.control,
  });

  useEffect(() => {
    if (rescheduleBooking) {
      form.reset({
        ...form.getValues(),
        guest_name: rescheduleBooking.guest_name,
        guest_email: rescheduleBooking.guest_email,
      });
    }
  }, [rescheduleBooking, form]);

  const isPending = createBooking.isPending;

  const onSubmit = async (values: BookingFormValues) => {
    setSubmitError(null);
    const body: CreateBookingInput = {
      event_type_id: eventType.id,
      host_id: eventType.user.id,
      start_time: slot.startTime,
      end_time: slot.endTime,
      guest_name: values.guest_name,
      guest_email: values.guest_email,
      guest_notes: values.guest_notes ?? null,
      additional_guests: values.additional_guests?.map((g) => g.email) ?? [],
      timezone,
      ...(rescheduleBooking ? { reschedule_from_uid: rescheduleBooking.uid } : {}),
    };

    try {
      const booking = await createBooking.mutateAsync({
        data: body,
        idempotencyKey,
      });

      sessionStorage.setItem(`booking-${booking.id}`, JSON.stringify(booking));
      sessionStorage.setItem(`booking-uid-${booking.uid}`, JSON.stringify(booking));

      const searchParams = new URLSearchParams({
        isSuccessBookingPage: 'true',
        email: booking.guest_email,
        name: booking.guest_name,
        eventTypeSlug: eventType.slug,
        uid: booking.uid,
      });

      if (rescheduleBooking) {
        searchParams.set('formerTime', rescheduleBooking.start_time.toString());
      }

      router.push(`${ROUTES.publicBookingStatus(booking.uid)}?${searchParams.toString()}`);
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Failed to create booking'));
    }
  };

  return (
    <section className={cn('flex w-full flex-col', className)}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4">
          {/* New time header — shown in reschedule mode */}
          {isReschedule && (
            <div className="flex items-start gap-2 rounded-lg border border-border bg-accent/50 px-3 py-2.5 text-sm">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">
                  {formatBookingDate(slot.startTime, timezone)}
                </p>
                <p className="text-muted-foreground">
                  {formatBookingTimeRange(slot.startTime, slot.endTime, timezone)}
                </p>
              </div>
            </div>
          )}

          <FormField
            control={form.control}
            name="guest_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    disabled={isPending}
                    readOnly={isReschedule}
                    className={cn(
                      isReschedule &&
                        'bg-accent/60 text-muted-foreground opacity-70 pointer-events-none select-none focus-visible:ring-0',
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="guest_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address *</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    disabled={isPending}
                    readOnly={isReschedule}
                    className={cn(
                      isReschedule &&
                        'bg-accent/60 text-muted-foreground opacity-70 pointer-events-none select-none focus-visible:ring-0',
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <FormLabel>Add guests</FormLabel>
            </div>
            {fields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`additional_guests.${index}.email`}
                render={({ field: inputField }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="email"
                          placeholder="guest@example.com"
                          disabled={isPending}
                          {...inputField}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                          className="size-9 shrink-0 text-muted-foreground hover:text-foreground"
                          onClick={() => remove(index)}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              className="mt-1 text-xs"
              onClick={() => append({ email: '' })}
            >
              <Plus className="mr-1.5 size-3" />
              Add another
            </Button>
          </div>

          <FormField
            control={form.control}
            name="guest_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isReschedule ? 'Reason for reschedule' : 'Additional notes'}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={
                      isReschedule
                        ? 'Let others know why you need to reschedule'
                        : 'Please share anything that will help prepare for our meeting.'
                    }
                    disabled={isPending}
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {submitError && <p className="text-sm text-red-500">{submitError}</p>}

          {/* Bottom action row: Back (left) + Confirm / Reschedule (right) */}
          <div className="flex items-center justify-between pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              disabled={isPending}
              className="text-muted-foreground hover:text-foreground"
            >
              Back
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isReschedule ? 'Reschedule' : 'Confirm'}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
