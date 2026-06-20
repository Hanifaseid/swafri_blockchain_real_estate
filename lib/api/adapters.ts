import type { UserAccount, AccountStatus, KycStatus, WalletStatus } from '@/features/users/types/user.types';
import type { UserRole } from '@/features/roles/types/role.types';

// ─── API → Frontend Field Mapping ────────────────────────────────────────────
// The API returns lowercase/snake_case values.
// Our frontend types use SCREAMING_SNAKE_CASE.
// All mapping lives here — change once, applies everywhere.

// Role mapping: API → Frontend
const ROLE_MAP: Record<string, UserRole> = {
  super_admin:    'SUPER_ADMIN',
  admin:          'ADMIN',
  property_owner: 'PROPERTY_OWNER',
  tenant:         'TENANT',
};

// Role mapping: Frontend → API
export const ROLE_TO_API: Record<UserRole, string> = {
  SUPER_ADMIN:    'super_admin',
  ADMIN:          'admin',
  PROPERTY_OWNER: 'property_owner',
  TENANT:         'tenant',
};

// Account status mapping
const STATUS_MAP: Record<string, AccountStatus> = {
  pending:   'PENDING',
  active:    'ACTIVE',
  suspended: 'SUSPENDED',
  blocked:   'BLOCKED',
  rejected:  'REJECTED',
};

// KYC status mapping
const KYC_MAP: Record<string, KycStatus> = {
  not_started:  'not_started',
  pending:      'pending',
  under_review: 'pending',
  approved:     'verified',
  verified:     'verified',
  rejected:     'rejected',
  expired:      'not_started',
};

// Wallet status mapping
const WALLET_MAP: Record<string, WalletStatus> = {
  unlinked: 'NOT_LINKED',
  pending_signature: 'PENDING_SIGNATURE',
  linked:   'LINKED',
  verified: 'VERIFIED',
  revoked:  'REVOKED',
};

// ─── Raw API User shape ───────────────────────────────────────────────────────
// Exactly what the backend returns.

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  accountStatus: string;
  kycStatus: string;
  walletStatus: string;
  emailVerified: boolean;
  mustResetPassword: boolean;
  createdAt?: string;
  updatedAt?: string;
  profileImage?: string;
  walletAddress?: string;        // API field name (not linkedWalletAddress)
  linkedWalletAddress?: string;  // fallback alias
}

export interface ApiTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiAuthResponse {
  success: boolean;
  message: string;
  data: {
    user: ApiUser;
    tokens: ApiTokens;
  };
}

export interface ApiProfileResponse {
  success: boolean;
  message: string;
  data: ApiUser;
}

// ─── adaptUser ────────────────────────────────────────────────────────────────
// Converts an API user object to the frontend UserAccount type.

export function adaptUser(apiUser: ApiUser): UserAccount {
  return {
    id:                  apiUser.id,
    name:                apiUser.name,
    email:               apiUser.email,
    phone:               apiUser.phone,
    role:                ROLE_MAP[apiUser.role]     ?? 'TENANT',
    status:              STATUS_MAP[apiUser.accountStatus] ?? 'ACTIVE',
    kycStatus:           KYC_MAP[apiUser.kycStatus] ?? 'not_started',
    walletStatus:        WALLET_MAP[apiUser.walletStatus] ?? 'NOT_LINKED',
    createdAt:           apiUser.createdAt ?? new Date().toISOString(),
    updatedAt:           apiUser.updatedAt,
    profileImage:        apiUser.profileImage,
    // API uses walletAddress; fallback to linkedWalletAddress for compatibility
    linkedWalletAddress: apiUser.walletAddress ?? apiUser.linkedWalletAddress,
  };
}
