'use client';

import { useState } from 'react';
import { Users, ShieldCheck, Plus, ShieldAlert, X } from 'lucide-react';

import { useAuthStore } from '@/stores/auth.store';
import {
  useUsers,
  useAdmins,
  useSuspendUser,
  useBlockUser,
  useReactivateUser,
  useSuspendAdmin,
  useReactivateAdmin,
} from '@/features/users/queries/users.queries';
import type { UserAccount, AccountStatus } from '@/features/users/types/user.types';
import type { UserRole } from '@/features/roles/types/role.types';

import { UserRow } from '@/components/admin/UserRow';
import { UserDetailDrawer } from '@/components/admin/UserDetailDrawer';
import { CreateAdminForm } from '@/components/admin/CreateAdminForm';
import { SearchInput } from '@/components/ui/SearchInput';
import { STATUS_FILTER_OPTIONS } from '@/features/users/constants';
import { cn } from '@/lib/utils';

type TabId = 'users' | 'admins';

// ─── Users Page ───────────────────────────────────────────────────────────────
// Two tabs: All Users (ADMIN + SUPER_ADMIN) and Admins (SUPER_ADMIN only).

export default function UsersPage() {
  const { currentUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState<TabId>('users');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AccountStatus | 'ALL'>('ALL');
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);

  // Users list (non-admin roles)
  const { data: users = [], isLoading: loadingUsers } = useUsers({
    search: search || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });

  // Admins list (super_admin only)
  const { data: admins = [], isLoading: loadingAdmins } = useAdmins();

  const { mutate: suspend }    = useSuspendUser();
  const { mutate: block }      = useBlockUser();
  const { mutate: reactivate } = useReactivateUser();
  const { mutate: suspendAdm } = useSuspendAdmin();
  const { mutate: reactivateAdm } = useReactivateAdmin();

  if (!currentUser) return null;

  const isAdmin      = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ShieldAlert className="w-12 h-12 text-red-400" />
        <p className="text-black/60 font-light">You do not have permission to view this page.</p>
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: React.ReactNode; count?: number; superAdminOnly?: boolean }[] = [
    {
      id: 'users',
      label: 'All Users',
      icon: <Users size={14} />,
      count: users.length,
    },
    ...(isSuperAdmin ? [{
      id: 'admins' as TabId,
      label: 'Admins',
      icon: <ShieldCheck size={14} />,
      count: admins.length,
      superAdminOnly: true,
    }] : []),
  ];

  const isLoading = activeTab === 'users' ? loadingUsers : loadingAdmins;
  const rows = activeTab === 'users' ? users : admins;

  // Filter admins list by search client-side (API may not support search on /admin/admins)
  const filteredRows = activeTab === 'admins' && search
    ? rows.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    : rows;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">Platform</p>
          <h1 className="text-2xl font-light text-[#0f172a] tracking-tight">User Management</h1>
        </div>

        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => setShowCreateAdmin(true)}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={14} />
            Create Admin
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-black/5 p-1 rounded-xl w-fit border border-black/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => { setActiveTab(tab.id); setSearch(''); setStatusFilter('ALL'); }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-white text-black shadow-sm'
                : 'text-black/50 hover:text-black/80'
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                'text-[10px] font-mono px-1.5 py-0.5 rounded-full',
                activeTab === tab.id ? 'bg-black/10 text-black' : 'bg-black/5 text-black/40'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={activeTab === 'users' ? 'Search users by name or email…' : 'Search admins…'}
          className="sm:w-72"
          inputClassName="bg-black/5 border-black/10 text-[#0f172a] placeholder:text-black/25 focus:border-emerald-400"
        />

        {/* Status filter — users tab only */}
        {activeTab === 'users' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AccountStatus | 'ALL')}
            className="h-9 rounded-lg border px-3 text-sm bg-black/5 border-black/10 text-black/70 focus:outline-none focus:border-emerald-400 transition-all"
            aria-label="Filter by status"
          >
            {STATUS_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['User', 'Role', 'Status', 'KYC', 'Joined', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-black/40">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-black/30 text-sm font-light">
                      {activeTab === 'users' ? 'No users found.' : 'No admins found.'}
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      currentUserId={currentUser.id}
                      onView={setSelectedUser}
                      onSuspend={(id) =>
                        activeTab === 'admins'
                          ? suspendAdm({ adminId: id })
                          : suspend({ userId: id })
                      }
                      onBlock={(id) => block({ userId: id })}
                      onReactivate={(id) =>
                        activeTab === 'admins'
                          ? reactivateAdm(id)
                          : reactivate(id)
                      }
                      canModify={isSuperAdmin || (isAdmin && activeTab === 'users')}
                      // Block action not available for admins (super_admin can only suspend/reactivate)
                      hideBlock={activeTab === 'admins'}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Count */}
      {!isLoading && filteredRows.length > 0 && (
        <p className="mt-3 text-xs text-black/25 font-mono">
          {filteredRows.length} {activeTab === 'admins' ? 'admin' : 'user'}{filteredRows.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* User detail drawer */}
      <UserDetailDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />

      {/* Create admin modal */}
      {showCreateAdmin && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setShowCreateAdmin(false)} aria-hidden="true" />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-gray-200 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">Super Admin</p>
                <h2 className="text-base font-semibold text-black">Create Admin Account</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateAdmin(false)}
                className="text-black/30 hover:text-black transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <CreateAdminForm onSuccess={() => { setShowCreateAdmin(false); setActiveTab('admins'); }} />
          </div>
        </>
      )}
    </div>
  );
}
