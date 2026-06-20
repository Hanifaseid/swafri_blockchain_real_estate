'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Bookmark,
  Building2,
  ChevronDown,
  ClipboardList,
  Compass,
  FileCheck2,
  FileClock,
  Heart,
  KeyRound,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Plus,
  Shield,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';
import { clearSession } from '@/lib/auth/session';
import { useAuthStore } from '@/stores/auth.store';
import { WalletConnectButton } from '@/components/ui/WalletConnectButton';

// ─── Navigation items ─────────────────────────────────────────────────────────
// Top-level nav: visible to everyone. Mix of page links and in-page scroll targets.

type NavLinkItem = { label: string; href: string };
type NavScrollItem = { label: string; id: string };
type NavItem = NavLinkItem | NavScrollItem;

const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Browse', href: '/properties' },
  { label: 'Listings', href: '/listings' },
  { label: 'List Property', href: '/account/listings/new' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

export default function LandingNavbar() {
  const { currentUser, clearUser } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const body = document.body;
      const y = body.scrollTop || doc.scrollTop || window.scrollY || 0;
      const scrollHeight = Math.max(body.scrollHeight, doc.scrollHeight);
      const max = scrollHeight - window.innerHeight;
      setScrolled(y > 12);
      setProgress(max > 0 ? Math.min(1, y / max) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    return () => window.removeEventListener('scroll', onScroll, { capture: true });
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const closeMenus = useCallback(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, []);

  const scrollTo = useCallback(
    (id: string) => {
      closeMenus();
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = `/#${id}`;
      }
    },
    [closeMenus],
  );

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN';
  const isOwner = currentUser?.role === 'PROPERTY_OWNER';
  const isTenant = currentUser?.role === 'TENANT';

  // ── Account dropdown links (role-specific) ──────────────────────────────────
  const accountLinks = useMemo(() => {
    if (!currentUser) return [];

    // Admin / Super Admin → full admin dashboard
    if (isAdmin) {
      return [
        { href: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
        { href: '/admin/users', label: 'Manage Users', icon: UserRound },
        { href: '/admin/kyc', label: 'KYC Review', icon: BadgeCheck },
        { href: '/admin/compliance', label: 'Compliance', icon: Shield },
        { href: '/admin/transactions', label: 'Transactions', icon: KeyRound },
        { href: '/admin/profile', label: 'Profile', icon: UserRound },
      ];
    }

    // Property Owner → marketplace-first, account section for management
    if (isOwner) {
      return [
        { href: '/properties', label: 'Browse Properties', icon: Compass },
        { href: '/account/listings', label: 'My Listings', icon: Building2 },
        { href: '/account/listings/new', label: 'List a Property', icon: Plus },
        { href: '/account/applications', label: 'Applications', icon: ClipboardList },
        { href: '/account/offers', label: 'Offers', icon: MessageSquare },
        { href: '/account/leases', label: 'Leases', icon: FileClock },
        { href: '/account/kyc', label: 'KYC & Wallet', icon: FileCheck2 },
        { href: '/account/profile', label: 'Profile', icon: UserRound },
      ];
    }

    // Tenant → marketplace-first, account section for saved/applications
    return [
      { href: '/properties', label: 'Browse Properties', icon: Compass },
      { href: '/account/saved', label: 'Saved Searches', icon: Heart },
      { href: '/account/applications', label: 'My Applications', icon: ClipboardList },
      { href: '/account/offers', label: 'My Offers', icon: MessageSquare },
      { href: '/account/leases', label: 'My Leases', icon: FileClock },
      { href: '/account/kyc', label: 'KYC & Wallet', icon: FileCheck2 },
      { href: '/account/profile', label: 'Profile', icon: UserRound },
    ];
  }, [currentUser, isAdmin, isOwner]);

  const handleSignOut = () => {
    clearSession();
    clearUser();
    document.cookie = 'vex_authed=; path=/; max-age=0';
    document.cookie = 'vex_user_role=; path=/; max-age=0';
    window.location.href = '/';
  };

  // ── Primary CTA button logic ────────────────────────────────────────────────
  // Unauthenticated → Get Started (login)
  // Admin → Dashboard link
  // Owner → List Property link
  // Tenant → no link CTA (shows WalletConnectButton instead)
  const primaryAction = !currentUser
    ? { href: '/auth/login', label: 'Get Started', icon: ArrowRight }
    : isAdmin
      ? { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard }
      : isOwner
        ? { href: '/account/listings/new', label: 'List Property', icon: Plus }
        : null;
  const PrimaryIcon = primaryAction?.icon ?? null;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className="absolute inset-x-0 top-0 h-0.5 origin-left bg-linear-to-r from-amber-400 to-amber-600"
        style={{ transform: `scaleX(${progress})`, transition: 'transform 0.1s linear' }}
        aria-hidden
      />

      <div
        className={[
          'flex items-center justify-between gap-4 px-5 transition-all duration-300 md:px-12 lg:px-16',
          scrolled
            ? 'border-b border-white/10 bg-black py-3 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.7)]'
            : 'border-b border-transparent bg-black/15 py-5 backdrop-blur-[2px]',
        ].join(' ')}
      >
        <Link href="/" className="group flex select-none items-center gap-3" aria-label="TerraChain home">
          <span className="relative grid h-9 w-9 place-items-center rounded-[8px] bg-linear-to-br from-amber-300 to-amber-600 font-display text-lg font-semibold leading-none text-emerald-950 shadow-[0_2px_10px_-2px_rgba(189,139,39,0.6)] transition-transform group-hover:scale-105">
            V
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl font-semibold tracking-tight text-white">VEX</span>
            <span className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.28em] text-amber-300/80">
              Property Register
            </span>
          </span>
        </Link>

        {/* ── Desktop nav links ────────────────────────────────────────────── */}
        <nav className="hidden items-center gap-8 text-sm md:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) =>
            'href' in item ? (
              <Link
                key={item.label}
                href={item.href}
                className="relative font-medium text-white/72 transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-amber-400 after:transition-all after:duration-300 hover:text-white hover:after:w-full"
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="relative cursor-pointer font-medium text-white/72 transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-amber-400 after:transition-all after:duration-300 hover:text-white hover:after:w-full"
              >
                {item.label}
              </button>
            ),
          )}
        </nav>

        {/* ── Right side: CTA + profile ────────────────────────────────────── */}
        <div className="flex items-center gap-2">

          {/* CTA: link for unauthenticated / admin / owner — wallet for tenant */}
          {primaryAction && PrimaryIcon ? (
            <Link
              href={primaryAction.href}
              className="group hidden items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-emerald-950 shadow-[0_2px_10px_-2px_rgba(189,139,39,0.6)] transition-colors hover:bg-amber-400 sm:inline-flex"
            >
              {primaryAction.label}
              <PrimaryIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : currentUser ? (
            <div className="hidden sm:block">
              <WalletConnectButton
                className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-emerald-950 shadow-[0_2px_10px_-2px_rgba(189,139,39,0.6)] hover:bg-amber-400"
              />
            </div>
          ) : null}

          {/* ── Profile dropdown (desktop) ─────────────────────────────────── */}
          {currentUser && (
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setProfileOpen((value) => !value)}
                className="flex h-10 items-center gap-2 rounded-lg border border-white/15 bg-white/5 pl-2 pr-3 text-white transition-colors hover:bg-white/10"
                aria-expanded={profileOpen}
              >
                <span className="grid h-7 w-7 place-items-center rounded-md bg-white text-xs font-semibold text-emerald-950">
                  {(currentUser.name || currentUser.email || 'U').slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden max-w-[120px] truncate text-sm font-medium lg:inline">
                  {currentUser.name || currentUser.email}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-xl border border-white/10 bg-[#11100d]/95 shadow-2xl backdrop-blur">
                  <div className="border-b border-white/10 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-white">{currentUser.name}</p>
                    <p className="truncate text-xs text-white/45">{currentUser.email}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-amber-300/70">
                      {currentUser.role?.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="p-2">
                    {accountLinks.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeMenus}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/75 transition-colors hover:bg-white/8 hover:text-white"
                        >
                          <Icon className="h-4 w-4 text-amber-300/80" />
                          {item.label}
                        </Link>
                      );
                    })}
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="mt-1 flex w-full items-center gap-2.5 rounded-lg border-t border-white/10 px-3 py-2 pt-3 text-left text-sm text-white/65 transition-colors hover:text-white"
                    >
                      <LogOut className="h-4 w-4 text-white/45" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Mobile hamburger ────────────────────────────────────────────── */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10 md:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ────────────────────────────────────────────────────── */}
      <div
        className={[
          'overflow-hidden border-b border-white/10 bg-black transition-[max-height,opacity] duration-300 ease-out md:hidden',
          mobileOpen ? 'max-h-[90vh] opacity-100' : 'max-h-0 opacity-0',
        ].join(' ')}
      >
        <nav className="flex flex-col px-5 py-4" aria-label="Mobile">
          {NAV_ITEMS.map((item, i) =>
            'href' in item ? (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMenus}
                className="flex items-center justify-between border-b border-white/5 py-3.5 text-left font-display text-lg text-white/85 transition-colors hover:text-white"
              >
                <span>{item.label}</span>
                <span className="font-mono text-[11px] text-amber-300/60">0{i + 1}</span>
              </Link>
            ) : (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="flex items-center justify-between border-b border-white/5 py-3.5 text-left font-display text-lg text-white/85 transition-colors hover:text-white"
              >
                <span>{item.label}</span>
                <span className="font-mono text-[11px] text-amber-300/60">0{i + 1}</span>
              </button>
            ),
          )}

          <div className="mt-4 flex flex-col gap-2.5">
            {primaryAction && PrimaryIcon ? (
              <Link
                href={primaryAction.href}
                onClick={closeMenus}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-semibold text-emerald-950"
              >
                {primaryAction.label} <PrimaryIcon className="h-4 w-4" />
              </Link>
            ) : currentUser ? (
              <WalletConnectButton
                className="rounded-xl bg-amber-500 py-3 text-sm font-semibold text-emerald-950 justify-center"
              />
            ) : null}

          </div>

          {currentUser && (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-2">
              <div className="px-3 py-2">
                <p className="truncate text-sm font-semibold text-white">{currentUser.name}</p>
                <p className="truncate text-xs text-white/45">{currentUser.email}</p>
              </div>
              {accountLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/75 transition-colors hover:bg-white/8 hover:text-white"
                  >
                    <Icon className="h-4 w-4 text-amber-300/80" />
                    {item.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-white/65 transition-colors hover:text-white"
              >
                <LogOut className="h-4 w-4 text-white/45" />
                Sign out
              </button>
            </div>
          )}

          <div className="mt-4 flex items-center justify-center gap-2 py-2 font-mono text-[10px] uppercase tracking-widest text-white/35">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Every listing title-verified
          </div>
        </nav>
      </div>
    </header>
  );
}
