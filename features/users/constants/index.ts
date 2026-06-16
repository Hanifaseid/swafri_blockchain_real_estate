import type { AccountStatus, KycStatus, WalletStatus } from '@/features/users/types/user.types';
import type { UserRole } from '@/features/roles/types/role.types';

// ─── Account Status ───────────────────────────────────────────────────────────

export const ACCOUNT_STATUS_BADGE: Record<AccountStatus, { label: string; color: string }> = {
  ACTIVE:    { label: 'Active',    color: 'bg-emerald-950/40 text-emerald-400' },
  PENDING:   { label: 'Pending',   color: 'bg-amber-950/40 text-amber-400' },
  SUSPENDED: { label: 'Suspended', color: 'bg-orange-950/40 text-orange-400' },
  BLOCKED:   { label: 'Blocked',   color: 'bg-red-950/40 text-red-400' },
  REJECTED:  { label: 'Rejected',  color: 'bg-red-950/40 text-red-500' },
};

// ─── KYC Status ───────────────────────────────────────────────────────────────

export const KYC_STATUS_BADGE: Record<KycStatus, { label: string; color: string }> = {
  NOT_STARTED:  { label: 'Not Started',  color: 'bg-white/5 text-white/35' },
  PENDING:      { label: 'Pending',      color: 'bg-amber-950/40 text-amber-400' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-blue-950/40 text-blue-400' },
  APPROVED:     { label: 'Approved',     color: 'bg-emerald-950/40 text-emerald-400' },
  REJECTED:     { label: 'Rejected',     color: 'bg-red-950/40 text-red-400' },
  EXPIRED:      { label: 'Expired',      color: 'bg-gray-900/60 text-gray-500' },
};

// ─── Wallet Status ────────────────────────────────────────────────────────────

export const WALLET_STATUS_BADGE: Record<WalletStatus, { label: string; color: string }> = {
  NOT_LINKED: { label: 'Not Linked', color: 'bg-white/5 text-white/35' },
  LINKED:     { label: 'Linked',     color: 'bg-blue-950/40 text-blue-400' },
  VERIFIED:   { label: 'Verified',   color: 'bg-emerald-950/40 text-emerald-400' },
  REVOKED:    { label: 'Revoked',    color: 'bg-red-950/40 text-red-400' },
};

// ─── Role Badge ───────────────────────────────────────────────────────────────

export const ROLE_BADGE: Record<UserRole, { label: string; color: string }> = {
  SUPER_ADMIN:    { label: 'Super Admin',    color: 'bg-amber-950/40 text-amber-400' },
  ADMIN:          { label: 'Admin',          color: 'bg-blue-950/40 text-blue-400' },
  PROPERTY_OWNER: { label: 'Property Owner', color: 'bg-purple-950/40 text-purple-400' },
  TENANT:         { label: 'Tenant',         color: 'bg-emerald-950/40 text-emerald-400' },
};

// ─── Filter Options ───────────────────────────────────────────────────────────

export const ROLE_FILTER_OPTIONS: { value: UserRole | 'ALL'; label: string }[] = [
  { value: 'ALL',            label: 'All Roles' },
  { value: 'TENANT',         label: 'Tenant' },
  { value: 'PROPERTY_OWNER', label: 'Property Owner' },
  { value: 'ADMIN',          label: 'Admin' },
  { value: 'SUPER_ADMIN',    label: 'Super Admin' },
];

export const STATUS_FILTER_OPTIONS: { value: AccountStatus | 'ALL'; label: string }[] = [
  { value: 'ALL',       label: 'All Statuses' },
  { value: 'ACTIVE',    label: 'Active' },
  { value: 'PENDING',   label: 'Pending' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'BLOCKED',   label: 'Blocked' },
  { value: 'REJECTED',  label: 'Rejected' },
];
