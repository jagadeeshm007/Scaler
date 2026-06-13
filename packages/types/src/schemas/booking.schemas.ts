import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    event_type_id: z.string().uuid(),
    host_id: z.string().uuid(),
    start_time: z.string().datetime(), // UTC ISO string
    end_time: z.string().datetime(), // UTC ISO string
    guest_name: z.string().min(2, 'Name must be at least 2 characters'),
    guest_email: z.string().email('Invalid email address'),
    guest_notes: z.string().optional().nullable(),
    timezone: z.string(), // Client's timezone for email rendering
    reschedule_from_uid: z.string().uuid().optional(),
  }),
});

export const updateBookingStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'RESCHEDULED']),
    cancellation_reason: z.string().optional().nullable(),
  }),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>['body'];
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>['body'];
