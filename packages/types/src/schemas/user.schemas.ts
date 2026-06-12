import { z } from 'zod';

export const updateUserSchema = z.object({
  body: z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    timezone: z.string().optional(),
    avatar_url: z.string().url('Invalid avatar URL').optional().nullable(),
  }),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
