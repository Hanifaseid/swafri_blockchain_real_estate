import type { UserAccount } from '@/features/users/types/user.types';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  AuthErrorCode,
} from '@/features/auth/types/auth.types';
import type { CreateAdminPayload } from '@/features/users/types/user.types';
import { AUTH_ERROR_MESSAGES } from '@/features/auth/types/auth.types';
import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { SESSION_KEYS, setSession, clearSession } from '@/lib/auth/session';
import {
  adaptUser,
  ROLE_TO_API,
  type ApiAuthResponse,
  type ApiProfileResponse,
} from '@/lib/api/adapters';

// ─── Auth Error ───────────────────────────────────────────────────────────────

export class AuthServiceError extends Error {
  constructor(public readonly code: AuthErrorCode) {
    super(AUTH_ERROR_MESSAGES[code]);
    this.name = 'AuthServiceError';
  }
}

// ─── Map API error message → AuthErrorCode ────────────────────────────────────

function mapApiError(message: string): AuthErrorCode {
  const m = message.toLowerCase();
  if (m.includes('invalid email or password') || m.includes('invalid credentials')) return 'INVALID_CREDENTIALS';
  if (m.includes('suspended'))    return 'ACCOUNT_SUSPENDED';
  if (m.includes('blocked'))      return 'ACCOUNT_BLOCKED';
  if (m.includes('rejected'))     return 'ACCOUNT_REJECTED';
  if (m.includes('pending'))      return 'ACCOUNT_PENDING';
  if (m.includes('already'))      return 'EMAIL_ALREADY_EXISTS';
  if (m.includes('password'))     return 'WEAK_PASSWORD';
  if (m.includes('role'))         return 'UNAUTHORIZED_ROLE';
  return 'UNKNOWN';
}

// ─── Audit logger (client-side only) ─────────────────────────────────────────

function logAudit(user: UserAccount, action: string): void {
  if (typeof window === 'undefined') return;
  const raw = localStorage.getItem(SESSION_KEYS.AUDIT_LOGS);
  const existing = raw ? JSON.parse(raw) : [];
  existing.unshift({
    id: `log-${Date.now()}`,
    user: user.name,
    email: user.email,
    action,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(SESSION_KEYS.AUDIT_LOGS, JSON.stringify(existing));
}

// ─── login ────────────────────────────────────────────────────────────────────

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  try {
    const { data } = await apiClient.post<ApiAuthResponse>(ENDPOINTS.AUTH.LOGIN, {
      email: payload.email,
      password: payload.password,
    });

    if (!data.success) {
      throw new AuthServiceError(mapApiError(data.message));
    }

    const user = adaptUser(data.data.user);
    const token = data.data.tokens.accessToken;
    const refreshToken = data.data.tokens.refreshToken;

    // Persist session + tokens
    setSession(user, token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vex_refresh_token', refreshToken);
    }

    logAudit(user, 'User logged in');
    return { user, token };

  } catch (err: unknown) {
    if (err instanceof AuthServiceError) throw err;

    // Axios error — extract message from response
    const axiosErr = err as { response?: { data?: { message?: string } } };
    const message = axiosErr?.response?.data?.message ?? 'Unknown error';
    throw new AuthServiceError(mapApiError(message));
  }
}

// ─── register ─────────────────────────────────────────────────────────────────

export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
  // Block admin-level role registration on frontend
  if (payload.role !== 'TENANT' && payload.role !== 'PROPERTY_OWNER') {
    throw new AuthServiceError('UNAUTHORIZED_ROLE');
  }

  try {
    const { data } = await apiClient.post<ApiAuthResponse>(ENDPOINTS.AUTH.REGISTER, {
      name:     payload.name,
      email:    payload.email,
      password: payload.password,
      phone:    payload.phone || undefined,
      role:     ROLE_TO_API[payload.role], // convert TENANT → "tenant"
    });

    if (!data.success) {
      throw new AuthServiceError(mapApiError(data.message));
    }

    const user = adaptUser(data.data.user);
    const token = data.data.tokens.accessToken;
    const refreshToken = data.data.tokens.refreshToken;

    setSession(user, token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vex_refresh_token', refreshToken);
    }

    logAudit(user, `User registered as ${user.role}`);
    return { user, token };

  } catch (err: unknown) {
    if (err instanceof AuthServiceError) throw err;
    const axiosErr = err as { response?: { data?: { message?: string } } };
    const message = axiosErr?.response?.data?.message ?? 'Unknown error';
    throw new AuthServiceError(mapApiError(message));
  }
}

// ─── logout ───────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  if (typeof window === 'undefined') return;

  const raw = localStorage.getItem(SESSION_KEYS.ACTIVE_USER);
  if (raw) {
    try {
      const user = JSON.parse(raw) as UserAccount;
      logAudit(user, 'User logged out');

      // Call logout endpoint — best effort, don't block on failure
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT).catch(() => {});
    } catch {
      // ignore
    }
  }

  localStorage.removeItem('vex_refresh_token');
  clearSession();
}

// ─── getCurrentUser ───────────────────────────────────────────────────────────
// Reads the active session token and fetches the latest profile from the API.
// Falls back to cached session if the API is unreachable.

export async function getCurrentUser(): Promise<UserAccount | null> {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem(SESSION_KEYS.ACTIVE_USER);
  if (!raw) return null;

  try {
    // Fetch fresh profile from API using stored token
    const { data } = await apiClient.get<ApiProfileResponse>(ENDPOINTS.AUTH.ME);
    if (data.success) {
      const user = adaptUser(data.data);
      // Update cached session with latest data
      setSession(user);
      return user;
    }
  } catch {
    // Network error — fall back to cached session
  }

  try {
    return JSON.parse(raw) as UserAccount;
  } catch {
    return null;
  }
}

// ─── createAdmin ──────────────────────────────────────────────────────────────
// SUPER_ADMIN only — creates an ADMIN account via POST /admin/admins.

export async function createAdmin(
  payload: CreateAdminPayload,
  createdBy: UserAccount
): Promise<UserAccount> {
  if (createdBy.role !== 'SUPER_ADMIN') {
    throw new AuthServiceError('UNAUTHORIZED_ROLE');
  }

  try {
    const { data } = await apiClient.post<{
      success: boolean;
      message: string;
      data: { user: import('@/lib/api/adapters').ApiUser };
    }>(
      ENDPOINTS.ADMIN.ADMINS,          // POST /admin/admins
      {
        name:     payload.name,
        email:    payload.email,
        password: payload.password,
      }
    );

    if (!data.success) {
      throw new AuthServiceError(mapApiError(data.message));
    }

    const newAdmin = adaptUser(data.data.user);
    logAudit(createdBy, `Super admin created new admin: ${newAdmin.email}`);
    return newAdmin;

  } catch (err: unknown) {
    if (err instanceof AuthServiceError) throw err;
    const axiosErr = err as { response?: { data?: { message?: string } } };
    const message = axiosErr?.response?.data?.message ?? 'Unknown error';
    throw new AuthServiceError(mapApiError(message));
  }
}
