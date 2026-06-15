import { z } from 'zod';
import { dateOverrideSchema, scheduleAvailabilitySchema } from '../schemas/availability.schemas';
import { userSettingsSchema } from '../schemas/user.schemas';

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  full_name: z.string(),
  avatar_url: z.string().nullable(),
  timezone: z.string(),
});
export type AuthUser = z.infer<typeof authUserSchema>;

export const userProfileSchema = authUserSchema.extend({
  settings: userSettingsSchema.nullable().optional(),
});
export type UserProfile = z.infer<typeof userProfileSchema>;

const publicHostSettingsSchema = z.object({
  brand_colors_enabled: z.boolean(),
  brand_color_light: z.string(),
  brand_color_dark: z.string(),
});

export const authPayloadSchema = z.object({
  accessToken: z.string(),
  user: authUserSchema,
});
export type AuthPayload = z.infer<typeof authPayloadSchema>;

export const sessionResponseSchema = z.object({
  authenticated: z.boolean(),
  accessToken: z.string().optional(),
  user: authUserSchema.optional(),
});
export type SessionResponse = z.infer<typeof sessionResponseSchema>;

export const eventTypeSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  duration_mins: z.number(),
  duration_options: z.array(z.number()).optional(),
  is_active: z.boolean(),
  is_hidden: z.boolean(),
  location_type: z.string(),
  location_details: z.string().nullable(),
  requires_confirmation: z.boolean(),
  buffer_before_mins: z.number(),
  buffer_after_mins: z.number(),
  position: z.number(),
  theme_config: z.object({ party_mode_enabled: z.boolean().optional() }).nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type EventType = z.infer<typeof eventTypeSchema>;

export const publicEventTypeSchema = eventTypeSchema.extend({
  user: authUserSchema
    .pick({
      id: true,
      full_name: true,
      username: true,
      avatar_url: true,
      timezone: true,
    })
    .extend({
      settings: publicHostSettingsSchema.nullable().optional(),
    }),
});
export type PublicEventType = z.infer<typeof publicEventTypeSchema>;

export type ScheduleAvailability = z.infer<typeof scheduleAvailabilitySchema>;
export type DateOverride = z.infer<typeof dateOverrideSchema>;

export const blockedDateSchema = z.object({
  date: z.string(),
  emoji: z.string(),
});
export type BlockedDate = z.infer<typeof blockedDateSchema>;

export const blockedDatesDataSchema = z.object({
  blocked: z.array(blockedDateSchema),
  nonWorkingDays: z.array(z.number()),
});
export type BlockedDatesData = z.infer<typeof blockedDatesDataSchema>;

export const scheduleSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  timezone: z.string(),
  is_default: z.boolean(),
  availability: z.array(scheduleAvailabilitySchema),
  overrides: z.array(dateOverrideSchema),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Schedule = z.infer<typeof scheduleSchema>;

export const bookingSchema = z.object({
  id: z.string(),
  uid: z.string(),
  event_type_id: z.string(),
  host_id: z.string(),
  guest_name: z.string(),
  guest_email: z.string(),
  guest_notes: z.string().nullable(),
  start_time: z.string(),
  end_time: z.string(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'RESCHEDULED']),
  cancellation_reason: z.string().nullable(),
  rescheduled_from_uid: z.string().nullable().optional(),
  rescheduled_to_uid: z.string().nullable().optional(),
  meeting_url: z.string().nullable(),
  event_type: eventTypeSchema,
  host: authUserSchema.optional(),
});
export type Booking = z.infer<typeof bookingSchema>;

export const slotSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  localStartTime: z.string(),
  localEndTime: z.string(),
  timezone: z.string(),
  available: z.boolean(),
});
export type Slot = z.infer<typeof slotSchema>;

export const integrationSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  logo_url: z.string().nullable(),
  category: z.string(),
  is_connected: z.boolean(),
  is_default: z.boolean().optional(),
});
export type Integration = z.infer<typeof integrationSchema>;

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    message: z.string(),
    data: dataSchema,
  });

export const apiErrorBodySchema = z.object({
  success: z.literal(false),
  message: z.string(),
  error: z
    .union([
      z.string(),
      z.object({
        code: z.string().optional(),
        errors: z.array(z.object({ field: z.string().optional(), message: z.string() })).optional(),
        details: z.unknown().optional(),
      }),
    ])
    .optional(),
  details: z.string().optional(),
  code: z.string().optional(),
});
export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;
