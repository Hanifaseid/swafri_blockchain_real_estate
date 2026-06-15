import type { UserRole } from '@/features/roles/types/role.types';
import type { UserAccount } from '@/features/users/types/user.types';

// ─── Login ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserAccount;
  token?: string; // will be used when real backend is connected
}

// ─── Registration ─────────────────────────────────────────────────────────────
// Only TENANT and PROPERTY_OWNER can register publicly.

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: Extract<UserRole, 'TENANT' | 'PROPERTY_OWNER'>;
  phone?: string;
}

export interface RegisterResponse {
  user: UserAccount;
  token?: string;
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// ─── Auth State ───────────────────────────────────────────────────────────────
// Shape of the auth Zustand store.

export interface AuthState {
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ─── Auth Errors ──────────────────────────────────────────────────────────────
// Safe error messages — never expose whether email exists or not.

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'      // wrong email or password
  | 'ACCOUNT_SUSPENDED'        // temporarily restricted
  | 'ACCOUNT_BLOCKED'          // permanently blocked
  | 'ACCOUNT_REJECTED'         // registration was rejected
  | 'ACCOUNT_PENDING'          // account not yet activated
  | 'EMAIL_ALREADY_EXISTS'     // duplicate registration
  | 'WEAK_PASSWORD'            // password too short/weak
  | 'UNAUTHORIZED_ROLE'        // trying to register as ADMIN/SUPER_ADMIN
  | 'UNKNOWN';

export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_SUSPENDED: 'Your account has been temporarily suspended. Please contact support.',
  ACCOUNT_BLOCKED: 'Your account has been blocked due to policy violations.',
  ACCOUNT_REJECTED: 'Your account registration has been rejected.',
  ACCOUNT_PENDING: 'Your account is pending review. Please wait for approval.',
  EMAIL_ALREADY_EXISTS: 'An account with this email address already exists.',
  WEAK_PASSWORD: 'Password must be at least 8 characters.',
  UNAUTHORIZED_ROLE: 'This role cannot be registered publicly.',
  UNKNOWN: 'Something went wrong. Please try again.',
};
