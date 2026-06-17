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
  disabled?: boolean;
  badge?: string;
}

// ─── Route Note ───────────────────────────────────────────────────────────────
// The route group (dashboard) does NOT add a URL segment.
// app/(dashboard)/users/page.tsx  → serves /users
// app/(dashboard)/audit/page.tsx  → serves /audit
// The "dashboard" overview is at app/(dashboard)/dashboard/page.tsx → /dashboard
// All other pages are at their folder name directly: /users, /roles, etc.

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
      href: '/users',
      icon: 'Users',
      requiredPermission: 'users:view',
    },
    {
      label: 'Manage Admins',
      href: '/users?role=ADMIN',
      icon: 'ShieldCheck',
      requiredPermission: 'users:create_admin',
    },
    {
      label: 'Roles',
      href: '/roles',
      icon: 'KeyRound',
    },
    {
      label: 'Permissions',
      href: '/permissions',
      icon: 'Lock',
    },
    {
      label: 'Audit Logs',
      href: '/audit',
      icon: 'History',
      requiredPermission: 'audit:view',
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: 'Settings',
      requiredPermission: 'settings:view',
    },
    {
      label: 'KYC & Wallet',
      href: '/kyc',
      icon: 'BadgeCheck',
    },
    {
      label: 'Profile',
      href: '/profile',
      icon: 'User',
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
      href: '/users',
      icon: 'Users',
      requiredPermission: 'users:view',
    },
    {
      label: 'KYC Review',
      href: '/kyc',
      icon: 'BadgeCheck',
      requiredPermission: 'kyc:view_all',
    },
    {
      label: 'Properties',
      href: '/properties',
      icon: 'Building2',
      requiredPermission: 'properties:view_all',
    },
    {
      label: 'Audit Logs',
      href: '/audit',
      icon: 'History',
      requiredPermission: 'audit:view',
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: 'Settings',
      requiredPermission: 'settings:view',
    },
    {
      label: 'Profile',
      href: '/profile',
      icon: 'User',
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
      href: '/properties',
      icon: 'Building2',
      requiredPermission: 'properties:create',
    },
    {
      label: 'Inquiries',
      href: '/inquiries',
      icon: 'MessageSquare',
      requiredPermission: 'inquiries:view_own',
    },
    {
      label: 'Transactions',
      href: '/transactions',
      icon: 'CreditCard',
      requiredPermission: 'transactions:view_own',
    },
    {
      label: 'KYC & Wallet',
      href: '/kyc',
      icon: 'BadgeCheck',
      requiredPermission: 'kyc:view_own',
    },
    {
      label: 'Profile',
      href: '/profile',
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
      href: '/properties',
      icon: 'Compass',
      requiredPermission: 'properties:view_published',
    },
    {
      label: 'Saved',
      href: '/saved',
      icon: 'Heart',
    },
    {
      label: 'My Inquiries',
      href: '/inquiries',
      icon: 'MessageSquare',
      requiredPermission: 'inquiries:view_own',
    },
    {
      label: 'KYC & Wallet',
      href: '/kyc',
      icon: 'BadgeCheck',
      requiredPermission: 'kyc:view_own',
    },
    {
      label: 'Profile',
      href: '/profile',
      icon: 'User',
    },
  ],
};

// ─── Helper ───────────────────────────────────────────────────────────────────

export function getNavItems(role: UserRole): NavItem[] {
  return dashboardNav[role] ?? [];
}
