'use client';

import { useState } from 'react';
import { MoreVertical, ShieldOff, ShieldBan, ShieldCheck, Eye, RotateCcw } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import type { UserAccount } from '@/features/users/types/user.types';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { AdminTableRow, AdminTableCell } from '@/components/admin/ui';

interface UserRowProps {
  user: UserAccount;
  currentUserId?: string;
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
  const isSelf = !!currentUserId && user.id === currentUserId;

  return (
    <AdminTableRow>
      {/* User info */}
      <AdminTableCell>
        <div className="flex items-center gap-3">
          <Avatar name={user.name} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
            <p className="text-xs text-gray-400 font-mono truncate">{user.email}</p>
          </div>
        </div>
      </AdminTableCell>

      {/* Role */}
      <AdminTableCell>
        <StatusBadge status={user.role} />
      </AdminTableCell>

      {/* Account status */}
      <AdminTableCell>
        <StatusBadge status={user.status} />
      </AdminTableCell>

      {/* KYC status */}
      <AdminTableCell>
        <StatusBadge status={user.kycStatus} />
      </AdminTableCell>

      {/* Joined date */}
      <AdminTableCell mono muted>
        {new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
      </AdminTableCell>

      {/* Actions */}
      <AdminTableCell>
        <div className="flex items-center gap-1 justify-end">
          <button
            type="button"
            onClick={() => onView(user)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label={`View ${user.name}`}
          >
            <Eye size={14} />
          </button>

          {canModify && user.role !== 'SUPER_ADMIN' && !isSelf && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="More actions"
                aria-expanded={menuOpen}
              >
                <MoreVertical size={14} />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden="true" />
                  <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-gray-200 bg-white p-1 z-20 shadow-lg">
                    {user.status !== 'SUSPENDED' && user.status !== 'BLOCKED' && (
                      <ActionItem
                        icon={<ShieldOff size={13} />}
                        label="Suspend"
                        className="text-amber-600 hover:bg-amber-50"
                        onClick={() => { onSuspend(user.id); setMenuOpen(false); }}
                      />
                    )}
                    {!hideBlock && user.status !== 'BLOCKED' && (
                      <ActionItem
                        icon={<ShieldBan size={13} />}
                        label="Block"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => { onBlock(user.id); setMenuOpen(false); }}
                      />
                    )}
                    {(user.status === 'SUSPENDED' || user.status === 'BLOCKED') && (
                      <ActionItem
                        icon={<ShieldCheck size={13} />}
                        label="Reactivate"
                        className="text-emerald-600 hover:bg-emerald-50"
                        onClick={() => { onReactivate(user.id); setMenuOpen(false); }}
                      />
                    )}
                    {isSuperAdmin && user.status === 'BLOCKED' && onRestore && (
                      <ActionItem
                        icon={<RotateCcw size={13} />}
                        label="Restore"
                        className="text-sky-600 hover:bg-sky-50"
                        onClick={() => { onRestore(user.id); setMenuOpen(false); }}
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </AdminTableCell>
    </AdminTableRow>
  );
}

function ActionItem({
  icon,
  label,
  onClick,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}
