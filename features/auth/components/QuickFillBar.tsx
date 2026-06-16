'use client';

import { UserCheck } from 'lucide-react';

// ─── QuickFillBar ─────────────────────────────────────────────────────────────
// Developer quick-fill buttons — pre-fills email/password for seed accounts.
// Extracted from the existing auth/page.tsx for reuse.
// Only shown in development mode.

interface QuickFillBarProps {
  onFill: (email: string, password: string) => void;
}

const DEV_ACCOUNTS = [
  { label: 'TENANT',     email: 'tenant@swafir.com',     password: 'Tenant@1234',   color: 'text-emerald-400' },
  { label: 'OWNER',      email: 'owner@swafir.com',      password: 'Owner@1234',    color: 'text-purple-400'  },
  { label: 'ADMIN',      email: 'admin@swafir.com',      password: 'Admin@1234',    color: 'text-blue-400'    },
  { label: 'SUPERADMIN', email: 'superadmin@swafir.com', password: 'Admin@1234',    color: 'text-amber-400'   },
] as const;

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
        {DEV_ACCOUNTS.map(({ label, email, password, color }) => (
          <button
            key={label}
            type="button"
            onClick={() => onFill(email, password)}
            className="bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all rounded-lg p-2.5 text-center cursor-pointer"
          >
            <div className={`text-[10px] font-semibold font-mono mb-0.5 ${color}`}>{label}</div>
            <div className="text-[9px] text-white/30 truncate font-mono">{email}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
