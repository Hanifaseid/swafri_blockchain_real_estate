'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LandingNavbar from '@/components/landing/LandingNavbar';
import { getCurrentUser } from '@/lib/auth/session';
import { getDefaultRouteForRole, isAdminRole } from '@/lib/auth/routes';
import { useAuthStore } from '@/stores/auth.store';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { currentUser, setUser, setLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const user = getCurrentUser();
      if (!user) {
        router.replace('/login');
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
      <div className="flex min-h-screen items-center justify-center bg-[#f4f0e8]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1e5a3d] border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050504] text-white">
      <LandingNavbar />
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-28 lg:px-6">
        <section className="min-w-0 rounded-2xl border border-white/10 bg-[#11100d]/92 p-5 shadow-2xl md:p-7">
          {children}
        </section>
      </div>
    </main>
  );
}
