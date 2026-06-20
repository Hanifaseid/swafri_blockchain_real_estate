import type { UserAccount } from '@/features/users/types/user.types';

export const SESSION_KEYS = {
  ACTIVE_USER: 'vex_active_user',
  TOKEN: 'vex_token',
  USERS_DB: 'vex_users',
  AUDIT_LOGS: 'vex_audit_logs',
  PROPERTIES: 'vex_properties',
  PROPERTIES_VERSION: 'vex_properties_version',
  INQUIRIES: 'vex_inquiries',
  NOTIFICATIONS: 'vex_notifications',
  LISTER_CHATS: 'vex_lister_chats',
  FAVORITES: (userId: string) => `vex_favorites_user_${userId}`,
} as const;

export interface Session {
  token?: string;
}

function clearLegacyUserCache(): void {
  localStorage.removeItem('vex_session');
  localStorage.removeItem(SESSION_KEYS.ACTIVE_USER);
  localStorage.removeItem(SESSION_KEYS.AUDIT_LOGS);
}

export function setSession(userOrToken?: UserAccount | string, token?: string): void {
  if (typeof window === 'undefined') return;

  clearLegacyUserCache();

  const activeToken = typeof userOrToken === 'string'
    ? userOrToken
    : token ?? localStorage.getItem(SESSION_KEYS.TOKEN) ?? undefined;

  if (activeToken) {
    localStorage.setItem(SESSION_KEYS.TOKEN, activeToken);
  }
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;

  clearLegacyUserCache();

  const token = localStorage.getItem(SESSION_KEYS.TOKEN) ?? undefined;
  return token ? { token } : null;
}

export function getCurrentUser(): UserAccount | null {
  return null;
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  clearLegacyUserCache();
  localStorage.removeItem(SESSION_KEYS.TOKEN);
  console.log('Session cleared');
}

export function isAuthenticated(): boolean {
  return !!getSession()?.token;
}

export function updateSessionUser(_updated: Partial<UserAccount>): void {
  // User profile data is intentionally memory-only. Update Zustand/React Query instead.
}