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

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    full_name: z.string().min(2, 'Full name is required'),
    timezone: z.string().optional(),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>['body'];
export type BypassInput = z.infer<typeof bypassSchema>['body'];
export type RegisterInput = z.infer<typeof registerSchema>['body'];
