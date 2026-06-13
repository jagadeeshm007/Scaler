import { z } from 'zod';

export const createEventTypeSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    slug: z
      .string()
      .min(2, 'Slug must be at least 2 characters')
      .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
    description: z.string().optional().nullable(),
    duration_mins: z.number().int().positive('Duration must be positive'),
    location_type: z.string(),
    location_details: z.string().optional().nullable(),
    requires_confirmation: z.boolean().optional(),
    buffer_before_mins: z.number().int().min(0).optional(),
    buffer_after_mins: z.number().int().min(0).optional(),
    is_hidden: z.boolean().optional(),
    is_active: z.boolean().optional(),
  }),
});

export const updateEventTypeSchema = z.object({
  body: createEventTypeSchema.shape.body.partial(),
});

export type CreateEventTypeInput = z.infer<typeof createEventTypeSchema>['body'];
export type UpdateEventTypeInput = z.infer<typeof updateEventTypeSchema>['body'];
