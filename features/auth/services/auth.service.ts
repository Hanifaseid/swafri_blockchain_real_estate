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
      // Store mustResetPassword flag so queries layer can redirect
      if (data.data.user.mustResetPassword) {
        localStorage.setItem('vex_must_reset_password', '1');
      } else {
        localStorage.removeItem('vex_must_reset_password');
      }
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
// POST /auth/logout — must send { refreshToken } in body per spec.

export async function logout(): Promise<void> {
  if (typeof window === 'undefined') return;

  const raw = localStorage.getItem(SESSION_KEYS.ACTIVE_USER);
  if (raw) {
    try {
      const user = JSON.parse(raw) as UserAccount;
      logAudit(user, 'User logged out');

      // Send refreshToken in body so backend can revoke this specific session
      const refreshToken = localStorage.getItem('vex_refresh_token');
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT, { refreshToken }).catch(() => {});
    } catch {
      // ignore
    }
  }

  localStorage.removeItem('vex_refresh_token');
  clearSession();
}
// ─── forgotPassword ────────────────────────────────────────────────────────
export async function forgotPassword(email: string): Promise<void> {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(
    ENDPOINTS.AUTH.FORGOT_PASSWORD,
    { email }
  );
  if (!data.success) throw new AuthServiceError(mapApiError(data.message));
}

// ─── resetPassword ──────────────────────────────────────────────────────────────
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(
    ENDPOINTS.AUTH.RESET_PASSWORD,
    { token, password: newPassword }
  );
  if (!data.success) throw new AuthServiceError(mapApiError(data.message));
  // Invalidate all sessions – client side only
  await logoutAll();
}

// ─── logoutAll ────────────────────────────────────────────────────────────────
export async function logoutAll(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await apiClient.post(ENDPOINTS.AUTH.LOGOUT_ALL);
  } catch {
    // ignore errors – best effort
  }
  // clear refresh token and session
  localStorage.removeItem('vex_refresh_token');
  clearSession();
}


// ─── changePassword ───────────────────────────────────────────────────────────
// POST /auth/change-password — revokes all sessions after success.

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(
    ENDPOINTS.AUTH.CHANGE_PASSWORD,
    { currentPassword, newPassword }
  );
  if (!data.success) throw new AuthServiceError(mapApiError(data.message));
  // Backend revokes all sessions — clear local session too
  localStorage.removeItem('vex_refresh_token');
  clearSession();
}

// ─── Wallet ───────────────────────────────────────────────────────────────────
// POST /auth/wallet/challenge → get nonce to sign
// POST /auth/wallet/link      → link with signed challenge
// DELETE /auth/wallet         → unlink

export async function requestWalletChallenge(walletAddress: string): Promise<string> {
  const { data } = await apiClient.post<any>(
    ENDPOINTS.AUTH.WALLET_CHALLENGE,
    { walletAddress }
  );

  if (typeof data === 'string') return data;
  if (data?.success === false) {
    throw new Error(data.message || 'Failed to get wallet challenge');
  }

  // Backend returns { data: { walletAddress, message, expiresAt } }. The user
  // must sign the exact `message` string — fall back to other shapes defensively.
  const payload = data?.data ?? data;
  const challenge = payload?.message ?? payload?.challenge ?? payload?.nonce;
  if (!challenge) throw new Error('Wallet challenge response did not contain a message to sign.');
  return challenge as string;
}

export async function linkWallet(
  walletAddress: string,
  signature: string,
  currentUser: UserAccount
): Promise<UserAccount> {
  const { data } = await apiClient.post<any>(
    ENDPOINTS.AUTH.WALLET_LINK,
    { walletAddress, signature }
  );
  
  if (data?.success === false) {
    throw new Error(data.message || 'Failed to link wallet');
  }

  // If the API returns the updated profile, use it. Otherwise, patch locally.
  const updated = data?.data && data.data.id 
    ? adaptUser(data.data) 
    : { ...currentUser, walletStatus: 'VERIFIED' as const, linkedWalletAddress: walletAddress };

  setSession(updated);
  logAudit(currentUser, `Wallet linked: ${walletAddress}`);
  return updated;
}

export async function unlinkWallet(currentUser: UserAccount): Promise<UserAccount> {
  const { data } = await apiClient.delete<any>(ENDPOINTS.AUTH.WALLET_UNLINK);
  
  if (data?.success === false) {
    throw new Error(data.message || 'Failed to unlink wallet');
  }

  const updated = data?.data && data.data.id
    ? adaptUser(data.data)
    : { ...currentUser, walletStatus: 'NOT_LINKED' as const, linkedWalletAddress: undefined };

  setSession(updated);
  logAudit(currentUser, 'Wallet unlinked');
  return updated;
}
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

// ─── updateProfile ────────────────────────────────────────────────────────────
// PATCH /auth/profile — update own name / phone. Refreshes the cached session.

export async function updateProfile(payload: {
  name?: string;
  phone?: string;
}): Promise<UserAccount> {
  const { data } = await apiClient.patch<ApiProfileResponse & { message?: string }>(
    ENDPOINTS.AUTH.PROFILE,
    payload,
  );
  if (!data.success) throw new AuthServiceError(mapApiError(data.message ?? ''));
  const user = adaptUser(data.data);
  setSession(user);
  return user;
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
      data: import('@/lib/api/adapters').ApiUser;   // flat user, no .user wrapper
    }>(
      ENDPOINTS.ADMIN.ADMINS,
      {
        name:     payload.name,
        email:    payload.email,
        password: payload.password,
      }
    );

    if (!data.success) {
      throw new AuthServiceError(mapApiError(data.message));
    }

    const newAdmin = adaptUser(data.data);  // data.data is the user directly
    logAudit(createdBy, `Super admin created new admin: ${newAdmin.email}`);
    return newAdmin;

  } catch (err: unknown) {
    if (err instanceof AuthServiceError) throw err;
    const axiosErr = err as { response?: { data?: { message?: string } } };
    const message = axiosErr?.response?.data?.message ?? 'Unknown error';
    throw new AuthServiceError(mapApiError(message));
  }
}
