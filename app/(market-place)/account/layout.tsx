'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { getDefaultRouteForRole, isAdminRole } from '@/lib/auth/routes';
import { useAuthStore } from '@/stores/auth.store';

// ─── Account layout ──────────────────────────────────────────────────────────
// Nested inside (market-place) layout which provides LandingNavbar + Footer.
// This layout only handles auth guard + content card styling.

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { currentUser, setUser, setLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const user = getCurrentUser();
      if (!user) {
        router.replace('/auth/login');
        return;
      }
      if (isAdminRole(user.role)) {
        router.replace(getDefaultRouteForRole(user.role));
        return;
      }
      setUser(user);
      setLoading(false);
      setMounted(true);
    });
  }, [router, setLoading, setUser]);

  if (!mounted || !currentUser || isAdminRole(currentUser.role)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 lg:px-6">
      <section className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm backdrop-blur md:p-7">
        {children}
      </section>
    </div>
  );
}
