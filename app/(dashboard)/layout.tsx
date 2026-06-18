'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, clearSession } from '@/lib/auth/session';
import { useAuthStore } from '@/stores/auth.store';
import { DashboardSidebar } from '@/components/layout/dashboard/DashboardSidebar';
import { DashboardTopbar } from '@/components/layout/dashboard/DashboardTopbar';
import { getNavItems } from '@/config/dashboard-nav.config';

// ─── Dashboard Layout ─────────────────────────────────────────────────────────
// Wraps all /dashboard/* routes.
// Handles:
//   - Auth guard (redirect to /login if no session)
//   - Zustand store hydration
//   - Sidebar + Topbar shell with mobile toggle
//   - Sign out

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, setUser, setLoading } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    setUser(user);
    setLoading(false);
    setMounted(true);
  }, [router, setUser, setLoading]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleSignOut = () => {
    clearSession();
    // Clear auth cookies so proxy.ts stops treating user as authenticated
    document.cookie = 'vex_authed=; path=/; max-age=0';
    document.cookie = 'vex_user_role=; path=/; max-age=0';
    window.location.href = '/login';
  };

  const getPageTitle = (): string => {
    if (!currentUser) return '';
    const items = getNavItems(currentUser.role);
    const match = items.find(
      (item) => {
        const cleanHref = item.href.split('?')[0];
        return pathname === cleanHref || (cleanHref !== '/dashboard' && pathname.startsWith(cleanHref + '/'));
      }
    );
    return match?.label ?? 'Dashboard';
  };

  // Show minimal spinner while resolving session
  if (!mounted || !currentUser) {
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
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--color-dash-bg)' }}
    >
      {/* Sidebar */}
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

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <DashboardTopbar
          user={currentUser}
          pageTitle={getPageTitle()}
          onMenuClick={() => setMobileOpen((v) => !v)}
          onSignOut={handleSignOut}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
