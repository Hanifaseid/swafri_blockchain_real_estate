import type { UserAccount, AccountStatus, UserFilters } from '@/features/users/types/user.types';
import type { UserRole } from '@/features/roles/types/role.types';
import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { SESSION_KEYS } from '@/lib/auth/session';
import { adaptUser, type ApiUser, ROLE_TO_API } from '@/lib/api/adapters';

// ─── Audit helper ─────────────────────────────────────────────────────────────
// Audit logs are stored locally since the API has no audit endpoint.

function logAudit(actorName: string, actorEmail: string, action: string) {
  if (typeof window === 'undefined') return;
  const raw = localStorage.getItem(SESSION_KEYS.AUDIT_LOGS);
  const logs = raw ? JSON.parse(raw) : [];
  logs.unshift({
    id: `log-${Date.now()}`,
    user: actorName,
    email: actorEmail,
    action,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(SESSION_KEYS.AUDIT_LOGS, JSON.stringify(logs));
}

// ─── API response shapes ──────────────────────────────────────────────────────

interface UsersListResponse {
  success: boolean;
  message: string;
  data: ApiUser[] | { users: ApiUser[] } | { data: ApiUser[] };
}

interface UserDetailResponse {
  success: boolean;
  message: string;
  data: ApiUser;
}

// ─── getUsers ─────────────────────────────────────────────────────────────────

export async function getUsers(filters?: UserFilters): Promise<UserAccount[]> {
  try {
    const params: Record<string, string> = {};
    if (filters?.role)      params.role      = ROLE_TO_API[filters.role as UserRole] ?? filters.role;
    if (filters?.status)    params.status    = filters.status.toLowerCase();
    if (filters?.kycStatus) params.kycStatus = filters.kycStatus.toLowerCase();
    if (filters?.search)    params.search    = filters.search;

    const { data } = await apiClient.get<UsersListResponse>(ENDPOINTS.USERS.LIST, { params });

    if (!data.success) return [];

    // Handle different possible response shapes
    let apiUsers: ApiUser[];
    if (Array.isArray(data.data)) {
      apiUsers = data.data;
    } else if (data.data && 'users' in data.data && Array.isArray((data.data as { users: ApiUser[] }).users)) {
      apiUsers = (data.data as { users: ApiUser[] }).users;
    } else if (data.data && 'data' in data.data && Array.isArray((data.data as { data: ApiUser[] }).data)) {
      apiUsers = (data.data as { data: ApiUser[] }).data;
    } else {
      return [];
    }

    return apiUsers.map(adaptUser);
  } catch {
    return [];
  }
}

// ─── getUserById ──────────────────────────────────────────────────────────────

export async function getUserById(id: string): Promise<UserAccount | null> {
  try {
    const { data } = await apiClient.get<UserDetailResponse>(ENDPOINTS.USERS.DETAIL(id));
    if (!data.success) return null;
    return adaptUser(data.data);
  } catch {
    return null;
  }
}

// ─── updateUserStatus ─────────────────────────────────────────────────────────

export async function updateUserStatus(
  userId: string,
  status: AccountStatus,
  actor: UserAccount,
  reason?: string
): Promise<UserAccount> {
  // Guards
  if (actor.role !== 'SUPER_ADMIN' && actor.role !== 'ADMIN') {
    throw new Error('Insufficient permissions to modify user status.');
  }

  const body = reason ? { reason } : {};

  let endpoint: string;
  if (status === 'SUSPENDED') {
    endpoint = ENDPOINTS.USERS.SUSPEND(userId);
  } else if (status === 'BLOCKED') {
    endpoint = ENDPOINTS.USERS.BLOCK(userId);
  } else if (status === 'ACTIVE') {
    endpoint = ENDPOINTS.USERS.REACTIVATE(userId);
  } else {
    endpoint = ENDPOINTS.USERS.UPDATE(userId);
  }

  const method = status === 'ACTIVE' ? 'patch' : 'patch';
  const { data } = await apiClient[method]<UserDetailResponse>(endpoint, body);

  if (!data.success) {
    throw new Error(data.message || 'Failed to update user status');
  }

  const updated = adaptUser(data.data);

  const actionLabel =
    status === 'SUSPENDED' ? `Suspended user ${updated.email}` :
    status === 'BLOCKED'   ? `Blocked user ${updated.email}` :
    status === 'ACTIVE'    ? `Reactivated user ${updated.email}` :
                             `Set ${updated.email} status to ${status}`;

  logAudit(actor.name, actor.email, reason ? `${actionLabel} — Reason: ${reason}` : actionLabel);
  return updated;
}

// ─── suspendUser ──────────────────────────────────────────────────────────────

export async function suspendUser(
  userId: string,
  actor: UserAccount,
  reason?: string
): Promise<UserAccount> {
  return updateUserStatus(userId, 'SUSPENDED', actor, reason);
}

// ─── blockUser ────────────────────────────────────────────────────────────────

export async function blockUser(
  userId: string,
  actor: UserAccount,
  reason?: string
): Promise<UserAccount> {
  return updateUserStatus(userId, 'BLOCKED', actor, reason);
}

// ─── reactivateUser ───────────────────────────────────────────────────────────

export async function reactivateUser(
  userId: string,
  actor: UserAccount
): Promise<UserAccount> {
  return updateUserStatus(userId, 'ACTIVE', actor);
}
