import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { publicRoutes, authRoutes } from '@/config/permissions.config';

// ─── Admin roles ──────────────────────────────────────────────────────────────
// Must match UserRole values written to the vex_user_role cookie at login.
const ADMIN_ROLES = new Set(['SUPER_ADMIN', 'ADMIN']);

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

  // ── Admin route role guard ────────────────────────────────────────────────
  // Authenticated users who are not ADMIN/SUPER_ADMIN are redirected home.
  // The vex_user_role cookie is written at login by auth.queries.ts and
  // refreshed on page hydration by AuthProvider.tsx.
  if (pathname.startsWith('/admin')) {
    const role = request.cookies.get('vex_user_role')?.value ?? '';
    if (!ADMIN_ROLES.has(role)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};