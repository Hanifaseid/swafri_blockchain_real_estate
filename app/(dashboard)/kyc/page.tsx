'use client';

import { BadgeCheck, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { KYC_STATUS_BADGE } from '@/features/users/constants';
import { cn } from '@/lib/utils';

// ─── KYC Page ─────────────────────────────────────────────────────────────────
// Shows KYC and wallet status for the current user.
// Full KYC submission form comes in Phase 4 (PRD).

const KYC_STEPS = [
  { key: 'NOT_STARTED',  label: 'Not Started',  icon: AlertCircle,    color: 'text-white/30' },
  { key: 'PENDING',      label: 'Submitted',     icon: Clock,          color: 'text-amber-400' },
  { key: 'UNDER_REVIEW', label: 'Under Review',  icon: Clock,          color: 'text-blue-400' },
  { key: 'APPROVED',     label: 'Approved',      icon: CheckCircle2,   color: 'text-emerald-400' },
  { key: 'REJECTED',     label: 'Rejected',      icon: XCircle,        color: 'text-red-400' },
] as const;

export default function KycPage() {
  const { currentUser } = useAuthStore();

  if (!currentUser) return null;

  const badge = KYC_STATUS_BADGE[currentUser.kycStatus];
  const walletBadgeColor = {
    NOT_LINKED: 'text-white/35',
    LINKED:     'text-blue-400',
    VERIFIED:   'text-emerald-400',
    REVOKED:    'text-red-400',
  }[currentUser.walletStatus];

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <BadgeCheck className="w-6 h-6 text-emerald-400 shrink-0" />
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/35">Verification</p>
          <h1 className="text-2xl font-light text-white tracking-tight">KYC & Wallet</h1>
        </div>
      </div>

      <div className="space-y-5">
        {/* KYC status */}
        <div className="dash-card p-6">
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/35 mb-4">
            KYC Status
          </p>

          {/* Progress steps */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
            {KYC_STEPS.map((step, i) => {
              const isActive = step.key === currentUser.kycStatus;
              const stepIndex = KYC_STEPS.findIndex((s) => s.key === currentUser.kycStatus);
              const isPast = i < stepIndex;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex items-center gap-2 shrink-0">
                  <div className={cn(
                    'flex flex-col items-center gap-1.5',
                    isActive && 'opacity-100',
                    !isActive && !isPast && 'opacity-30',
                    isPast && 'opacity-60'
                  )}>
                    <Icon size={16} className={isActive ? step.color : 'text-white/40'} />
                    <span className="text-[9px] font-mono uppercase tracking-wider text-white/50 whitespace-nowrap">
                      {step.label}
                    </span>
                  </div>
                  {i < KYC_STEPS.length - 1 && (
                    <div className={cn(
                      'w-8 h-px shrink-0',
                      i < stepIndex ? 'bg-emerald-400/40' : 'bg-white/10'
                    )} />
                  )}
                </div>
              );
            })}
          </div>

          <div className={cn('text-sm font-semibold', badge.color)}>
            Current Status: {badge.label}
          </div>

          {currentUser.kycStatus === 'NOT_STARTED' && (
            <p className="text-xs text-white/40 font-light mt-2 leading-relaxed">
              KYC verification is required to perform trusted actions such as property publishing,
              escrow, and fractional investments. KYC submission form is coming in Phase 4.
            </p>
          )}
          {currentUser.kycStatus === 'PENDING' || currentUser.kycStatus === 'UNDER_REVIEW' ? (
            <p className="text-xs text-white/40 font-light mt-2">
              Your submission is under review. An admin will verify your documents shortly.
            </p>
          ) : null}
          {currentUser.kycStatus === 'APPROVED' && (
            <p className="text-xs text-emerald-400/70 font-light mt-2">
              Your identity is verified. You can perform trusted platform actions.
            </p>
          )}
          {currentUser.kycStatus === 'REJECTED' && (
            <p className="text-xs text-red-400/70 font-light mt-2">
              Your KYC was rejected. Please contact support for more information.
            </p>
          )}
        </div>

        {/* Wallet status */}
        <div className="dash-card p-6">
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/35 mb-4">
            Wallet Status
          </p>

          <div className={cn('text-sm font-semibold mb-2', walletBadgeColor)}>
            {currentUser.walletStatus.replace('_', ' ')}
          </div>

          {currentUser.linkedWalletAddress ? (
            <p className="text-[10px] font-mono text-white/35 break-all">
              {currentUser.linkedWalletAddress}
            </p>
          ) : (
            <p className="text-xs text-white/40 font-light leading-relaxed">
              Wallet linking is required for blockchain actions such as fractional property purchases
              and escrow. Wallet connection is coming in Phase 5.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
