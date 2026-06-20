import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { publicRoutes, authRoutes } from '@/config/permissions.config';

// Coarse UX redirect layer only. Tokens remain in localStorage for this pass,
// so the server cannot validate the backend session or role here. Protected
// client layouts fetch /auth/me and enforce role access before rendering.

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const isPublic = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
  if (isPublic) return NextResponse.next();

  const isAuthed = request.cookies.get('vex_authed')?.value === '1';
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isAuthRoute) {
    return isAuthed ? NextResponse.redirect(new URL('/', request.url)) : NextResponse.next();
  }

  if (!isAuthed) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};