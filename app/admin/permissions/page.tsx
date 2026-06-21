'use client';

import { useAuthStore } from '@/stores/auth.store';
import { ROLE_PERMISSIONS } from '@/lib/auth/permissions';
import { Lock } from 'lucide-react';
import { AdminPageLayout, AdminCard, AdminEmptyState } from '@/components/admin/ui';
import { ShieldAlert } from 'lucide-react';

export default function PermissionsPage() {
  const { currentUser } = useAuthStore();

  if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
    return (
      <AdminPageLayout icon={Lock} label="System" title="Permissions" maxWidth="max-w-5xl">
        <AdminCard>
          <AdminEmptyState icon={ShieldAlert} title="Super Admin access required" />
        </AdminCard>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout icon={Lock} label="System" title="Permissions" maxWidth="max-w-5xl">
      <div className="space-y-4">
        {(Object.entries(ROLE_PERMISSIONS) as [string, string[]][]).map(([role, perms]) => (
          <AdminCard
            key={role}
            title={<span className={`text-xs font-mono uppercase tracking-widest role-${role.toLowerCase().replace('_', '-')}`}>{role}</span>}
          >
            <div className="flex flex-wrap gap-2">
              {perms.map((p) => (
                <span key={p} className="text-[10px] font-mono bg-gray-100 border border-gray-200 text-gray-600 px-2.5 py-1 rounded-lg">
                  {p}
                </span>
              ))}
            </div>
          </AdminCard>
        ))}
      </div>
    </AdminPageLayout>
  );
}
