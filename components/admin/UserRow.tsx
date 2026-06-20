'use client';

import { useState } from 'react';
import { MoreVertical, ShieldOff, ShieldBan, ShieldCheck, Eye, RotateCcw } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import type { UserAccount } from '@/features/users/types/user.types';
import {
  ACCOUNT_STATUS_BADGE,
  KYC_STATUS_BADGE,
  ROLE_BADGE,
} from '@/features/users/constants';

// ─── UserRow ──────────────────────────────────────────────────────────────────
// Single row in the user management table.
// Used by the DataTable in app/(dashboard)/users/page.tsx

interface UserRowProps {
  user: UserAccount;
  /** The ID of the currently logged-in admin — used to block self-action. */
  currentUserId?: string;
  /** Whether the current actor is a Super Admin (enables restore action). */
  isSuperAdmin?: boolean;
  onView: (user: UserAccount) => void;
  onSuspend: (userId: string) => void;
  onBlock: (userId: string) => void;
  onReactivate: (userId: string) => void;
  onRestore?: (userId: string) => void;
  canModify: boolean;
  hideBlock?: boolean;
}

export function UserRow({
  user,
  currentUserId,
  isSuperAdmin = false,
  onView,
  onSuspend,
  onBlock,
  onReactivate,
  onRestore,
  canModify,
  hideBlock = false,
}: UserRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const statusBadge = ACCOUNT_STATUS_BADGE[user.status];
  const kycBadge = KYC_STATUS_BADGE[user.kycStatus];
  const roleBadge = ROLE_BADGE[user.role];

  // Prevent an admin from acting on their own account
  const isSelf = !!currentUserId && user.id === currentUserId;

  return (
    <tr
      className="border-b transition-colors hover:bg-black/3"
      style={{ borderColor: 'var(--color-dash-border)' }}
    >
      {/* User info */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#0f172a] truncate">{user.name}</p>
            <p className="text-xs text-black/40 font-mono truncate">{user.email}</p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-4 py-3">
        <span className={cn('text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-md', roleBadge.color)}>
          {roleBadge.label}
        </span>
      </td>

      {/* Account status */}
      <td className="px-4 py-3">
        <span className={cn('text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-md', statusBadge.color)}>
          {statusBadge.label}
        </span>
      </td>

      {/* KYC status */}
      <td className="px-4 py-3">
        <span className={cn('text-[10px]  font-mono uppercase tracking-wider px-2 py-1 rounded-md', kycBadge.color)}>
          {kycBadge.label}
        </span>
      </td>

      {/* Joined date */}
      <td className="px-4 py-3 text-xs text-black/40 font-mono blackspace-nowrap">
        {new Date(user.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric',
        })}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 justify-end">
          <button
            type="button"
            onClick={() => onView(user)}
            className="p-1.5 rounded-lg text-black/30 hover:text-[#0f172a] hover:bg-black/5 transition-colors"
            aria-label={`View ${user.name}`}
          >
            <Eye size={14} />
          </button>

          {canModify && user.role !== 'SUPER_ADMIN' && !isSelf && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="p-1.5 rounded-lg text-black/30 hover:text-[#0f172a] hover:bg-black/5 transition-colors"
                aria-label="More actions"
                aria-expanded={menuOpen}
              >
                <MoreVertical size={14} />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute right-0 top-full mt-1 w-44 rounded-xl border p-1 z-20 shadow-2xl"
                    style={{ background: 'var(--color-dash-card)', borderColor: 'var(--color-dash-border)' }}
                  >
                    {user.status !== 'SUSPENDED' && user.status !== 'BLOCKED' && (
                      <button
                        type="button"
                        onClick={() => { onSuspend(user.id); setMenuOpen(false); }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-amber-400 hover:bg-amber-950/20 transition-colors"
                      >
                        <ShieldOff size={13} />
                        Suspend
                      </button>
                    )}
                    {!hideBlock && user.status !== 'BLOCKED' && (
                      <button
                        type="button"
                        onClick={() => { onBlock(user.id); setMenuOpen(false); }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-950/20 transition-colors"
                      >
                        <ShieldBan size={13} />
                        Block
                      </button>
                    )}
                    {(user.status === 'SUSPENDED' || user.status === 'BLOCKED') && (
                      <button
                        type="button"
                        onClick={() => { onReactivate(user.id); setMenuOpen(false); }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-emerald-400 hover:bg-emerald-950/20 transition-colors"
                      >
                        <ShieldCheck size={13} />
                        Reactivate
                      </button>
                    )}
                    {isSuperAdmin && user.status === 'BLOCKED' && onRestore && (
                      <button
                        type="button"
                        onClick={() => { onRestore(user.id); setMenuOpen(false); }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-blue-400 hover:bg-blue-950/20 transition-colors"
                      >
                        <RotateCcw size={13} />
                        Restore
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
