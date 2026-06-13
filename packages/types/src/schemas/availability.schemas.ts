import { z } from 'zod';

export const scheduleAvailabilitySchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
  end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
  is_active: z.boolean().default(true),
});

export const dateOverrideSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  start_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)')
    .optional()
    .nullable(),
  end_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)')
    .optional()
    .nullable(),
  is_available: z.boolean(),
  emoji: z.string().max(8).optional().nullable(),
});

export const createScheduleSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Schedule name must be at least 2 characters'),
    timezone: z.string(),
    is_default: z.boolean().default(false),
    availability: z.array(scheduleAvailabilitySchema).optional(),
  }),
});

export const updateScheduleSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    timezone: z.string().optional(),
    is_default: z.boolean().optional(),
    availability: z.array(scheduleAvailabilitySchema).optional(),
    overrides: z.array(dateOverrideSchema).optional(),
  }),
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>['body'];
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>['body'];
export type ScheduleAvailabilityInput = z.infer<typeof scheduleAvailabilitySchema>;
export type DateOverrideInput = z.infer<typeof dateOverrideSchema>;
