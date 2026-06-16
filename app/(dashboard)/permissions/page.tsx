'use client';

import { useAuthStore } from '@/stores/auth.store';
import { ROLE_PERMISSIONS } from '@/lib/auth/permissions';
import { Lock, ShieldAlert } from 'lucide-react';

export default function PermissionsPage() {
  const { currentUser } = useAuthStore();

  if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ShieldAlert className="w-12 h-12 text-red-400" />
        <p className="text-white/60 font-light">Super Admin access required.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Lock className="w-6 h-6 text-amber-400" />
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/35">System</p>
          <h1 className="text-2xl font-light text-white tracking-tight">Permissions</h1>
        </div>
      </div>

      <div className="space-y-4">
        {(Object.entries(ROLE_PERMISSIONS) as [string, string[]][]).map(([role, perms]) => (
          <div key={role} className="dash-card p-5">
            <div className={`text-xs font-mono uppercase tracking-widest mb-3 role-${role.toLowerCase().replace('_', '-')}`}>
              {role}
            </div>
            <div className="flex flex-wrap gap-2">
              {perms.map((p) => (
                <span
                  key={p}
                  className="text-[10px] font-mono bg-white/5 border border-white/10 text-white/60 px-2.5 py-1 rounded-lg"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
