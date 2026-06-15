import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const session = req.cookies.get('refresh_token');
  const isAuthRoute =
    req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/signup');
  const isDashboardRoute = [
    '/event-types',
    '/bookings',
    '/availability',
    '/apps',
    '/settings',
  ].some((p) => req.nextUrl.pathname.startsWith(p));

  if (!session && isDashboardRoute) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL('/event-types', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/event-types/:path*',
    '/bookings/:path*',
    '/availability/:path*',
    '/apps/:path*',
    '/settings/:path*',
    '/login',
    '/signup',
  ],
};
