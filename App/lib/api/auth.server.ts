import 'server-only';

import type { AuthUser } from '@scaler/types';

import { serverAxios } from '@/lib/api/axios.server';
import { parseApiErrorBody } from '@/lib/api/errors';
import { unwrapApiData } from '@/lib/api/parse-response';
import {
  REFRESH_TOKEN_COOKIE,
  applyAuthCookiesFromSetCookies,
  extractRefreshTokenFromSetCookies,
  normalizeSetCookieHeaders,
} from '@/lib/auth-cookies';
import { ENDPOINTS } from '@/lib/constants/api';

interface SessionPayload {
  authenticated: boolean;
  accessToken?: string;
  user?: AuthUser;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: unknown } }).response;
    return parseApiErrorBody(response?.data).message || fallback;
  }

  return fallback;
}

export async function loginWithCredentials(
  email: string,
  password: string,
): Promise<string | null> {
  const response = await serverAxios.post(ENDPOINTS.auth.login, { email, password });
  const setCookies = normalizeSetCookieHeaders(response.headers['set-cookie']);
  return extractRefreshTokenFromSetCookies(setCookies);
}

export async function registerUser(payload: {
  full_name: string;
  email: string;
  username: string;
  password: string;
}): Promise<void> {
  await serverAxios.post(ENDPOINTS.auth.register, payload);
}

export async function logoutWithRefreshToken(refreshToken: string): Promise<void> {
  await serverAxios.post(
    ENDPOINTS.auth.logout,
    {},
    {
      headers: { Cookie: `${REFRESH_TOKEN_COOKIE}=${refreshToken}` },
    },
  );
}

export async function getSessionWithRefreshToken(
  refreshToken: string,
): Promise<AuthSession | null> {
  const response = await serverAxios.get(ENDPOINTS.auth.session, {
    headers: { Cookie: `${REFRESH_TOKEN_COOKIE}=${refreshToken}` },
  });

  const payload = unwrapApiData<SessionPayload>(response.data);

  if (!payload.authenticated || !payload.accessToken || !payload.user) {
    return null;
  }

  return {
    accessToken: payload.accessToken,
    user: payload.user,
  };
}

export async function refreshSessionWithRefreshToken(
  refreshToken: string,
): Promise<{ accessToken: string; setCookies: string[] } | null> {
  const response = await serverAxios.post(
    ENDPOINTS.auth.refresh,
    {},
    {
      headers: { Cookie: `${REFRESH_TOKEN_COOKIE}=${refreshToken}` },
    },
  );

  const payload = unwrapApiData<{ accessToken: string }>(response.data);
  const setCookies = normalizeSetCookieHeaders(response.headers['set-cookie']);

  if (!payload.accessToken) {
    return null;
  }

  return { accessToken: payload.accessToken, setCookies };
}

export function applyRotatedAuthCookies(
  cookieStore: Parameters<typeof applyAuthCookiesFromSetCookies>[0],
  setCookies: string[],
): void {
  applyAuthCookiesFromSetCookies(cookieStore, setCookies);
}
