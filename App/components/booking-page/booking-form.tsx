'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
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
import { formatBookingDate, formatBookingTimeRange, formatDuration } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import type { CreateBookingInput, PublicEventType, Slot } from '@/types';

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
  className?: string;
}

export function BookingForm({ eventType, slot, timezone, onBack, className }: BookingFormProps) {
  const router = useRouter();
  const idempotencyKeyRef = useRef(crypto.randomUUID());
  const [submitError, setSubmitError] = useState<string | null>(null);
  const createBooking = useCreateBooking();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      guest_name: '',
      guest_email: '',
      guest_notes: '',
    },
  });

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
    };

    try {
      const booking = await createBooking.mutateAsync({
        data: body,
        idempotencyKey: idempotencyKeyRef.current,
      });
      sessionStorage.setItem(`booking-${booking.id}`, JSON.stringify(booking));
      router.push(
        `${ROUTES.bookingConfirmed(eventType.user.username, eventType.slug)}?bookingId=${booking.id}`,
      );
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create booking');
    }
  };

  return (
    <section className={cn('flex w-full flex-col', className)}>
        <div className="border-b border-neutral-800 px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 -ml-2 gap-1 text-neutral-400 hover:text-white"
            onClick={onBack}
            type="button"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <p className="text-sm font-medium text-white">
            {formatBookingDate(slot.startTime, timezone)}
          </p>
          <p className="text-sm text-neutral-400">
            {formatBookingTimeRange(slot.startTime, slot.endTime, timezone)}
          </p>
          <span className="mt-1 inline-block rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400">
            {formatDuration(eventType.duration_mins)}
          </span>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4">
            <FormField
              control={form.control}
              name="guest_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" disabled={createBooking.isPending} {...field} />
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
                      disabled={createBooking.isPending}
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
                  <FormLabel>Additional notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please share anything that will help prepare for our meeting."
                      disabled={createBooking.isPending}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitError && <p className="text-sm text-red-500">{submitError}</p>}

            <Button type="submit" disabled={createBooking.isPending} className="w-full">
              {createBooking.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Confirm
            </Button>
          </form>
        </Form>
    </section>
  );
}
