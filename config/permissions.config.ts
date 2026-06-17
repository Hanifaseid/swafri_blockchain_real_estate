// ─── Permissions Config ───────────────────────────────────────────────────────
// Route-level access rules used by proxy.ts.
// IMPORTANT: (dashboard) is a layout group — it does NOT add a URL segment.
// app/(dashboard)/users/page.tsx serves /users NOT /dashboard/users.
// app/(dashboard)/dashboard/page.tsx serves /dashboard.

import type { UserRole } from '@/features/roles/types/role.types';

export interface RoutePermission {
  path: string;
  allowedRoles?: UserRole[];
}

export const protectedRoutes: RoutePermission[] = [
  // Dashboard overview — all authenticated roles
  { path: '/dashboard', allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'PROPERTY_OWNER', 'TENANT'] },

  // Users management — admin only
  { path: '/users', allowedRoles: ['SUPER_ADMIN', 'ADMIN'] },

  // Roles & Permissions — super admin only
  { path: '/roles', allowedRoles: ['SUPER_ADMIN'] },
  { path: '/permissions', allowedRoles: ['SUPER_ADMIN'] },

  // Audit logs — admin and super admin
  { path: '/audit', allowedRoles: ['SUPER_ADMIN', 'ADMIN'] },

  // Settings — admin and super admin
  { path: '/settings', allowedRoles: ['SUPER_ADMIN', 'ADMIN'] },

  // KYC — all authenticated
  { path: '/kyc', allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'PROPERTY_OWNER', 'TENANT'] },

  // Profile — all authenticated
  { path: '/profile', allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'PROPERTY_OWNER', 'TENANT'] },

  // Properties — all authenticated (role-aware content inside)
  { path: '/properties', allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'PROPERTY_OWNER', 'TENANT'] },

  // Inquiries — owners and tenants
  { path: '/inquiries', allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'PROPERTY_OWNER', 'TENANT'] },

  // Offers — owners and tenants
  { path: '/offers', allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'PROPERTY_OWNER', 'TENANT'] },

  // Saved — tenant only
  { path: '/saved', allowedRoles: ['TENANT'] },
];

export const publicRoutes: string[] = ['/', '/about', '/contact'];
export const authRoutes: string[] = ['/login', '/register', '/forgot-password', '/reset-password'];

export function canAccessRoute(path: string, role: UserRole): boolean {
  const matched = protectedRoutes
    .filter((r) => path === r.path || path.startsWith(r.path + '/'))
    .sort((a, b) => b.path.length - a.path.length)[0];

  if (!matched) return true;
  if (!matched.allowedRoles) return true;
  return matched.allowedRoles.includes(role);
}
