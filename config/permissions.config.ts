// ─── Permissions Config ───────────────────────────────────────────────────────
// Route-level access rules used by middleware.ts.
// For component-level checks, use hasPermission() from lib/auth/permissions.ts.

import type { UserRole } from '@/features/roles/types/role.types';

// ─── Protected Route Config ───────────────────────────────────────────────────
// Maps URL path prefixes to the roles that are allowed to access them.
// Middleware reads this to block wrong-role access.

export interface RoutePermission {
  // URL path prefix to match (e.g. '/dashboard/users' matches '/dashboard/users/123')
  path: string;
  // Roles allowed — if undefined, any authenticated user can access
  allowedRoles?: UserRole[];
}

export const protectedRoutes: RoutePermission[] = [
  // ── Dashboard root — all authenticated roles ────────────────────────────
  {
    path: '/dashboard',
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'PROPERTY_OWNER', 'TENANT'],
  },

  // ── Users management — admin only ──────────────────────────────────────
  {
    path: '/dashboard/users',
    allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
  },

  // ── Roles & Permissions — super admin only ──────────────────────────────
  {
    path: '/dashboard/roles',
    allowedRoles: ['SUPER_ADMIN'],
  },
  {
    path: '/dashboard/permissions',
    allowedRoles: ['SUPER_ADMIN'],
  },

  // ── Audit logs — admin and super admin ─────────────────────────────────
  {
    path: '/dashboard/audit',
    allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
  },

  // ── Settings — admin and super admin ───────────────────────────────────
  {
    path: '/dashboard/settings',
    allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
  },

  // ── Properties (admin review view) ─────────────────────────────────────
  // Note: property owners and tenants also access /dashboard/properties
  // but for different purposes — the page component handles role-aware content.
  {
    path: '/dashboard/properties',
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'PROPERTY_OWNER', 'TENANT'],
  },

  // ── Inquiries ───────────────────────────────────────────────────────────
  {
    path: '/dashboard/inquiries',
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'PROPERTY_OWNER', 'TENANT'],
  },

  // ── KYC & Wallet ────────────────────────────────────────────────────────
  {
    path: '/dashboard/kyc',
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'PROPERTY_OWNER', 'TENANT'],
  },

  // ── Profile ────────────────────────────────────────────────────────────
  {
    path: '/dashboard/profile',
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'PROPERTY_OWNER', 'TENANT'],
  },
];

// ─── Public Routes ────────────────────────────────────────────────────────────
// These routes are accessible without authentication.

export const publicRoutes: string[] = ['/', '/about', '/contact'];

// ─── Auth Routes ──────────────────────────────────────────────────────────────
// Redirect away from these if user is already logged in.

export const authRoutes: string[] = ['/login', '/register'];

// ─── Helper ───────────────────────────────────────────────────────────────────
// Check if a given role can access a given path.
// Used in middleware.ts.

export function canAccessRoute(path: string, role: UserRole): boolean {
  // Find the most specific matching route config
  const matched = protectedRoutes
    .filter((r) => path.startsWith(r.path))
    .sort((a, b) => b.path.length - a.path.length)[0]; // most specific first

  if (!matched) return true; // no rule = open to all authenticated users
  if (!matched.allowedRoles) return true; // no role restriction
  return matched.allowedRoles.includes(role);
}
