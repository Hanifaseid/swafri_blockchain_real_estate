import type { UserAccount } from '@/features/users/types/user.types';

// ─── Storage Keys ─────────────────────────────────────────────────────────────
// All localStorage keys used by the auth system live here.
// No other file should hardcode these strings.

export const SESSION_KEYS = {
  ACTIVE_USER: 'vex_active_user',  // keeps backward compat with existing portal code
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

// ─── Session Shape ────────────────────────────────────────────────────────────
// Stored in localStorage as the active session.
// token is optional — will be populated when the real backend is connected.

export interface Session {
  user: UserAccount;
  token?: string;
}

// ─── Set Session ──────────────────────────────────────────────────────────────

export function setSession(user: UserAccount, token?: string): void {
  if (typeof window === 'undefined') return;
  
  // If no token is provided, try to preserve the existing one
  let activeToken = token;
  if (!activeToken) {
    const existing = getSession();
    if (existing?.token) {
      activeToken = existing.token;
    } else {
      activeToken = localStorage.getItem(SESSION_KEYS.TOKEN) || undefined;
    }
  }

  const session: Session = { user, token: activeToken };
  
  // Write under both keys so the existing portal/page.tsx still works
  localStorage.setItem(SESSION_KEYS.ACTIVE_USER, JSON.stringify(user));
  if (activeToken) {
    localStorage.setItem(SESSION_KEYS.TOKEN, activeToken);
  }
  // Full session object
  localStorage.setItem('vex_session', JSON.stringify(session));

  // Debug log
  console.log('Session set for user:', user.email, 'Role:', user.role);
  console.log('Token exists:', !!activeToken);
}

// ─── Get Session ──────────────────────────────────────────────────────────────

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;

  // Try the full session object first
  const raw = localStorage.getItem('vex_session');
  if (raw) {
    try {
      const session = JSON.parse(raw) as Session;
      // Debug log (remove in production)
      if (session?.user?.email) {
        console.log('Session loaded for user:', session.user.email, 'Role:', session.user.role);
        console.log('Token exists:', !!session.token);
        if (session.token) {
          console.log('Token preview:', session.token.substring(0, 20) + '...');
        }
      }
      return session;
    } catch {
      // fall through to legacy key
    }
  }

  // Fall back to legacy key used by existing portal code
  const legacyRaw = localStorage.getItem(SESSION_KEYS.ACTIVE_USER);
  if (legacyRaw) {
    try {
      const user = JSON.parse(legacyRaw) as UserAccount;
      // Try to get token from separate key
      const token = localStorage.getItem(SESSION_KEYS.TOKEN) || undefined;
      return { user, token };
    } catch {
      return null;
    }
  }

  return null;
}

// ─── Get Current User ─────────────────────────────────────────────────────────

export function getCurrentUser(): UserAccount | null {
  return getSession()?.user ?? null;
}

// ─── Clear Session ────────────────────────────────────────────────────────────

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('vex_session');
  localStorage.removeItem(SESSION_KEYS.ACTIVE_USER);
  localStorage.removeItem(SESSION_KEYS.TOKEN);
  console.log('Session cleared');
}

// ─── Is Authenticated ─────────────────────────────────────────────────────────

export function isAuthenticated(): boolean {
  const session = getSession();
  return session !== null && !!session.token;
}

// ─── Update Session User ──────────────────────────────────────────────────────
// Call this after a profile update so the session stays in sync.

export function updateSessionUser(updated: Partial<UserAccount>): void {
  const current = getCurrentUser();
  if (!current) return;
  const merged: UserAccount = { ...current, ...updated };
  setSession(merged, getSession()?.token);
}