'use client';

import {
  X, Mail, Phone, Calendar, Wallet, User, Shield, CreditCard,
  CheckCircle2, AlertCircle, Clock, Link2, WalletMinimal,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import type { UserAccount } from '@/features/users/types/user.types';
import { useRevokeUserWallet } from '@/features/users/queries/users.queries';
import { useAuthStore } from '@/stores/auth.store';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';

// ─── UserDetailDrawer ─────────────────────────────────────────────────────────
// Slide-over panel — light admin surface (no dark glass).

interface UserDetailDrawerProps {
  user: UserAccount | null;
  onClose: () => void;
}

export function UserDetailDrawer({ user, onClose }: UserDetailDrawerProps) {
  if (!user) return null;

  const { currentUser } = useAuthStore();
  const { mutate: revokeWallet, isPending: revoking } = useRevokeUserWallet();

  const canRevokeWallet =
    (currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') &&
    (user.walletStatus === 'LINKED' || user.walletStatus === 'VERIFIED') &&
    user.role !== 'SUPER_ADMIN' &&
    user.role !== 'ADMIN';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer — light surface */}
      <aside
        className="fixed inset-y-0 right-0 z-50 w-full max-w-sm flex flex-col bg-white border-l border-gray-200 shadow-xl"
        aria-label="User details"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <User size={14} className="text-emerald-600" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">User Details</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all p-1.5 rounded-lg"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Profile summary */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
            <Avatar name={user.name} size="lg" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <StatusBadge status={user.role} />
                <StatusBadge status={user.status} />
              </div>
            </div>
          </div>

          {/* Contact info */}
          <Section label="Contact">
            <InfoRow icon={Mail}>
              <span className="text-sm text-gray-700 font-mono truncate">{user.email}</span>
            </InfoRow>
            {user.phone && (
              <InfoRow icon={Phone}>
                <span className="text-sm text-gray-700">{user.phone}</span>
              </InfoRow>
            )}
            <InfoRow icon={Calendar}>
              <span className="text-sm text-gray-500">
                Joined {new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </InfoRow>
          </Section>

          {/* Status grid */}
          <Section label="Status">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Account', status: user.status },
                { label: 'KYC', status: user.kycStatus },
                { label: 'Wallet', status: user.walletStatus },
              ].map(({ label, status }) => (
                <div key={label} className="rounded-lg border border-gray-200 bg-white p-3 text-center">
                  <p className="text-[9px] font-mono uppercase text-gray-400 mb-2">{label}</p>
                  <StatusBadge status={status} className="text-[9px] px-1.5 py-0.5" />
                </div>
              ))}
            </div>
          </Section>

          {/* Wallet address */}
          {user.linkedWalletAddress && (
            <Section label="Wallet Address">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Wallet size={13} className="text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-mono text-gray-600 break-all leading-relaxed">
                      {user.linkedWalletAddress}
                    </p>
                    <button
                      onClick={() => navigator.clipboard?.writeText(user.linkedWalletAddress!)}
                      className="text-[10px] font-medium text-emerald-600 hover:text-emerald-700 transition-colors mt-1.5 flex items-center gap-1"
                    >
                      <Link2 size={10} />
                      Copy address
                    </button>
                    {canRevokeWallet && (
                      <button
                        type="button"
                        onClick={() => revokeWallet({ userId: user.id })}
                        disabled={revoking}
                        className="text-[10px] font-medium text-red-500 hover:text-red-600 transition-colors mt-1 flex items-center gap-1 disabled:opacity-40"
                      >
                        <WalletMinimal size={10} />
                        {revoking ? 'Revoking…' : 'Revoke wallet'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Section>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-[9px] font-mono text-gray-400 text-center">ID: {user.id}</p>
        </div>
      </aside>
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">{label}</p>
      {children}
    </div>
  );
}

function InfoRow({ icon: Icon, children }: { icon: React.ComponentType<any>; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
      <div className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center shrink-0">
        <Icon size={12} className="text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
