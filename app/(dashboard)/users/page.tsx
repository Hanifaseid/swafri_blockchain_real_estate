'use client';

// Users management page — ADMIN and SUPER_ADMIN only.
// Full UserTable with search/filter wired in Step 10.
// Placeholder for now so routing works.

import { useAuthStore } from '@/stores/auth.store';
import { Users, ShieldAlert } from 'lucide-react';

export default function UsersPage() {
  const { currentUser } = useAuthStore();

  if (!currentUser) return null;

  const canAccess = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ShieldAlert className="w-12 h-12 text-red-400" />
        <p className="text-white/60 font-light">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Users className="w-6 h-6 text-blue-400" />
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/35">Platform</p>
          <h1 className="text-2xl font-light text-white tracking-tight">User Management</h1>
        </div>
      </div>

      {/* Placeholder — UserTable added in Step 10 */}
      <div className="dash-card p-8 text-center">
        <Users className="w-10 h-10 text-white/20 mx-auto mb-3" />
        <p className="text-white/40 text-sm font-light">User table coming in Step 10.</p>
        <p className="text-white/25 text-xs mt-1 font-mono">
          features/users/components/UserTable.tsx
        </p>
      </div>
    </div>
  );
}
