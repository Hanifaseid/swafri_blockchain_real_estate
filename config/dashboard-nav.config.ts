import type { UserRole } from '@/features/roles/types/role.types';
import type { PermissionKey } from '@/features/permissions/types/permission.types';

// ─── Nav Item ─────────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  // Lucide icon name — the layout component resolves this to the actual icon
  icon: string;
  // Optional: hide this item if user does not have this permission
  requiredPermission?: PermissionKey;
  // Optional: mark as coming soon / disabled
  disabled?: boolean;
  badge?: string;
}

// ─── Dashboard Nav Config ─────────────────────────────────────────────────────
// Defines the sidebar navigation items for each role.
// The DashboardSidebar component reads this to render the correct nav.

export const dashboardNav: Record<UserRole, NavItem[]> = {
  // ── Super Admin ────────────────────────────────────────────────────────
  SUPER_ADMIN: [
    {
      label: 'Overview',
      href: '/dashboard',
      icon: 'LayoutDashboard',
    },
    {
      label: 'All Users',
      href: '/dashboard/users',
      icon: 'Users',
      requiredPermission: 'users:view',
    },
    {
      label: 'Manage Admins',
      href: '/dashboard/users?role=ADMIN',
      icon: 'ShieldCheck',
      requiredPermission: 'users:create_admin',
    },
    {
      label: 'Roles',
      href: '/dashboard/roles',
      icon: 'KeyRound',
    },
    {
      label: 'Permissions',
      href: '/dashboard/permissions',
      icon: 'Lock',
    },
    {
      label: 'Audit Logs',
      href: '/dashboard/audit',
      icon: 'History',
      requiredPermission: 'audit:view',
    },
    {
      label: 'Settings',
      href: '/dashboard/settings',
      icon: 'Settings',
      requiredPermission: 'settings:view',
    },
  ],

  // ── Admin ──────────────────────────────────────────────────────────────
  ADMIN: [
    {
      label: 'Overview',
      href: '/dashboard',
      icon: 'LayoutDashboard',
    },
    {
      label: 'Users',
      href: '/dashboard/users',
      icon: 'Users',
      requiredPermission: 'users:view',
    },
    {
      label: 'KYC Review',
      href: '/dashboard/kyc',
      icon: 'BadgeCheck',
      requiredPermission: 'kyc:view_all',
    },
    {
      label: 'Properties',
      href: '/dashboard/properties',
      icon: 'Building2',
      requiredPermission: 'properties:view_all',
    },
    {
      label: 'Audit Logs',
      href: '/dashboard/audit',
      icon: 'History',
      requiredPermission: 'audit:view',
    },
    {
      label: 'Settings',
      href: '/dashboard/settings',
      icon: 'Settings',
      requiredPermission: 'settings:view',
    },
  ],

  // ── Property Owner ─────────────────────────────────────────────────────
  PROPERTY_OWNER: [
    {
      label: 'Overview',
      href: '/dashboard',
      icon: 'LayoutDashboard',
    },
    {
      label: 'My Properties',
      href: '/dashboard/properties',
      icon: 'Building2',
      requiredPermission: 'properties:create',
    },
    {
      label: 'Inquiries',
      href: '/dashboard/inquiries',
      icon: 'MessageSquare',
      requiredPermission: 'inquiries:view_own',
    },
    {
      label: 'KYC & Wallet',
      href: '/dashboard/kyc',
      icon: 'BadgeCheck',
      requiredPermission: 'kyc:view_own',
    },
    {
      label: 'Profile',
      href: '/dashboard/profile',
      icon: 'User',
    },
  ],

  // ── Tenant ────────────────────────────────────────────────────────────
  TENANT: [
    {
      label: 'Overview',
      href: '/dashboard',
      icon: 'LayoutDashboard',
    },
    {
      label: 'Browse Properties',
      href: '/dashboard/properties',
      icon: 'Compass',
      requiredPermission: 'properties:view_published',
    },
    {
      label: 'Saved',
      href: '/dashboard/saved',
      icon: 'Heart',
    },
    {
      label: 'My Inquiries',
      href: '/dashboard/inquiries',
      icon: 'MessageSquare',
      requiredPermission: 'inquiries:view_own',
    },
    {
      label: 'KYC & Wallet',
      href: '/dashboard/kyc',
      icon: 'BadgeCheck',
      requiredPermission: 'kyc:view_own',
    },
    {
      label: 'Profile',
      href: '/dashboard/profile',
      icon: 'User',
    },
  ],
};

// ─── Helper ───────────────────────────────────────────────────────────────────
// Returns nav items for a role, filtering out disabled ones.

export function getNavItems(role: UserRole): NavItem[] {
  return dashboardNav[role] ?? [];
}
