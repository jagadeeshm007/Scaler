import { NextResponse } from 'next/server';

import { cookies } from 'next/headers';

import { logoutWithRefreshToken } from '@/lib/api/auth.server';
import { REFRESH_TOKEN_COOKIE, clearAuthCookies } from '@/lib/auth-cookies';

export async function POST(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (refreshToken) {
    try {
      await logoutWithRefreshToken(refreshToken);
    } catch {
      // Always clear local cookies below.
    }
  }

  clearAuthCookies(cookieStore);
  return NextResponse.json({ ok: true });
}
