import { type NextRequest, NextResponse } from 'next/server';

import { REFRESH_TOKEN_COOKIE } from '@/lib/auth-cookies';

// Optimistic routing guard only — not a security boundary.
// Real auth is enforced by verifySession() in Server Components / DAL.

const PROTECTED_PATHS = ['/event-types', '/availability', '/bookings', '/settings', '/apps'];

const PUBLIC_ONLY_PATHS = ['/login', '/register', '/signup'];

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(REFRESH_TOKEN_COOKIE)?.value);

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (isProtected && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isPublicOnly = PUBLIC_ONLY_PATHS.some((p) => pathname.startsWith(p));
  if (isPublicOnly && hasSession) {
    return NextResponse.redirect(new URL('/event-types', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
