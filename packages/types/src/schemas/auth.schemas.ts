import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

export const bypassSchema = z.object({
  body: z.object({}),
});

export type LoginInput = z.infer<typeof loginSchema>['body'];
export type BypassInput = z.infer<typeof bypassSchema>['body'];
