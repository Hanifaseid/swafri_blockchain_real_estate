import type { UserAccount, AccountStatus, UserFilters } from '@/features/users/types/user.types';
import type { UserRole } from '@/features/roles/types/role.types';
import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { SESSION_KEYS } from '@/lib/auth/session';
import { adaptUser, type ApiUser, ROLE_TO_API } from '@/lib/api/adapters';

// ─── Audit helper ─────────────────────────────────────────────────────────────

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

// ─── Response shapes ──────────────────────────────────────────────────────────

interface UserListData {
  users?: ApiUser[];
  data?: ApiUser[];
  items?: ApiUser[];
  results?: ApiUser[];
}

interface UsersListResponse {
  success: boolean;
  message: string;
  data: ApiUser[] | UserListData;
}

interface UserDetailResponse {
  success: boolean;
  message: string;
  data: ApiUser | { user: ApiUser };
}

// ─── Helper: extract user array from any response shape ──────────────────────

function extractUsers(responseData: ApiUser[] | UserListData): ApiUser[] {
  if (Array.isArray(responseData)) return responseData;
  const d = responseData as UserListData;
  return d.users ?? d.data ?? d.items ?? d.results ?? [];
}

// ─── Helper: extract single user from response ────────────────────────────────

function extractUser(responseData: ApiUser | { user: ApiUser }): ApiUser {
  if ('user' in (responseData as { user: ApiUser })) {
    return (responseData as { user: ApiUser }).user;
  }
  return responseData as ApiUser;
}

// ─── getUsers ─────────────────────────────────────────────────────────────────
// GET /admin/users — query params: role, accountStatus, page, limit

export async function getUsers(filters?: UserFilters): Promise<UserAccount[]> {
  try {
    const params: Record<string, string | number> = { page: 1, limit: 50 };

    if (filters?.role)   params.role          = ROLE_TO_API[filters.role as UserRole] ?? filters.role;
    if (filters?.status) params.accountStatus = filters.status.toLowerCase();
    if (filters?.kycStatus) params.kycStatus  = filters.kycStatus.toLowerCase();
    if (filters?.search) params.search        = filters.search;

    const { data } = await apiClient.get<UsersListResponse>(ENDPOINTS.ADMIN.USERS, { params });
    if (!data.success) return [];
    return extractUsers(data.data).map(adaptUser);
  } catch {
    return [];
  }
}

// ─── getUserById ──────────────────────────────────────────────────────────────
// GET /admin/users/:id

export async function getUserById(id: string): Promise<UserAccount | null> {
  try {
    const { data } = await apiClient.get<UserDetailResponse>(ENDPOINTS.ADMIN.USER_DETAIL(id));
    if (!data.success) return null;
    return adaptUser(extractUser(data.data));
  } catch {
    return null;
  }
}

// ─── suspendUser ──────────────────────────────────────────────────────────────
// POST /admin/users/:id/suspend

export async function suspendUser(
  userId: string,
  actor: UserAccount,
  reason?: string
): Promise<UserAccount> {
  if (actor.role !== 'SUPER_ADMIN' && actor.role !== 'ADMIN') {
    throw new Error('Insufficient permissions.');
  }

  const { data } = await apiClient.post<UserDetailResponse>(
    ENDPOINTS.ADMIN.USER_SUSPEND(userId),
    reason ? { reason } : {}
  );

  if (!data.success) throw new Error((data as { message: string }).message || 'Failed to suspend user');

  const updated = adaptUser(extractUser(data.data));
  logAudit(actor.name, actor.email, `Suspended user ${updated.email}${reason ? ` — ${reason}` : ''}`);
  return updated;
}

// ─── blockUser ────────────────────────────────────────────────────────────────
// POST /admin/users/:id/block

export async function blockUser(
  userId: string,
  actor: UserAccount,
  reason?: string
): Promise<UserAccount> {
  if (actor.role !== 'SUPER_ADMIN' && actor.role !== 'ADMIN') {
    throw new Error('Insufficient permissions.');
  }

  const { data } = await apiClient.post<UserDetailResponse>(
    ENDPOINTS.ADMIN.USER_BLOCK(userId),
    reason ? { reason } : {}
  );

  if (!data.success) throw new Error((data as { message: string }).message || 'Failed to block user');

  const updated = adaptUser(extractUser(data.data));
  logAudit(actor.name, actor.email, `Blocked user ${updated.email}${reason ? ` — ${reason}` : ''}`);
  return updated;
}

// ─── reactivateUser ───────────────────────────────────────────────────────────
// POST /admin/users/:id/reactivate

export async function reactivateUser(
  userId: string,
  actor: UserAccount
): Promise<UserAccount> {
  if (actor.role !== 'SUPER_ADMIN' && actor.role !== 'ADMIN') {
    throw new Error('Insufficient permissions.');
  }

  // First try the dedicated reactivate endpoint (may fail for BLOCKED users)
  try {
    const { data } = await apiClient.post<UserDetailResponse>(
      ENDPOINTS.ADMIN.USER_REACTIVATE(userId),
      {}
    );
    if (!data.success) {
      throw new Error((data as { message: string }).message || 'Failed to reactivate user');
    }
    const updated = adaptUser(extractUser(data.data));
    logAudit(actor.name, actor.email, `Reactivated user ${updated.email}`);
    return updated;
  } catch (err) {
    // Fallback: PATCH status to ACTIVE (covers BLOCKED users)
    const { data } = await apiClient.patch<UserDetailResponse>(
      ENDPOINTS.ADMIN.USER_STATUS(userId),
      { accountStatus: 'active' }
    );
    if (!data.success) {
      throw new Error((data as { message: string }).message || 'Failed to reactivate user via fallback');
    }
    const updated = adaptUser(extractUser(data.data));
    logAudit(actor.name, actor.email, `Reactivated user ${updated.email} via fallback`);
    return updated;
  }
}

// ─── getAdmins ────────────────────────────────────────────────────────────────
// GET /admin/admins — super_admin only

export async function getAdmins(): Promise<UserAccount[]> {
  try {
    const { data } = await apiClient.get<UsersListResponse>(ENDPOINTS.ADMIN.ADMINS, {
      params: { page: 1, limit: 50 },
    });
    if (!data.success) return [];
    return extractUsers(data.data).map(adaptUser);
  } catch {
    return [];
  }
}

// ─── suspendAdmin ─────────────────────────────────────────────────────────────
// POST /admin/admins/:id/suspend — super_admin only

export async function suspendAdmin(
  adminId: string,
  actor: UserAccount,
  reason?: string
): Promise<UserAccount> {
  if (actor.role !== 'SUPER_ADMIN') throw new Error('Only Super Admin can suspend admins.');

  const { data } = await apiClient.post<UserDetailResponse>(
    ENDPOINTS.ADMIN.ADMIN_SUSPEND(adminId),
    reason ? { reason } : {}
  );

  if (!data.success) throw new Error((data as { message: string }).message || 'Failed to suspend admin');

  const updated = adaptUser(extractUser(data.data));
  logAudit(actor.name, actor.email, `Suspended admin ${updated.email}`);
  return updated;
}

// ─── reactivateAdmin ──────────────────────────────────────────────────────────
// POST /admin/admins/:id/reactivate — super_admin only

export async function reactivateAdmin(
  adminId: string,
  actor: UserAccount
): Promise<UserAccount> {
  if (actor.role !== 'SUPER_ADMIN') throw new Error('Only Super Admin can reactivate admins.');

  const { data } = await apiClient.post<UserDetailResponse>(
    ENDPOINTS.ADMIN.ADMIN_REACTIVATE(adminId),
    {}
  );

  if (!data.success) throw new Error((data as { message: string }).message || 'Failed to reactivate admin');

  const updated = adaptUser(extractUser(data.data));
  logAudit(actor.name, actor.email, `Reactivated admin ${updated.email}`);
  return updated;
}
// PATCH /admin/users/:id/status  — generic status update

export async function updateUserStatus(
  userId: string,
  status: AccountStatus,
  actor: UserAccount,
  reason?: string
): Promise<UserAccount> {
  // Reactivate (unblock) user when requested ACTIVE status
  if (status === 'ACTIVE') {
    return reactivateUser(userId, actor);
  }
  if (status === 'SUSPENDED') return suspendUser(userId, actor, reason);
  if (status === 'BLOCKED')   return blockUser(userId, actor, reason);

  // Fallback for other statuses (PENDING, REJECTED, EXPIRED, etc.)
  const { data } = await apiClient.patch<UserDetailResponse>(
    ENDPOINTS.ADMIN.USER_STATUS(userId),
    { accountStatus: status.toLowerCase(), ...(reason ? { reason } : {}) }
  );

  if (!data.success) throw new Error((data as { message: string }).message || 'Failed to update status');

  const updated = adaptUser(extractUser(data.data));
  logAudit(actor.name, actor.email, `Set ${updated.email} status to ${status}`);
  return updated;
}
