import 'server-only';

import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import type { cookies } from 'next/headers';

const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;

export const REFRESH_TOKEN_COOKIE = 'refresh_token';
export const SESSION_HINT_COOKIE = 'session_hint';

const isProduction = process.env.NODE_ENV === 'production';

export const refreshTokenCookieOptions: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  maxAge: SEVEN_DAYS_SECONDS,
  path: '/',
};

export const sessionHintCookieOptions: Partial<ResponseCookie> = {
  httpOnly: false,
  secure: isProduction,
  sameSite: 'lax',
  maxAge: SEVEN_DAYS_SECONDS,
  path: '/',
};

type CookieStore = Awaited<ReturnType<typeof cookies>>;

export function normalizeSetCookieHeaders(headers: string | string[] | undefined): string[] {
  if (!headers) return [];
  return Array.isArray(headers) ? headers : [headers];
}

function parseCookieValue(cookieStr: string, name: string): string | null {
  const [firstPart] = cookieStr.split(';');
  if (!firstPart) return null;

  const [cookieName, ...valueParts] = firstPart.split('=');
  if (cookieName?.trim() !== name) return null;

  return valueParts.join('=');
}

/** Extract refresh_token from Set-Cookie header values. */
export function extractRefreshTokenFromSetCookies(setCookies: string[]): string | null {
  for (const cookieStr of setCookies) {
    const token = parseCookieValue(cookieStr, REFRESH_TOKEN_COOKIE);
    if (token) return token;
  }
  return null;
}

/** Forward rotated auth cookies from backend Set-Cookie headers. */
export function applyAuthCookiesFromSetCookies(
  cookieStore: CookieStore,
  setCookies: string[],
): void {
  for (const cookieStr of setCookies) {
    const refreshToken = parseCookieValue(cookieStr, REFRESH_TOKEN_COOKIE);
    if (refreshToken) {
      cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, refreshTokenCookieOptions);
    }
  }

  cookieStore.set(SESSION_HINT_COOKIE, '1', sessionHintCookieOptions);
}

/** Set auth cookies from a raw refresh token value (e.g. after login server action). */
export function setAuthCookies(cookieStore: CookieStore, refreshToken: string): void {
  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, refreshTokenCookieOptions);
  cookieStore.set(SESSION_HINT_COOKIE, '1', sessionHintCookieOptions);
}

/** Clear all auth cookies. */
export function clearAuthCookies(cookieStore: CookieStore): void {
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  cookieStore.delete(SESSION_HINT_COOKIE);
}
