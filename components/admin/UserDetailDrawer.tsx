'use client';

import { X, Mail, Phone, Calendar, Wallet, User, Shield, CreditCard, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
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

  // Helper to get status icon - now accepts string | undefined
  const getStatusIcon = (status: string | undefined) => {
    if (!status) return null;
    const upperStatus = status.toUpperCase();
    if (upperStatus === 'ACTIVE' || upperStatus === 'VERIFIED' || upperStatus === 'APPROVED') {
      return <CheckCircle2 size={12} className="text-emerald-400" />;
    } else if (upperStatus === 'PENDING' || upperStatus === 'VERIFICATION_PENDING') {
      return <Clock size={12} className="text-amber-400" />;
    } else if (upperStatus === 'REJECTED' || upperStatus === 'FAILED') {
      return <AlertCircle size={12} className="text-red-400" />;
    }
    return null;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className="fixed inset-y-0 right-0 z-50 w-full max-w-sm flex flex-col shadow-2xl animate-slide-in-right"
        style={{
          background: 'linear-gradient(145deg, #0f172a, #1e293b)',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
        }}
        aria-label="User details"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-emerald-500/10 rounded-lg">
              <User size={16} className="text-emerald-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">User Details</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white hover:bg-white/10 transition-all p-2 rounded-lg"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6 space-y-6">
          {/* Profile summary */}
          <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Avatar name={user.name} size="lg" />
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-white truncate">{user.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  'text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full',
                  roleBadge?.color || 'bg-gray-500 text-white'
                )}>
                  {roleBadge?.label || user.role}
                </span>
                {getStatusIcon(user.status)}
              </div>
            </div>
          </div>

          {/* Contact info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.06))' }} />
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/30">Contact Information</p>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, rgba(255,255,255,0), rgba(255,255,255,0.06))' }} />
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                  <Mail size={14} className="text-emerald-400" />
                </div>
                <span className="text-sm text-gray-300 font-mono truncate">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                    <Phone size={14} className="text-emerald-400" />
                  </div>
                  <span className="text-sm text-gray-300 font-mono">{user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                  <Calendar size={14} className="text-emerald-400" />
                </div>
                <span className="text-sm text-gray-300 font-mono">
                  Joined {new Date(user.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Status cards */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.06))' }} />
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/30">Account Status</p>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, rgba(255,255,255,0), rgba(255,255,255,0.06))' }} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Account', badge: statusBadge, icon: Shield },
                { label: 'KYC', badge: kycBadge, icon: Shield },
                { label: 'Wallet', badge: walletBadge, icon: CreditCard },
              ].map(({ label, badge, icon: Icon }) => {
                // Safely get the label with fallback
                const badgeLabel = badge?.label || 'Unknown';
                const badgeColor = badge?.color || 'text-gray-400';
                
                return (
                  <div
                    key={label}
                    className="rounded-xl p-4 text-center transition-all hover:scale-[1.02]"
                    style={{ 
                      background: 'rgba(255,255,255,0.03)', 
                      border: '1px solid rgba(255,255,255,0.06)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div className="flex justify-center mb-2">
                      <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                        <Icon size={12} className="text-emerald-400" />
                      </div>
                    </div>
                    <p className="text-[9px] font-mono uppercase text-white/30 mb-1.5 tracking-wider">{label}</p>
                    <div className="flex items-center justify-center gap-1.5">
                      {getStatusIcon(badgeLabel)}
                      <span className={cn('text-[10px] font-mono font-semibold', badgeColor)}>
                        {badgeLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wallet address */}
          {user.linkedWalletAddress && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.06))' }} />
                <p className="text-[10px] font-mono uppercase tracking-widest text-white/30">Wallet Address</p>
                <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, rgba(255,255,255,0), rgba(255,255,255,0.06))' }} />
              </div>
              <div
                className="flex items-start gap-3 p-4 rounded-xl transition-all hover:bg-white/5"
                style={{ 
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div className="p-1.5 bg-emerald-500/10 rounded-lg shrink-0 mt-0.5">
                  <Wallet size={14} className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-mono text-gray-400 break-all">
                    {user.linkedWalletAddress}
                  </p>
                  <button 
                    onClick={() => user.linkedWalletAddress && navigator.clipboard?.writeText(user.linkedWalletAddress)}
                    className="text-[9px] font-mono text-emerald-400/60 hover:text-emerald-400 transition-colors mt-1"
                  >
                    Copy address
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* User ID */}
          <div className="pt-4 border-t border-white/5">
            <p className="text-[9px] font-mono text-white/20 text-center">
              User ID: {user.id}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}