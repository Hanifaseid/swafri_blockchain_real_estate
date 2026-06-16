import type { UserAccount, AccountStatus, UserFilters } from '@/features/users/types/user.types';
import { getMockUsers, saveMockUsers } from '@/features/auth/utils/seed';
import { SESSION_KEYS } from '@/lib/auth/session';

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

function stripPassword(user: ReturnType<typeof getMockUsers>[number]): UserAccount {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...safe } = user;
  return safe;
}

function delay(ms = 400): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── getUsers ─────────────────────────────────────────────────────────────────

export async function getUsers(filters?: UserFilters): Promise<UserAccount[]> {
  await delay(300);
  let users = getMockUsers().map(stripPassword);

  if (filters?.role)   users = users.filter((u) => u.role === filters.role);
  if (filters?.status) users = users.filter((u) => u.status === filters.status);
  if (filters?.kycStatus) users = users.filter((u) => u.kycStatus === filters.kycStatus);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    users = users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }

  return users;
}

// ─── getUserById ──────────────────────────────────────────────────────────────

export async function getUserById(id: string): Promise<UserAccount | null> {
  await delay(200);
  const all = getMockUsers();
  const found = all.find((u) => u.id === id);
  return found ? stripPassword(found) : null;
}

// ─── updateUserStatus ─────────────────────────────────────────────────────────

export async function updateUserStatus(
  userId: string,
  status: AccountStatus,
  actor: UserAccount,
  reason?: string
): Promise<UserAccount> {
  await delay(400);
  const all = getMockUsers();
  const idx = all.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error('User not found');

  const target = all[idx];

  // Guards
  if (target.role === 'SUPER_ADMIN') throw new Error('Cannot modify a Super Admin account.');
  if (target.role === 'ADMIN' && actor.role !== 'SUPER_ADMIN') {
    throw new Error('Only Super Admin can modify Admin accounts.');
  }

  all[idx] = { ...target, status, updatedAt: new Date().toISOString() };
  saveMockUsers(all);

  const actionLabel =
    status === 'SUSPENDED' ? `Suspended user ${target.email}` :
    status === 'BLOCKED'   ? `Blocked user ${target.email}` :
    status === 'ACTIVE'    ? `Reactivated user ${target.email}` :
                             `Set ${target.email} status to ${status}`;

  logAudit(actor.name, actor.email, reason ? `${actionLabel} — Reason: ${reason}` : actionLabel);
  return stripPassword(all[idx]);
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
