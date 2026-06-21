'use client';

import { useState } from 'react';
import { Users, ShieldCheck, Plus, X } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import {
  useUsers, useAdmins, useSuspendUser, useBlockUser, useReactivateUser,
  useSuspendAdmin, useReactivateAdmin, useRestoreUser,
} from '@/features/users/queries/users.queries';
import type { UserAccount, AccountStatus } from '@/features/users/types/user.types';
import { UserRow } from '@/components/admin/UserRow';
import { UserDetailDrawer } from '@/components/admin/UserDetailDrawer';
import { CreateAdminForm } from '@/components/admin/CreateAdminForm';
import { Button } from '@/components/ui/Button';
import {
  AdminPageLayout,
  AdminTabs,
  AdminFilterBar,
  AdminTable,
  AdminEmptyState,
} from '@/components/admin/ui';

type TabId = 'users' | 'admins';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'BLOCKED', label: 'Blocked' },
];

export default function UsersPage() {
  const { currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>('users');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AccountStatus | 'ALL'>('ALL');
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);

  const { data: users = [], isLoading: loadingUsers } = useUsers({
    search: search || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });
  const { data: admins = [], isLoading: loadingAdmins } = useAdmins();

  const { mutate: suspend }       = useSuspendUser();
  const { mutate: block }         = useBlockUser();
  const { mutate: reactivate }    = useReactivateUser();
  const { mutate: restore }       = useRestoreUser();
  const { mutate: suspendAdm }    = useSuspendAdmin();
  const { mutate: reactivateAdm } = useReactivateAdmin();

  if (!currentUser) return null;

  const isAdmin      = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  if (!isAdmin) return null;

  const tabs = [
    { id: 'users', label: 'All Users', icon: <Users size={14} />, count: users.length },
    ...(isSuperAdmin ? [{ id: 'admins', label: 'Admins', icon: <ShieldCheck size={14} />, count: admins.length }] : []),
  ];

  const isLoading  = activeTab === 'users' ? loadingUsers : loadingAdmins;
  const rows       = activeTab === 'users' ? users : admins;
  const filteredRows = activeTab === 'admins' && search
    ? rows.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    : rows;

  return (
    <AdminPageLayout
      icon={Users}
      label="Platform"
      title="User Management"
      actions={
        isSuperAdmin ? (
          <Button size="sm" onClick={() => setShowCreateAdmin(true)}>
            <Plus size={14} /> Create Admin
          </Button>
        ) : undefined
      }
    >
      <AdminTabs
        tabs={tabs}
        active={activeTab}
        onChange={(id) => { setActiveTab(id as TabId); setSearch(''); setStatusFilter('ALL'); }}
        className="mb-5"
      />

      <AdminFilterBar
        search={search}
        onSearch={setSearch}
        placeholder={activeTab === 'users' ? 'Search users by name or email…' : 'Search admins…'}
        filters={activeTab === 'users' ? [{
          key: 'status',
          label: 'Status',
          value: statusFilter,
          onChange: (v) => setStatusFilter(v as AccountStatus | 'ALL'),
          options: STATUS_OPTIONS,
        }] : []}
        className="mb-5"
      />

      <AdminTable
        headers={['User', 'Role', 'Status', 'KYC', 'Joined', '']}
        loading={isLoading}
        empty={
          !isLoading && filteredRows.length === 0 ? (
            <AdminEmptyState
              icon={Users}
              title={activeTab === 'users' ? 'No users found' : 'No admins found'}
            />
          ) : undefined
        }
      >
        {filteredRows.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            currentUserId={currentUser.id}
            isSuperAdmin={isSuperAdmin}
            onView={setSelectedUser}
            onSuspend={(id) => activeTab === 'admins' ? suspendAdm({ adminId: id }) : suspend({ userId: id })}
            onBlock={(id) => block({ userId: id })}
            onReactivate={(id) => activeTab === 'admins' ? reactivateAdm(id) : reactivate(id)}
            onRestore={isSuperAdmin ? (id) => restore(id) : undefined}
            canModify={isSuperAdmin || (isAdmin && activeTab === 'users')}
            hideBlock={activeTab === 'admins'}
          />
        ))}
      </AdminTable>

      {!isLoading && filteredRows.length > 0 && (
        <p className="mt-3 text-xs text-gray-400 font-mono">
          {filteredRows.length} {activeTab === 'admins' ? 'admin' : 'user'}{filteredRows.length !== 1 ? 's' : ''} found
        </p>
      )}

      <UserDetailDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />

      {showCreateAdmin && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateAdmin(false)} aria-hidden="true" />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-xl p-6 shadow-2xl border border-gray-200 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Super Admin</p>
                <h2 className="text-base font-semibold text-gray-900">Create Admin Account</h2>
              </div>
              <button type="button" onClick={() => setShowCreateAdmin(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <CreateAdminForm onSuccess={() => { setShowCreateAdmin(false); setActiveTab('admins'); }} />
          </div>
        </>
      )}
    </AdminPageLayout>
  );
}
