'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDays, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { formatBookingDate, formatBookingTimeRange } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import type { Booking, CreateBookingInput, PublicEventType, Slot } from '@/types';

const bookingFormSchema = createBookingSchema.shape.body.pick({
  guest_name: true,
  guest_email: true,
  guest_notes: true,
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
  const idempotencyKeyRef = useRef(crypto.randomUUID());
  const [submitError, setSubmitError] = useState<string | null>(null);
  const createBooking = useCreateBooking();

  const isReschedule = Boolean(rescheduleBooking);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      guest_name: rescheduleBooking?.guest_name ?? '',
      guest_email: rescheduleBooking?.guest_email ?? '',
      guest_notes: '',
    },
  });

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
      timezone,
      ...(rescheduleBooking ? { reschedule_from_uid: rescheduleBooking.uid } : {}),
    };

    try {
      const booking = await createBooking.mutateAsync({
        data: body,
        idempotencyKey: idempotencyKeyRef.current,
      });

      sessionStorage.setItem(`booking-${booking.id}`, JSON.stringify(booking));
      sessionStorage.setItem(`booking-uid-${booking.uid}`, JSON.stringify(booking));
      router.push(
        `${ROUTES.bookingConfirmed(eventType.user.username, eventType.slug)}?uid=${booking.uid}`,
      );
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create booking');
    }
  };

  return (
    <section className={cn('flex w-full flex-col', className)}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4">
          {/* New time header — shown in reschedule mode */}
          {isReschedule && (
            <div className="flex items-start gap-2 rounded-lg border border-neutral-700 bg-neutral-800/50 px-3 py-2.5 text-sm">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-neutral-400" />
              <div>
                <p className="font-medium text-white">
                  {formatBookingDate(slot.startTime, timezone)}
                </p>
                <p className="text-neutral-400">
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
                  <Input placeholder="John Doe" disabled={isPending} {...field} />
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
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
              className="text-neutral-400 hover:text-white"
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
