'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import {
  getApiErrorMessage,
  loginWithCredentials,
  logoutWithRefreshToken,
  registerUser,
} from '@/lib/api/auth.server';
import { REFRESH_TOKEN_COOKIE, clearAuthCookies, setAuthCookies } from '@/lib/auth-cookies';

export type FormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
    }
  | undefined;

const LoginSchema = z.object({
  email: z.string().email({ message: 'Valid email required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export async function loginAction(_state: FormState, formData: FormData): Promise<FormState> {
  const validated = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  let refreshToken: string | null;

  try {
    refreshToken = await loginWithCredentials(validated.data.email, validated.data.password);
  } catch (error) {
    return { message: getApiErrorMessage(error, 'Invalid credentials.') };
  }

  if (!refreshToken) {
    return { message: 'Login succeeded but session could not be established.' };
  }

  const cookieStore = await cookies();
  setAuthCookies(cookieStore, refreshToken);
  redirect('/event-types');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (refreshToken) {
    try {
      await logoutWithRefreshToken(refreshToken);
    } catch {
      // Best-effort server logout; always clear local cookies below.
    }
  }

  clearAuthCookies(cookieStore);
  redirect('/login');
}

export async function registerAction(_state: FormState, formData: FormData): Promise<FormState> {
  const RegisterSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Valid email required.' }),
    username: z
      .string()
      .min(3, { message: 'Username must be at least 3 characters.' })
      .regex(/^[a-z0-9-]+$/, {
        message: 'Username can only contain lowercase letters, numbers, hyphens.',
      }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters.' })
      .regex(/[A-Z]/, { message: 'Must contain at least one uppercase letter.' })
      .regex(/[0-9]/, { message: 'Must contain at least one number.' }),
  });

  const validated = RegisterSchema.safeParse(Object.fromEntries(formData));

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  try {
    await registerUser({
      full_name: validated.data.name,
      email: validated.data.email,
      username: validated.data.username,
      password: validated.data.password,
    });
  } catch (error) {
    return { message: getApiErrorMessage(error, 'Registration failed.') };
  }

  redirect('/login?registered=true');
}
