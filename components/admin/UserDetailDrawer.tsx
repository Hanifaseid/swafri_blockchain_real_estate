'use client';

import { X, Mail, Phone, Calendar, Wallet } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import type { UserAccount } from '@/features/users/types/user.types';
import {
  ACCOUNT_STATUS_BADGE,
  KYC_STATUS_BADGE,
  WALLET_STATUS_BADGE,
  ROLE_BADGE,
} from '@/features/users/constants';

// ─── UserDetailDrawer ─────────────────────────────────────────────────────────
// Slide-over panel showing full user details including KYC + wallet status.

interface UserDetailDrawerProps {
  user: UserAccount | null;
  onClose: () => void;
}

export function UserDetailDrawer({ user, onClose }: UserDetailDrawerProps) {
  if (!user) return null;

  const statusBadge = ACCOUNT_STATUS_BADGE[user.status];
  const kycBadge = KYC_STATUS_BADGE[user.kycStatus];
  const walletBadge = WALLET_STATUS_BADGE[user.walletStatus];
  const roleBadge = ROLE_BADGE[user.role];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className="fixed inset-y-0 right-0 z-50 w-full max-w-sm flex flex-col shadow-2xl animate-fade-in"
        style={{
          background: 'var(--color-dash-sidebar)',
          borderLeft: '1px solid var(--color-dash-border)',
        }}
        aria-label="User details"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-dash-border)' }}
        >
          <h2 className="text-sm font-semibold text-white">User Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors p-1 rounded"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-6 space-y-6">
          {/* Profile summary */}
          <div className="flex items-center gap-4">
            <Avatar name={user.name} size="lg" />
            <div>
              <p className="text-base font-semibold text-white">{user.name}</p>
              <span className={cn(
                'text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md',
                roleBadge.color
              )}>
                {roleBadge.label}
              </span>
            </div>
          </div>

          {/* Contact info */}
          <div className="space-y-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-white/35">Contact</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-sm text-white/60">
                <Mail size={13} className="text-white/30 shrink-0" />
                <span className="font-mono truncate">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2.5 text-sm text-white/60">
                  <Phone size={13} className="text-white/30 shrink-0" />
                  <span className="font-mono">{user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-sm text-white/60">
                <Calendar size={13} className="text-white/30 shrink-0" />
                <span className="font-mono">
                  Joined {new Date(user.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Status cards */}
          <div className="space-y-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-white/35">Status</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Account', badge: statusBadge },
                { label: 'KYC', badge: kycBadge },
                { label: 'Wallet', badge: walletBadge },
              ].map(({ label, badge }) => (
                <div
                  key={label}
                  className="rounded-xl p-3 text-center"
                  style={{ background: 'var(--color-dash-card)', border: '1px solid var(--color-dash-border)' }}
                >
                  <p className="text-[9px] font-mono uppercase text-white/30 mb-1.5">{label}</p>
                  <span className={cn('text-[10px] font-mono font-semibold', badge.color)}>
                    {badge.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Wallet address */}
          {user.linkedWalletAddress && (
            <div className="space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/35">Wallet Address</p>
              <div
                className="flex items-start gap-2 p-3 rounded-xl"
                style={{ background: 'var(--color-dash-card)', border: '1px solid var(--color-dash-border)' }}
              >
                <Wallet size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[10px] font-mono text-white/50 break-all">
                  {user.linkedWalletAddress}
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
