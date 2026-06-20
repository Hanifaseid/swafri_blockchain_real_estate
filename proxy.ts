import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { UserAccount } from '@/features/users/types/user.types';
import { canAccessRoute, publicRoutes, authRoutes } from '@/config/permissions.config';
import { getDefaultRouteForRole } from '@/lib/auth/routes';

// ─── Proxy (Next.js 16) ───────────────────────────────────────────────────────
// In Next.js 16, middleware.ts was renamed to proxy.ts and the exported
// function was renamed from `middleware` to `proxy`.
// Everything else (NextRequest, NextResponse, matcher config) is identical.
//
// This proxy handles three cases:
//   1. Public route    → always allow through
//   2. Auth route      → redirect to /dashboard if already logged in
//   3. Protected route → redirect to /login if not logged in, or block wrong role

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Skip API and static assets in proxy — these should not be auth-redirected.
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // ── 1. Public routes — no auth needed ─────────────────────────────────
  const isPublic = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
  if (isPublic) return NextResponse.next();

  // ── Read session from cookie ───────────────────────────────────────────
  // localStorage is client-side only and cannot be read in proxy.
  // AuthProvider (Step 9) sets two cookies on mount:
  //   vex_authed     = '1'                (is the user logged in?)
  //   vex_user_role  = e.g. 'TENANT'      (what is their role?)
  // These cookies contain no sensitive data — just the role string.
  const isAuthed = request.cookies.get('vex_authed')?.value === '1';
  const roleCookie = request.cookies.get('vex_user_role')?.value as
    | UserAccount['role']
    | undefined;

  // ── 2. Auth routes ─────────────────────────────────────────────────────
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  if (isAuthRoute) {
    if (isAuthed) {
      // Already logged in — no need to show login/register again
      return NextResponse.redirect(
        new URL(roleCookie ? getDefaultRouteForRole(roleCookie) : '/properties', request.url),
      );
    }
    return NextResponse.next();
  }

  // ── 3. Protected routes ────────────────────────────────────────────────
  if (!isAuthed || !roleCookie) {
    // Not logged in — redirect to login and preserve the intended destination
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Wrong role — redirect to the role's non-dashboard home.
  if (!canAccessRoute(pathname, roleCookie)) {
    return NextResponse.redirect(new URL(getDefaultRouteForRole(roleCookie), request.url));
  }

  return NextResponse.next();
}

// ─── Matcher ──────────────────────────────────────────────────────────────────
// Run this proxy on all routes so it can explicitly exclude API/static routes.
export const config = {
  matcher: ['/:path*'],
};
