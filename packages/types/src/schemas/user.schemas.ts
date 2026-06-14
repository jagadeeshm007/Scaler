import { z } from 'zod';

export const updateUserSchema = z.object({
  body: z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    timezone: z.string().optional(),
    avatar_url: z.string().url('Invalid avatar URL').optional().nullable(),
  }),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];

export const updateUserSettingsSchema = z.object({
  body: z.object({
    theme: z.enum(['light', 'dark', 'system']).optional(),
    brand_color_light: z
      .string()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      .optional(),
    brand_color_dark: z
      .string()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      .optional(),
  }),
});

export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsSchema>['body'];
