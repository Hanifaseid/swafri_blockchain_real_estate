'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  KeyRound,
  Lock,
  History,
  Settings,
  BadgeCheck,
  Building2,
  Compass,
  Heart,
  MessageSquare,
  ArrowRightLeft,
  User,
  LogOut,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { getNavItems } from '@/config/dashboard-nav.config';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site.config';
import type { UserRole } from '@/types';

// ─── Icon resolver ────────────────────────────────────────────────────────────
// dashboard-nav.config.ts stores icon names as strings.
// This map resolves them to actual Lucide components.

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  ShieldCheck,
  KeyRound,
  Lock,
  History,
  Settings,
  BadgeCheck,
  Building2,
  Compass,
  Heart,
  MessageSquare,
  ArrowRightLeft,
  User,
};

function NavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? LayoutDashboard;
  return <Icon size={16} aria-hidden="true" className={className} />;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DashboardSidebarProps {
  role: UserRole;
  user: { name: string; email: string; avatarUrl?: string };
  onSignOut: () => void;
  mobileOpen?: boolean;
  onClose?: () => void;
}

// ─── DashboardSidebar ─────────────────────────────────────────────────────────

export function DashboardSidebar({
  role,
  user,
  onSignOut,
  mobileOpen = false,
  onClose,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const navItems = getNavItems(role);

  const SidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--color-dash-border)' }}>
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 select-none"
          aria-label={`${siteConfig.name} dashboard`}
        >
          <div className="bg-green-600 text-white w-9 h-9 rounded flex items-center justify-center font-black text-xl shadow">
            V
          </div>
          <span className="text-sm font-semibold text-white tracking-tight">
            {siteConfig.shortName}
          </span>
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden text-white/40 hover:text-white transition-colors p-1 rounded"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Role badge */}
      <div className="px-5 py-3">
        <span className={cn(
          'text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-md',
          role === 'SUPER_ADMIN' && 'bg-amber-950/40 text-amber-400',
          role === 'ADMIN' && 'bg-blue-950/40 text-blue-400',
          role === 'PROPERTY_OWNER' && 'bg-purple-950/40 text-purple-400',
          role === 'TENANT' && 'bg-emerald-950/40 text-emerald-400',
        )}>
          {role.replace('_', ' ')}
        </span>
      </div>

      {/* Nav items */}
      <nav
        className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin"
        aria-label="Dashboard navigation"
      >
        <ul className="flex flex-col gap-0.5" role="list">
          {navItems.map((item) => {
            // Split item href into path and query parts
            const questionIdx = item.href.indexOf('?');
            const itemPath  = questionIdx >= 0 ? item.href.slice(0, questionIdx) : item.href;
            const itemQuery = questionIdx >= 0 ? item.href.slice(questionIdx + 1) : '';

            // Next.js usePathname() never includes query string
            // We need to detect if ANY sibling nav item "owns" the current query
            // to prevent a no-query item (e.g. /users) from being active when
            // the user is on /users?role=ADMIN (owned by another item)
            const currentPathOwnsQuery = navItems.some((other) => {
              if (other.href === item.href) return false;
              const otherQ = other.href.includes('?') ? other.href.slice(other.href.indexOf('?') + 1) : '';
              if (!otherQ) return false;
              const otherPath = other.href.slice(0, other.href.indexOf('?'));
              // Only relevant when we're currently on that same path
              return otherPath === pathname;
            });

            const isActive =
              // Item has a query string — active only when URL also carries that exact query
              // (Since usePathname strips query, we check sessionStorage/URL for the query part)
              (!!itemQuery && pathname === itemPath && typeof window !== 'undefined' && window.location.search === `?${itemQuery}`) ||
              // Item has NO query — exact path match, BUT not if another sibling item owns this path with a query
              (!itemQuery && pathname === itemPath && !currentPathOwnsQuery) ||
              // Item has NO query — sub-path match for nested routes like /users/123
              (!itemQuery && item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));

            return (
              <li key={item.href + item.label}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'nav-item',
                    isActive && 'active'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <NavIcon
                    name={item.icon}
                    className={isActive ? 'text-amber-300' : 'text-white/30'}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid var(--color-dash-border)' }}>
        <div className="flex items-center gap-3 px-2 mb-3">
          <Avatar src={user.avatarUrl} name={user.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">{user.name}</p>
            <p className="truncate text-[10px] text-white/35 font-mono">{user.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="nav-item w-full text-white/40 hover:text-red-400 hover:bg-red-950/20"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex lg:flex-col shrink-0 h-screen sticky top-0 scrollbar-none"
        style={{
          width: 'var(--sidebar-width)',
          background: 'var(--color-dash-sidebar)',
          borderRight: '1px solid var(--color-dash-border)',
        }}
        aria-label="Sidebar"
      >
        {SidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside
            className="fixed inset-y-0 left-0 z-50 flex flex-col lg:hidden"
            style={{
              width: 'var(--sidebar-width)',
              background: 'var(--color-dash-sidebar)',
              borderRight: '1px solid var(--color-dash-border)',
            }}
            aria-label="Sidebar"
          >
            {SidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
