import type { UserRole } from '@/features/roles/types/role.types';

// ─── Permission Keys ──────────────────────────────────────────────────────────
// Every action on the platform is represented as a permission key.
// The permissions.config.ts file maps roles to these keys.

export type PermissionKey =
  // User management
  | 'users:view'
  | 'users:suspend'
  | 'users:block'
  | 'users:reactivate'
  | 'users:create_admin'
  | 'users:view_activity'

  // KYC
  | 'kyc:view_own'
  | 'kyc:submit_own'
  | 'kyc:view_all'
  | 'kyc:approve'
  | 'kyc:reject'

  // Properties
  | 'properties:view_published'
  | 'properties:create'
  | 'properties:edit_own'
  | 'properties:delete_own'
  | 'properties:submit_for_review'
  | 'properties:approve'
  | 'properties:reject'
  | 'properties:view_all'

  // Inquiries
  | 'inquiries:create'
  | 'inquiries:view_own'
  | 'inquiries:respond'

  // Wallet
  | 'wallet:link_own'
  | 'wallet:view_own'
  | 'wallet:view_all'

  // Transactions
  | 'transactions:view_own'
  | 'transactions:update_status'

  // Audit logs
  | 'audit:view'

  // Settings
  | 'settings:view'
  | 'settings:update'

  // Dashboard
  | 'dashboard:tenant'
  | 'dashboard:owner'
  | 'dashboard:admin'
  | 'dashboard:super_admin';

// ─── Role Permission Map ───────────────────────────────────────────────────────
// Used by lib/auth/permissions.ts to check access.

export type RolePermissionMap = Record<UserRole, PermissionKey[]>;

// ─── Permission Check ─────────────────────────────────────────────────────────

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}
