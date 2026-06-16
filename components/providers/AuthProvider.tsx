'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { getCurrentUser } from '@/lib/auth/session';
import { initSeedUsers } from '@/features/auth/utils/seed';

// ─── AuthProvider ─────────────────────────────────────────────────────────────
// Runs once on app mount:
//   1. Seeds localStorage with default users if not already done
//   2. Reads the active session from localStorage
//   3. Hydrates the Zustand auth store
//   4. Sets two cookies that proxy.ts reads for server-side route protection:
//        vex_authed     = '1'         (is the user logged in?)
//        vex_user_role  = 'TENANT'    (what is their role?)
//
// These cookies contain no sensitive data — just the role string.
// They let proxy.ts redirect unauthenticated or wrong-role users
// without reading localStorage (which is client-only).

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, clearUser, setLoading } = useAuthStore();

  useEffect(() => {
    // Init seed users on first load (no-op if already seeded)
    initSeedUsers();

    const user = getCurrentUser();

    if (user) {
      setUser(user);

      // Mirror session into cookies for proxy.ts
      const maxAge = 60 * 60 * 24 * 7; // 7 days
      document.cookie = `vex_authed=1; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `vex_user_role=${user.role}; path=/; max-age=${maxAge}; SameSite=Lax`;
    } else {
      clearUser();

      // Clear auth cookies
      document.cookie = 'vex_authed=; path=/; max-age=0';
      document.cookie = 'vex_user_role=; path=/; max-age=0';
    }

    setLoading(false);
  }, [setUser, clearUser, setLoading]);

  return <>{children}</>;
}
