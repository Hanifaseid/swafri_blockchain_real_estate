'use client';

import { useAuthStore } from '@/stores/auth.store';
import { ROLE_LABELS } from '@/features/roles/types/role.types';
import { KeyRound, ShieldAlert } from 'lucide-react';

export default function RolesPage() {
  const { currentUser } = useAuthStore();

  if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ShieldAlert className="w-12 h-12 text-red-400" />
        <p className="text-black/60 font-light">Super Admin access required.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <KeyRound className="w-6 h-6 text-amber-400" />
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">System</p>
          <h1 className="text-2xl font-light text-[#0f172a] tracking-tight">Roles</h1>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {(Object.entries(ROLE_LABELS) as [keyof typeof ROLE_LABELS, string][]).map(([key, label]) => (
          <div key={key} className="dash-card p-5">
            <div className={`text-xs font-mono uppercase tracking-widest mb-1 role-${key.toLowerCase().replace('_', '-')}`}>
              {key}
            </div>
            <div className="text-base font-semibold text-black">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
