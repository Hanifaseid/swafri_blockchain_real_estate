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
// Admin pages live under app/admin/ → routes are /admin/dashboard, /admin/users, etc.
// PROPERTY_OWNER and TENANT do not use the admin shell — they use the
// marketplace layout (LandingNavbar + Footer) via /account/* pages.

export const dashboardNav: Record<UserRole, NavItem[]> = {
  // ── Super Admin ────────────────────────────────────────────────────────
  SUPER_ADMIN: [
    {
      label: 'Overview',
      href: '/admin/dashboard',
      icon: 'LayoutDashboard',
    },
    {
      label: 'All Users',
      href: '/admin/users',
      icon: 'Users',
      requiredPermission: 'users:view',
    },
    {
      label: 'Manage Admins',
      href: '/admin/users?role=ADMIN',
      icon: 'ShieldCheck',
      requiredPermission: 'users:create_admin',
    },
    {
      label: 'Properties',
      href: '/admin/properties',
      icon: 'Building2',
      requiredPermission: 'properties:view_all',
    },
    {
      label: 'Leases & Escrow',
      href: '/admin/leases',
      icon: 'FileSignature',
    },
    {
      label: 'Inquiries',
      href: '/admin/inquiries',
      icon: 'MessageSquare',
    },
    {
      label: 'Offers',
      href: '/admin/offers',
      icon: 'ArrowRightLeft',
    },
    {
      label: 'Applications',
      href: '/admin/applications',
      icon: 'FileText',
    },
    {
      label: 'KYC & Wallet',
      href: '/admin/kyc',
      icon: 'BadgeCheck',
    },
    {
      label: 'Compliance',
      href: '/admin/compliance',
      icon: 'ShieldCheck',
      requiredPermission: 'compliance:view',
    },
    {
      label: 'Purchase Transactions',
      href: '/admin/transactions',
      icon: 'CreditCard',
      requiredPermission: 'transactions:view_all',
    },
    {
      label: 'Chain Transactions',
      href: '/admin/chain-transactions',
      icon: 'ServerCog',
      requiredPermission: 'chain-transactions:view',
    },
    {
      label: 'Audit Logs',
      href: '/admin/audit',
      icon: 'History',
      requiredPermission: 'audit:view',
    },
    {
      label: 'Roles',
      href: '/admin/roles',
      icon: 'KeyRound',
    },
    {
      label: 'Permissions',
      href: '/admin/permissions',
      icon: 'Lock',
    },
    {
      label: 'Settings',
      href: '/admin/settings',
      icon: 'Settings',
      requiredPermission: 'settings:view',
    },
    {
      label: 'Profile',
      href: '/admin/profile',
      icon: 'User',
    },
  ],

  // ── Admin ──────────────────────────────────────────────────────────────
  ADMIN: [
    {
      label: 'Overview',
      href: '/admin/dashboard',
      icon: 'LayoutDashboard',
    },
    {
      label: 'Users',
      href: '/admin/users',
      icon: 'Users',
      requiredPermission: 'users:view',
    },
    {
      label: 'Properties',
      href: '/admin/properties',
      icon: 'Building2',
      requiredPermission: 'properties:view_all',
    },
    {
      label: 'Leases & Escrow',
      href: '/admin/leases',
      icon: 'FileSignature',
    },
    {
      label: 'Inquiries',
      href: '/admin/inquiries',
      icon: 'MessageSquare',
    },
    {
      label: 'Offers',
      href: '/admin/offers',
      icon: 'ArrowRightLeft',
    },
    {
      label: 'Applications',
      href: '/admin/applications',
      icon: 'FileText',
    },
    {
      label: 'KYC Review',
      href: '/admin/kyc',
      icon: 'BadgeCheck',
      requiredPermission: 'kyc:view_all',
    },
    {
      label: 'Compliance',
      href: '/admin/compliance',
      icon: 'ShieldCheck',
      requiredPermission: 'compliance:view',
    },
    {
      label: 'Purchase Transactions',
      href: '/admin/transactions',
      icon: 'CreditCard',
      requiredPermission: 'transactions:view_all',
    },
    {
      label: 'Chain Transactions',
      href: '/admin/chain-transactions',
      icon: 'ServerCog',
      requiredPermission: 'chain-transactions:view',
    },
    {
      label: 'Audit Logs',
      href: '/admin/audit',
      icon: 'History',
      requiredPermission: 'audit:view',
    },
    {
      label: 'Settings',
      href: '/admin/settings',
      icon: 'Settings',
      requiredPermission: 'settings:view',
    },
    {
      label: 'Profile',
      href: '/admin/profile',
      icon: 'User',
    },
  ],

  // PROPERTY_OWNER and TENANT do not use the admin dashboard sidebar.
  // They navigate via LandingNavbar → /account/* pages.
  PROPERTY_OWNER: [],
  TENANT: [],
};

// ─── Helper ───────────────────────────────────────────────────────────────────

export function getNavItems(role: UserRole): NavItem[] {
  if (role === "PROPERTY_OWNER" || role === "TENANT") return [];
  return dashboardNav[role] ?? [];
}
