'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, clearSession } from '@/lib/auth/session';
import { useAuthStore } from '@/stores/auth.store';
import { DashboardSidebar } from '@/components/layout/dashboard/DashboardSidebar';
import { DashboardTopbar } from '@/components/layout/dashboard/DashboardTopbar';
import { getNavItems } from '@/config/dashboard-nav.config';
import { getDefaultRouteForRole, isAdminRole, isAdminShellPath } from '@/lib/auth/routes';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, setUser, setLoading } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isPublicMarketplace =
    pathname === '/properties' || pathname.startsWith('/properties/');

  useEffect(() => {
    // Defer all state updates out of the synchronous effect body
    const init = () => {
      const user = getCurrentUser();
      if (!user) {
        if (isPublicMarketplace) {
          setLoading(false);
          setMounted(true);
          return;
        }
        router.replace('/login');
        return;
      }
      if (isAdminShellPath(pathname) && !isAdminRole(user.role)) {
        router.replace(getDefaultRouteForRole(user.role));
        return;
      }
      setUser(user);
      setLoading(false);
      setMounted(true);
    };

    // queueMicrotask pushes updates after the current render cycle,
    // breaking the synchronous setState-in-effect chain
    queueMicrotask(init);
  }, [isPublicMarketplace, pathname, router, setUser, setLoading]);

 useEffect(() => {
  queueMicrotask(() => setMobileOpen(false));
}, [pathname]);

  const handleSignOut = () => {
    clearSession();
    document.cookie = 'vex_authed=; path=/; max-age=0';
    document.cookie = 'vex_user_role=; path=/; max-age=0';
    window.location.href = '/login';
  };

  const getPageTitle = (): string => {
    if (!currentUser) return '';
    const items = getNavItems(currentUser.role);
    const match = items.find((item) => {
      const cleanHref = item.href.split('?')[0];
      return (
        pathname === cleanHref ||
        (cleanHref !== '/dashboard' && pathname.startsWith(cleanHref + '/'))
      );
    });
    return match?.label ?? 'Dashboard';
  };

  if (isPublicMarketplace && (!currentUser || !isAdminShellPath(pathname))) {
    return <>{children}</>;
  }

  if (!mounted || !currentUser || !isAdminRole(currentUser.role)) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--color-dash-bg)' }}
      >
        <div className="w-6 h-6 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-dash-bg)' }}>
      <DashboardSidebar
        role={currentUser.role}
        user={{
          name: currentUser.name,
          email: currentUser.email,
          avatarUrl: currentUser.profileImage,
        }}
        onSignOut={handleSignOut}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DashboardTopbar
          user={currentUser}
          pageTitle={getPageTitle()}
          onMenuClick={() => setMobileOpen((v) => !v)}
          onSignOut={handleSignOut}
        />
        <main className="flex-1 overflow-y-auto scrollbar-thin">{children}</main>
      </div>
    </div>
  );
}
