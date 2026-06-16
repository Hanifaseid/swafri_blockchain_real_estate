'use client';

import { UserCheck } from 'lucide-react';
import { SEED_CREDENTIALS } from '@/features/auth/utils/seed';

// ─── QuickFillBar ─────────────────────────────────────────────────────────────
// Developer quick-fill buttons — pre-fills email/password for dev accounts.
// Only shown in development mode. Credentials are real API accounts.

interface QuickFillBarProps {
  onFill: (email: string, password: string) => void;
}

const ROLE_COLORS: Record<string, string> = {
  TENANT:         'text-emerald-400',
  PROPERTY_OWNER: 'text-purple-400',
  ADMIN:          'text-blue-400',
  SUPER_ADMIN:    'text-amber-400',
};

const ROLE_LABELS: Record<string, string> = {
  TENANT:         'TENANT',
  PROPERTY_OWNER: 'OWNER',
  ADMIN:          'ADMIN',
  SUPER_ADMIN:    'SUPERADMIN',
};

export function QuickFillBar({ onFill }: QuickFillBarProps) {
  // Only render in development
  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950/20 p-4">
      <div className="flex items-center justify-center gap-1.5 text-white/35 text-[10px] font-mono uppercase tracking-widest mb-3">
        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
        Dev Quick-Fill
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SEED_CREDENTIALS.map(({ role, email, password }) => (
          <button
            key={role}
            type="button"
            onClick={() => onFill(email, password)}
            className="bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all rounded-lg p-2.5 text-center cursor-pointer"
          >
            <div className={`text-[10px] font-semibold font-mono mb-0.5 ${ROLE_COLORS[role] ?? 'text-white/50'}`}>
              {ROLE_LABELS[role] ?? role}
            </div>
            <div className="text-[9px] text-white/30 truncate font-mono">{email}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
