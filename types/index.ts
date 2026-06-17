// ─── Global Type Re-exports ───────────────────────────────────────────────────
// Import from here when you need types from multiple features.
// e.g. import type { UserAccount, UserRole, PermissionKey } from '@/types'

// Roles
export type { UserRole } from '@/features/roles/types/role.types';
export {
  PUBLIC_REGISTRATION_ROLES,
  ROLE_LABELS,
  ROLE_HIERARCHY,
  ROLE_DEFAULT_ROUTES,
} from '@/features/roles/types/role.types';

// Users
export type {
  AccountStatus,
  KycStatus,
  WalletStatus,
  UserAccount,
  UserAccountWithPassword,
  UpdateProfilePayload,
  SuspendUserPayload,
  BlockUserPayload,
  UpdateUserStatusPayload,
  CreateAdminPayload,
  UserFilters,
} from '@/features/users/types/user.types';
export {
  ACCOUNT_STATUS_LABELS,
  KYC_STATUS_LABELS,
  WALLET_STATUS_LABELS,
} from '@/features/users/types/user.types';

// Auth
export type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthState,
  AuthErrorCode,
} from '@/features/auth/types/auth.types';
export { AUTH_ERROR_MESSAGES } from '@/features/auth/types/auth.types';

// Permissions
export type {
  PermissionKey,
  RolePermissionMap,
  PermissionCheckResult,
} from '@/features/permissions/types/permission.types';



// ─── Property / Listing ───────────────────────────────────────────────────────

export type ListingType = 'sale' | 'rent';
export type PropertyType = 'residential' | 'commercial';
export type ListingStatus =
  | 'draft'
  | 'active'
  | 'pending'
  | 'sold'
  | 'rented'
  | 'delisted'
  | 'expired'
  | 'flagged';

export type ListingTier = 'basic' | 'premium' | 'featured';

/**
 * PropertySummary — lightweight shape used in cards, grids, and map pins.
 * The full detail shape lives in features/listings/types/.
 */
export interface PropertySummary {
  id: string;
  title: string;
  address: string;
  city: string;
  country: string;
  price: number;
  currency: string;
  image: string; // primary photo URL
  listingType: ListingType;
  type: PropertyType;
  status: ListingStatus;
  tier?: ListingTier;
  beds?: number;
  baths?: number;
  sqft?: number;
  lat?: number;
  lng?: number;
  ownerId: string;
  createdAt: string;
}

/**
 * PropertyFilters — used by search page URL params, ListingFilters component,
 * and the Zustand filter store.
 */
export interface PropertyFilters {
  query?: string;
  type?: PropertyType;
  listingType?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  status?: ListingStatus;
  tier?: ListingTier;
  city?: string;
  page?: number;
  pageSize?: number;
}
