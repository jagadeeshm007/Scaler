import 'server-only';

import { cookies } from 'next/headers';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import type { AuthUser } from '@bolt/types';

import {
  applyRotatedAuthCookies,
  getSessionWithRefreshToken,
  refreshSessionWithRefreshToken,
} from '@/lib/api/auth.server';
import { REFRESH_TOKEN_COOKIE, clearAuthCookies } from '@/lib/auth-cookies';

interface SessionData {
  accessToken: string;
  user: AuthUser;
}

/**
 * Verifies the session by calling the backend /auth/session endpoint
 * using the httpOnly refresh_token cookie.
 * Memoized with React.cache — called multiple times in one render pass,
 * only one network request is made.
 * Redirects to /login if session is invalid.
 */
export const verifySession = cache(async (): Promise<SessionData> => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    redirect('/login');
  }

  const session = await getSessionWithRefreshToken(refreshToken);

  if (!session) {
    clearAuthCookies(cookieStore);
    redirect('/login');
  }

  return session;
});

/**
 * Returns user data for use in Server Components.
 * Safe to call multiple times — React.cache deduplicates.
 * Returns null instead of redirecting — use when auth is optional.
 */
export const getUser = cache(async (): Promise<AuthUser | null> => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) return null;

  const session = await getSessionWithRefreshToken(refreshToken);
  return session?.user ?? null;
});

/**
 * Returns the access token for use in server-side API calls.
 * Never expose this to client components.
 */
export const getAccessToken = cache(async (): Promise<string | null> => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) return null;

  const session = await getSessionWithRefreshToken(refreshToken);
  return session?.accessToken ?? null;
});

/**
 * Rotate refresh token via backend and persist new cookies.
 * Used by the same-origin /api/auth/refresh route handler.
 */
export async function refreshAuthSession(): Promise<{ accessToken: string } | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) return null;

  try {
    const rotated = await refreshSessionWithRefreshToken(refreshToken);
    if (!rotated) {
      clearAuthCookies(cookieStore);
      return null;
    }

    applyRotatedAuthCookies(cookieStore, rotated.setCookies);
    return { accessToken: rotated.accessToken };
  } catch {
    clearAuthCookies(cookieStore);
    return null;
  }
}
