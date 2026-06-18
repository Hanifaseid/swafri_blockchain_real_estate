import type { UserRole } from '@/features/roles/types/role.types';

// ─── Account Status ───────────────────────────────────────────────────────────
// Represents the current state of a user's account on the platform.

export type AccountStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BLOCKED' | 'REJECTED';

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  PENDING: 'Pending',
  ACTIVE: 'Active',
  SUSPENDED: 'Suspended',
  BLOCKED: 'Blocked',
  REJECTED: 'Rejected',
};

// ─── KYC Status ───────────────────────────────────────────────────────────────
// Know Your Customer verification state.
// Login lets the user enter the platform.
// KYC lets the user perform trusted actions (escrow, property verification, etc.)

export type KycStatus =
  | 'not_started'
  | 'pending'
  | 'verified'
  | 'rejected';

export const KYC_STATUS_LABELS: Record<KycStatus, string> = {
  not_started: 'Not Started',
  pending: 'Pending',
  verified: 'Verified',
  rejected: 'Rejected',
};

// ─── Wallet Status ────────────────────────────────────────────────────────────
// Blockchain wallet linking state.
// Wallet is NOT required for first login.
// Wallet IS required for blockchain-related actions (escrow, fractional buy, etc.)

export type WalletStatus = 'NOT_LINKED' | 'LINKED' | 'VERIFIED' | 'REVOKED';

export const WALLET_STATUS_LABELS: Record<WalletStatus, string> = {
  NOT_LINKED: 'Not Linked',
  LINKED: 'Linked',
  VERIFIED: 'Verified',
  REVOKED: 'Revoked',
};

// ─── User Account ─────────────────────────────────────────────────────────────
// The canonical user shape used across the entire platform.
// This is the single source of truth — other files should import from here.

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: AccountStatus;
  kycStatus: KycStatus;
  walletStatus: WalletStatus;
  createdAt: string;
  updatedAt?: string;
  linkedWalletAddress?: string;
  profileImage?: string;
}

// ─── User with Password ───────────────────────────────────────────────────────
// Extended shape used internally by the mock auth service.
// Never expose passwordHash to the client UI.

export interface UserAccountWithPassword extends UserAccount {
  passwordHash: string;
}

// ─── User Update Payload ──────────────────────────────────────────────────────
// Fields a user is allowed to update on their own profile.
// Role cannot be self-updated per product rules.

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  profileImage?: string;
}

// ─── Admin User Management Payloads ──────────────────────────────────────────

export interface SuspendUserPayload {
  userId: string;
  reason?: string;
}

export interface BlockUserPayload {
  userId: string;
  reason?: string;
}

export interface UpdateUserStatusPayload {
  userId: string;
  status: AccountStatus;
  reason?: string;
}

export interface CreateAdminPayload {
  name: string;
  email: string;
  password: string;
}

// ─── User Filters ─────────────────────────────────────────────────────────────
// Used by admin user management tables.

export interface UserFilters {
  role?: UserRole;
  status?: AccountStatus;
  kycStatus?: KycStatus;
  search?: string;
}
