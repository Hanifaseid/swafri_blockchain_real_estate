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
import { getMockUsers, saveMockUsers } from '@/features/auth/utils/seed';
import { SESSION_KEYS, setSession, clearSession } from '@/lib/auth/session';

// ─── Auth Error ───────────────────────────────────────────────────────────────

export class AuthServiceError extends Error {
  constructor(public readonly code: AuthErrorCode) {
    super(AUTH_ERROR_MESSAGES[code]);
    this.name = 'AuthServiceError';
  }
}

// ─── Log Audit ────────────────────────────────────────────────────────────────
// Writes an entry to the mock audit log in localStorage.

function logAudit(user: UserAccount, action: string): void {
  if (typeof window === 'undefined') return;
  const raw = localStorage.getItem(SESSION_KEYS.AUDIT_LOGS);
  const existing = raw ? JSON.parse(raw) : [];
  const entry = {
    id: `log-${Date.now()}`,
    user: user.name,
    email: user.email,
    action,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(
    SESSION_KEYS.AUDIT_LOGS,
    JSON.stringify([entry, ...existing])
  );
}

// ─── Strip Password ───────────────────────────────────────────────────────────
// Never expose passwordHash to the UI layer.

function stripPassword(user: ReturnType<typeof getMockUsers>[number]): UserAccount {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...safe } = user;
  return safe;
}

// ─── login ────────────────────────────────────────────────────────────────────
// Simulates POST /auth/login.
// Returns a LoginResponse on success, throws AuthServiceError on failure.

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  // Simulate network delay
  await delay(800);

  const users = getMockUsers();
  const match = users.find(
    (u) => u.email.trim().toLowerCase() === payload.email.trim().toLowerCase()
  );

  // Use a single generic message for both "not found" and "wrong password"
  // to avoid exposing whether the email exists (security best practice).
  if (!match || match.passwordHash !== payload.password) {
    throw new AuthServiceError('INVALID_CREDENTIALS');
  }

  if (match.status === 'SUSPENDED') throw new AuthServiceError('ACCOUNT_SUSPENDED');
  if (match.status === 'BLOCKED') throw new AuthServiceError('ACCOUNT_BLOCKED');
  if (match.status === 'REJECTED') throw new AuthServiceError('ACCOUNT_REJECTED');
  if (match.status === 'PENDING') throw new AuthServiceError('ACCOUNT_PENDING');

  const user = stripPassword(match);

  // Persist session — backward-compatible with existing portal/page.tsx
  setSession(user);
  logAudit(user, 'User logged in');

  return { user };
}

// ─── register ─────────────────────────────────────────────────────────────────
// Simulates POST /auth/register.
// Only TENANT and PROPERTY_OWNER are allowed via this endpoint.

export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
  await delay(800);

  // Block admin-level role registration
  if (payload.role !== 'TENANT' && payload.role !== 'PROPERTY_OWNER') {
    throw new AuthServiceError('UNAUTHORIZED_ROLE');
  }

  const users = getMockUsers();
  const exists = users.some(
    (u) => u.email.trim().toLowerCase() === payload.email.trim().toLowerCase()
  );

  if (exists) throw new AuthServiceError('EMAIL_ALREADY_EXISTS');

  // New tenants are ACTIVE immediately.
  // New property owners start as PENDING until an admin approves them.
  const newUser: UserAccount = {
    id: `usr-${Math.floor(100_000 + Math.random() * 900_000)}`,
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone?.trim() || undefined,
    role: payload.role,
    status: payload.role === 'TENANT' ? 'ACTIVE' : 'PENDING',
    kycStatus: 'NOT_STARTED',
    walletStatus: 'NOT_LINKED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Save to mock DB with password
  saveMockUsers([...users, { ...newUser, passwordHash: payload.password }]);

  // Set session
  setSession(newUser);
  logAudit(newUser, `User registered as ${newUser.role}`);

  return { user: newUser };
}

// ─── logout ───────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  if (typeof window === 'undefined') return;

  // Read current user before clearing so we can log the event
  const raw = localStorage.getItem(SESSION_KEYS.ACTIVE_USER);
  if (raw) {
    try {
      const user = JSON.parse(raw) as UserAccount;
      logAudit(user, 'User logged out');
    } catch {
      // ignore parse errors
    }
  }

  clearSession();
}

// ─── getCurrentUser ───────────────────────────────────────────────────────────
// Reads the active session from localStorage.
// Returns null if not logged in.

export async function getCurrentUser(): Promise<UserAccount | null> {
  await delay(100);
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem(SESSION_KEYS.ACTIVE_USER);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as UserAccount;
  } catch {
    return null;
  }
}

// ─── createAdmin ──────────────────────────────────────────────────────────────
// SUPER_ADMIN only — creates an ADMIN account.
// Called from the Create Admin form in the dashboard.

export async function createAdmin(
  payload: CreateAdminPayload,
  createdBy: UserAccount
): Promise<UserAccount> {
  await delay(600);

  if (createdBy.role !== 'SUPER_ADMIN') {
    throw new AuthServiceError('UNAUTHORIZED_ROLE');
  }

  const users = getMockUsers();
  const exists = users.some(
    (u) => u.email.trim().toLowerCase() === payload.email.trim().toLowerCase()
  );

  if (exists) throw new AuthServiceError('EMAIL_ALREADY_EXISTS');

  const newAdmin: UserAccount = {
    id: `usr-${Math.floor(100_000 + Math.random() * 900_000)}`,
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    role: 'ADMIN',
    status: 'ACTIVE',
    kycStatus: 'APPROVED',
    walletStatus: 'NOT_LINKED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveMockUsers([...users, { ...newAdmin, passwordHash: payload.password }]);
  logAudit(createdBy, `Super admin created new admin: ${newAdmin.email}`);

  return newAdmin;
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
