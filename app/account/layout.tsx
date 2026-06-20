'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bookmark, ClipboardList, FileCheck2, Home, KeyRound, UserRound } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/session';
import { getDefaultRouteForRole, isAdminRole } from '@/lib/auth/routes';
import { useAuthStore } from '@/stores/auth.store';

const nav = [
  { href: '/account/profile', label: 'Profile', icon: UserRound },
  { href: '/account/kyc', label: 'KYC', icon: FileCheck2 },
  { href: '/account/saved', label: 'Saved', icon: Bookmark },
  { href: '/account/applications', label: 'Applications', icon: ClipboardList },
  { href: '/account/offers', label: 'Offers', icon: KeyRound },
  { href: '/account/leases', label: 'Leases', icon: FileCheck2 },
  { href: '/account/listings', label: 'Listings', icon: Home },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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
    <main className="min-h-screen bg-[#f4f0e8] text-[#17251d]">
      <header className="border-b border-[#d9cebb] bg-[#f9f6ef] px-4 py-4 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href="/properties" className="font-display text-2xl font-semibold text-[#163c2c]">
              TerraChain
            </Link>
            <p className="mt-1 text-sm text-[#5f6b61]">
              {currentUser.role === 'PROPERTY_OWNER'
                ? 'Manage listings, documents, leads, and lease activity.'
                : 'Track saved searches, offers, rental applications, and leases.'}
            </p>
          </div>
          <Link
            href="/properties"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#d5c8b3] bg-white px-4 text-sm font-medium text-[#294034] hover:bg-[#fffaf0]"
          >
            Browse marketplace
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-6">
        <nav className="flex gap-2 overflow-x-auto lg:block lg:space-y-2">
          {nav
            .filter((item) => currentUser.role === 'PROPERTY_OWNER' || item.href !== '/account/listings')
            .map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-medium ${
                    active
                      ? 'border-[#1e5a3d] bg-[#163c2c] text-[#f4d38b]'
                      : 'border-[#d5c8b3] bg-white text-[#294034] hover:bg-[#fffaf0]'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
        </nav>
        <section className="min-w-0">{children}</section>
      </div>
    </main>
  );
}
