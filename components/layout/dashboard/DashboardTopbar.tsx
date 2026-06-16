'use client';

import { useState } from 'react';
import { Menu, Bell, LogOut, User } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import { ROLE_LABELS } from '@/features/roles/types/role.types';
import type { UserAccount } from '@/features/users/types/user.types';

// ─── DashboardTopbar ──────────────────────────────────────────────────────────
// Top bar for the dashboard layout.
// Dark design — matches the sidebar and dashboard background.

interface DashboardTopbarProps {
  user: UserAccount;
  pageTitle?: string;
  onMenuClick: () => void;
  onSignOut: () => void;
  className?: string;
}

export function DashboardTopbar({
  user,
  pageTitle,
  onMenuClick,
  onSignOut,
  className,
}: DashboardTopbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Role color for badge
  const roleColorMap: Record<string, string> = {
    SUPER_ADMIN: 'text-amber-400',
    ADMIN:       'text-blue-400',
    PROPERTY_OWNER: 'text-purple-400',
    TENANT:      'text-emerald-400',
  };

  return (
    <header
      className={cn('flex items-center justify-between px-5 py-0', className)}
      style={{
        height: 'var(--topbar-height)',
        background: 'var(--color-dash-topbar)',
        borderBottom: '1px solid var(--color-dash-border)',
      }}
    >
      {/* Left — hamburger (mobile) + page title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden text-black/40 hover:text-black transition-colors p-1.5 rounded-lg hover:bg-black/5"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>
        {pageTitle && (
          <h1 className="text-sm font-medium text-black/70 hidden sm:block">
            {pageTitle}
          </h1>
        )}
      </div>

      {/* Right — notifications + user menu */}
      <div className="flex items-center gap-2">
        {/* Notifications bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative text-black/50 hover:text-black transition-colors p-2 rounded-lg hover:bg-black/5"
        >
          <Bell size={16} />
          {/* Unread dot — hardcoded for now, wired to notification system later */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu((v) => !v)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-black/5 transition-colors"
            aria-expanded={showUserMenu}
            aria-haspopup="true"
          >
            <Avatar src={user.profileImage} name={user.name} size="sm" />
            <div className="hidden md:block text-left">
              <p className="text-xs font-medium text-black leading-tight">
                {user.name.split(' ')[0]}
              </p>
              <p className={cn('text-[9px] font-mono uppercase tracking-wider leading-tight text-green', roleColorMap[user.role])}>
                {ROLE_LABELS[user.role]}
              </p>
            </div>
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
                aria-hidden="true"
              />
              <div
                className="absolute right-0 top-full mt-1 w-52 rounded-xl border p-1 z-20 shadow-2xl animate-fade-in"
                style={{
                  background: 'var(--color-dash-card)',
                  borderColor: 'var(--color-dash-border)',
                }}
              >
                {/* User info */}
                <div className="px-3 py-2.5 mb-1" style={{ borderBottom: '1px solid var(--color-dash-border)' }}>
                  <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-white/40 font-mono truncate">{user.email}</p>
                </div>

                {/* Profile link */}
                <a
                  href="/dashboard/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/60 hover:text-black hover:bg-black/5 transition-colors"
                >
                  <User size={14} />
                  Profile
                </a>

                {/* Sign out */}
                <button
                  type="button"
                  onClick={() => { setShowUserMenu(false); onSignOut(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/40 hover:text-red-400 hover:bg-red-950/20 transition-colors"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
