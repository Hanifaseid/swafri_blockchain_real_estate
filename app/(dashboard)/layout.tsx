'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { useAuthStore } from '@/stores/auth.store';

// Dashboard layout — wraps all protected routes.
// Reads session on mount, sets Zustand store, redirects if not logged in.
// DashboardSidebar + DashboardTopbar are added in Step 9.

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    setUser(user);
    setLoading(false);
  }, [router, setUser, setLoading]);

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: 'var(--color-dash-bg)' }}
    >
      {/* Sidebar + Topbar shell added in Step 9 */}
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
}
