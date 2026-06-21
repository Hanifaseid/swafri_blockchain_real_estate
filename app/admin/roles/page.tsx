'use client';

import { useAuthStore } from '@/stores/auth.store';
import { ROLE_LABELS } from '@/features/roles/types/role.types';
import { KeyRound, ShieldAlert } from 'lucide-react';
import { AdminPageLayout, AdminCard, AdminEmptyState } from '@/components/admin/ui';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';

export default function RolesPage() {
  const { currentUser } = useAuthStore();

  if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
    return (
      <AdminPageLayout icon={KeyRound} label="System" title="Roles" maxWidth="max-w-4xl">
        <AdminCard>
          <AdminEmptyState icon={ShieldAlert} title="Super Admin access required" />
        </AdminCard>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout icon={KeyRound} label="System" title="Roles" maxWidth="max-w-4xl">
      <div className="grid md:grid-cols-2 gap-4">
        {(Object.entries(ROLE_LABELS) as [keyof typeof ROLE_LABELS, string][]).map(([key, label]) => (
          <AdminCard key={key}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-semibold text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{key}</p>
              </div>
              <StatusBadge status={key} />
            </div>
          </AdminCard>
        ))}
      </div>
    </AdminPageLayout>
  );
}
