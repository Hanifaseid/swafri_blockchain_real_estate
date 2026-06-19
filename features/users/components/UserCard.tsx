import { CheckCircle2, XCircle, Clock, Shield, ShieldAlert, User as UserIcon, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserAccount, AccountStatus } from '../types/user.types';

interface UserCardProps {
  user: UserAccount;
  onSuspend?: (id: string, reason?: string) => void;
  onBlock?: (id: string, reason?: string) => void;
  onReactivate?: (id: string) => void;
  isSuspendPending?: boolean;
  isBlockPending?: boolean;
  isReactivatePending?: boolean;
}

const STATUS_STYLES: Record<AccountStatus, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-600',
  PENDING: 'bg-amber-50 text-amber-600',
  SUSPENDED: 'bg-orange-50 text-orange-600',
  BLOCKED: 'bg-red-50 text-red-600',
  REJECTED: 'bg-red-100 text-red-700',
};

const STATUS_ICONS: Record<AccountStatus, any> = {
  ACTIVE: CheckCircle2,
  PENDING: Clock,
  SUSPENDED: ShieldAlert,
  BLOCKED: XCircle,
  REJECTED: XCircle,
};

const ROLE_STYLES: Record<string, string> = {
  SUPER_ADMIN: 'bg-purple-50 text-purple-600',
  ADMIN: 'bg-blue-50 text-blue-600',
  PROPERTY_OWNER: 'bg-emerald-50 text-emerald-600',
  TENANT: 'bg-gray-50 text-gray-600',
};

export function UserCard({
  user,
  onSuspend,
  onBlock,
  onReactivate,
  isSuspendPending,
  isBlockPending,
  isReactivatePending
}: UserCardProps) {
  const StatusIcon = STATUS_ICONS[user.status] || Clock;
  const canSuspend = user.status === 'ACTIVE' || user.status === 'PENDING';
  const canReactivate = user.status === 'SUSPENDED' || user.status === 'BLOCKED';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={cn('text-[10px] font-mono uppercase px-2 py-0.5 rounded', STATUS_STYLES[user.status])}>
              <StatusIcon size={12} className="inline mr-1" />
              {user.status.replace(/_/g, ' ')}
            </span>
            <span className={cn('text-[10px] font-mono uppercase px-2 py-0.5 rounded', ROLE_STYLES[user.role])}>
              {user.role.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <UserIcon size={14} className="text-black/40" />
            <h3 className="text-sm font-medium text-black/80">{user.name}</h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-black/60">
            <Mail size={12} className="text-black/40" />
            <span className="truncate">{user.email}</span>
          </div>
          {user.kycStatus && (
            <div className="flex items-center gap-1 mt-2">
              <Shield size={12} className={user.kycStatus === 'verified' ? 'text-emerald-500' : 'text-amber-500'} />
              <span className="text-xs text-black/60">KYC: {user.kycStatus}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {canSuspend && (
            <>
              {onSuspend && (
                <button
                  onClick={() => {
                    const reason = prompt('Enter reason for suspension (optional):');
                    onSuspend(user.id, reason || undefined);
                  }}
                  disabled={isSuspendPending}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-100 disabled:opacity-50"
                >
                  Suspend
                </button>
              )}
              {onBlock && (
                <button
                  onClick={() => {
                    const reason = prompt('Enter reason for blocking:');
                    if (!reason) return;
                    onBlock(user.id, reason);
                  }}
                  disabled={isBlockPending}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 disabled:opacity-50"
                >
                  Block
                </button>
              )}
            </>
          )}
          {canReactivate && onReactivate && (
            <button
              onClick={() => onReactivate(user.id)}
              disabled={isReactivatePending}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 disabled:opacity-50"
            >
              Reactivate
            </button>
          )}
        </div>
      </div>
      <p className="text-[10px] text-black/35 font-mono mt-3">
        Joined: {new Date(user.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
