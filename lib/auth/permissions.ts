import type { UserRole } from '@/features/roles/types/role.types';
import type {
  PermissionKey,
  RolePermissionMap,
} from '@/features/permissions/types/permission.types';

// ─── Role → Permission Map ────────────────────────────────────────────────────
// Defines exactly what each role is allowed to do.
// Import hasPermission() in components to guard UI actions.
// Import ROLE_PERMISSIONS in middleware for route-level checks.

export const ROLE_PERMISSIONS: RolePermissionMap = {
  SUPER_ADMIN: [
    // Full user management
    'users:view',
    'users:suspend',
    'users:block',
    'users:reactivate',
    'users:create_admin',
    'users:view_activity',
    // Full KYC access
    'kyc:view_own',
    'kyc:submit_own',
    'kyc:view_all',
    'kyc:approve',
    'kyc:reject',
    // Full property access
    'properties:view_published',
    'properties:create',
    'properties:edit_own',
    'properties:delete_own',
    'properties:submit_for_review',
    'properties:approve',
    'properties:reject',
    'properties:view_all',
    // Inquiries
    'inquiries:create',
    'inquiries:view_own',
    'inquiries:respond',
    // Wallet
    'wallet:link_own',
    'wallet:view_own',
    'wallet:view_all',
    // Audit + settings + all dashboards
    'audit:view',
    'settings:view',
    'settings:update',
    'dashboard:tenant',
    'dashboard:owner',
    'dashboard:admin',
    'dashboard:super_admin',
  ],

  ADMIN: [
    // User management (cannot create admins)
    'users:view',
    'users:suspend',
    'users:block',
    'users:reactivate',
    'users:view_activity',
    // KYC review
    'kyc:view_all',
    'kyc:approve',
    'kyc:reject',
    // Property review
    'properties:view_published',
    'properties:approve',
    'properties:reject',
    'properties:view_all',
    // Wallet view
    'wallet:view_all',
    // Audit
    'audit:view',
    'settings:view',
    'dashboard:admin',
  ],

  PROPERTY_OWNER: [
    // Own KYC
    'kyc:view_own',
    'kyc:submit_own',
    // Own properties
    'properties:view_published',
    'properties:create',
    'properties:edit_own',
    'properties:delete_own',
    'properties:submit_for_review',
    // Inquiries from tenants
    'inquiries:view_own',
    'inquiries:respond',
    // Own wallet
    'wallet:link_own',
    'wallet:view_own',
    'transactions:view_own',
    'dashboard:owner',
  ],

  TENANT: [
    // Own KYC (required for escrow later)
    'kyc:view_own',
    'kyc:submit_own',
    // Property browsing
    'properties:view_published',
    // Inquiries
    'inquiries:create',
    'inquiries:view_own',
    // Own wallet (required for fractional buy later)
    'wallet:link_own',
    'wallet:view_own',
    'dashboard:tenant',
  ],
};

// ─── hasPermission ────────────────────────────────────────────────────────────
// Check whether a role has a given permission.
//
// Usage:
//   if (hasPermission(currentUser.role, 'users:create_admin')) { ... }

export function hasPermission(role: UserRole, permission: PermissionKey): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

// ─── hasAnyPermission ─────────────────────────────────────────────────────────
// Check whether a role has at least one of the given permissions.
//
// Usage:
//   if (hasAnyPermission(currentUser.role, ['properties:approve', 'properties:reject'])) { ... }

export function hasAnyPermission(role: UserRole, permissions: PermissionKey[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

// ─── getAllPermissions ────────────────────────────────────────────────────────
// Returns all permission keys for a given role.

export function getAllPermissions(role: UserRole): PermissionKey[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
