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
