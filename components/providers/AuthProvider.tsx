'use client';

import { useEffect } from 'react';
import { getCurrentUser } from '@/features/auth/services/auth.service';
import { clearSession } from '@/lib/auth/session';
import { useAuthStore } from '@/stores/auth.store';

const AUTH_CHANNEL = 'vex_auth';

function writeAuthCookies(isAuthed?: boolean): void {
  if (typeof document === 'undefined') return;
  if (isAuthed) {
    const maxAge = 60 * 60 * 24 * 7;
    document.cookie = `vex_authed=1; path=/; max-age=${maxAge}; SameSite=Lax`;
    return;
  }
  document.cookie = 'vex_authed=; path=/; max-age=0';
  document.cookie = 'vex_user_role=; path=/; max-age=0';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, clearUser, setLoading } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      setLoading(true);
      const user = await getCurrentUser();

      if (!mounted) return;

      if (user) {
        setUser(user);
        writeAuthCookies(true);
      } else {
        clearSession();
        clearUser();
        writeAuthCookies();
      }

      setLoading(false);
    }

    void hydrate();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'vex_token' || event.key === 'vex_refresh_token') {
        void hydrate();
      }
      if (event.key === 'vex_auth_event' && event.newValue) {
        void hydrate();
      }
    };

    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(AUTH_CHANNEL) : null;
    channel?.addEventListener('message', hydrate);
    window.addEventListener('storage', handleStorage);

    return () => {
      mounted = false;
      window.removeEventListener('storage', handleStorage);
      channel?.removeEventListener('message', hydrate);
      channel?.close();
    };
  }, [setUser, clearUser, setLoading]);

  return <>{children}</>;
}