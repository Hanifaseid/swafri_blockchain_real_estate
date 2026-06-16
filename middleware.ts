import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { UserAccount } from '@/features/users/types/user.types';
import { canAccessRoute, publicRoutes, authRoutes } from '@/config/permissions.config';

// ─── Middleware ───────────────────────────────────────────────────────────────
// Runs on every request matched by the config.matcher below.
// Handles three cases:
//   1. Public route    → always allow
//   2. Auth route      → redirect to dashboard if already logged in
//   3. Protected route → redirect to login if not logged in, or block wrong role

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Public routes — no auth needed ─────────────────────────────────
  const isPublic = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
  if (isPublic) return NextResponse.next();

  // ── Read session from cookie ───────────────────────────────────────────
  // The session is stored in localStorage (client-side only), so middleware
  // cannot read it directly. We use a cookie mirror set by AuthProvider
  // on mount (see components/providers/AuthProvider.tsx).
  // Cookie name: vex_user_role  (just the role string, not sensitive)
  // Cookie name: vex_authed     ('1' if authenticated)
  const isAuthed = request.cookies.get('vex_authed')?.value === '1';
  const roleCookie = request.cookies.get('vex_user_role')?.value as
    | UserAccount['role']
    | undefined;

  // ── 2. Auth routes ─────────────────────────────────────────────────────
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  if (isAuthRoute) {
    // Already logged in — send to dashboard
    if (isAuthed) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // ── 3. Protected routes ────────────────────────────────────────────────
  // Not logged in → send to login
  if (!isAuthed || !roleCookie) {
    const loginUrl = new URL('/login', request.url);
    // Preserve the intended destination so we can redirect back after login
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Wrong role → send to dashboard root (which shows their own dashboard)
  if (!canAccessRoute(pathname, roleCookie)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// ─── Matcher ──────────────────────────────────────────────────────────────────
// Run middleware on all routes EXCEPT:
//   - Next.js internals (_next/*)
//   - Static files (favicon, images, fonts, etc.)
//   - API routes handled by the app (/api/*)

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
