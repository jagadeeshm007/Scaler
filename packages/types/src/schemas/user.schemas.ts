import { z } from 'zod';

export const updateUserSchema = z.object({
  body: z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    timezone: z.string().optional(),
    avatar_url: z.string().url('Invalid avatar URL').optional().nullable(),
  }),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];

export const userSettingsSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().optional(),
  theme: z.enum(['light', 'dark', 'system']),
  brand_name: z.string().optional(),
  brand_colors_enabled: z.boolean(),
  brand_color_light: z.string(),
  brand_color_dark: z.string(),
});

export type UserSettings = z.infer<typeof userSettingsSchema>;

export const updateUserSettingsSchema = z.object({
  body: z.object({
    theme: z.enum(['light', 'dark', 'system']).optional(),
    brand_name: z.string().optional(),
    brand_colors_enabled: z.boolean().optional(),
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
