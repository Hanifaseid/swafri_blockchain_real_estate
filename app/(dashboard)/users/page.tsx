'use client';

import { useState } from 'react';
import { Users, Plus, ShieldAlert, X } from 'lucide-react';

import { useAuthStore } from '@/stores/auth.store';
import { useUsers, useSuspendUser, useBlockUser, useReactivateUser } from '@/features/users/queries/users.queries';
import type { UserAccount, AccountStatus } from '@/features/users/types/user.types';
import type { UserRole } from '@/features/roles/types/role.types';

import { UserRow } from '@/components/admin/UserRow';
import { UserDetailDrawer } from '@/components/admin/UserDetailDrawer';
import { CreateAdminForm } from '@/components/admin/CreateAdminForm';
import { SearchInput } from '@/components/ui/SearchInput';
import {
  ROLE_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from '@/features/users/constants';

// ─── Users Page ───────────────────────────────────────────────────────────────

export default function UsersPage() {
  const { currentUser } = useAuthStore();

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<AccountStatus | 'ALL'>('ALL');

  // UI state
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);

  // Queries + mutations
  const { data: users = [], isLoading } = useUsers({
    search: search || undefined,
    role: roleFilter !== 'ALL' ? roleFilter : undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });

  const { mutate: suspend } = useSuspendUser();
  const { mutate: block } = useBlockUser();
  const { mutate: reactivate } = useReactivateUser();

  if (!currentUser) return null;

  const canAccess = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';
  const canCreateAdmin = currentUser.role === 'SUPER_ADMIN';
  const canModify = canAccess;

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ShieldAlert className="w-12 h-12 text-red-400" />
        <p className="text-white/60 font-light">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-400 shrink-0" />
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-white/35">Platform</p>
            <h1 className="text-2xl font-light text-white tracking-tight">User Management</h1>
          </div>
        </div>

        {canCreateAdmin && (
          <button
            type="button"
            onClick={() => setShowCreateAdmin(true)}
            className="inline-flex items-center gap-2 bg-white text-black text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Plus size={14} />
            Create Admin
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name or email…"
          className="sm:w-72"
          inputClassName="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-emerald-400"
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
          className="h-9 rounded-lg border px-3 text-sm font-mono bg-white/5 border-white/10 text-white/70 focus:outline-none focus:border-emerald-400 transition-all"
          aria-label="Filter by role"
        >
          {ROLE_FILTER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-zinc-900">
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as AccountStatus | 'ALL')}
          className="h-9 rounded-lg border px-3 text-sm font-mono bg-white/5 border-white/10 text-white/70 focus:outline-none focus:border-emerald-400 transition-all"
          aria-label="Filter by status"
        >
          {STATUS_FILTER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-zinc-900">
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--color-dash-border)' }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-dash-border)', background: 'var(--color-dash-card)' }}>
                  {['User', 'Role', 'Status', 'KYC', 'Joined', ''].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-white/35"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-white/30 text-sm font-light">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onView={setSelectedUser}
                      onSuspend={(id) => suspend({ userId: id })}
                      onBlock={(id) => block({ userId: id })}
                      onReactivate={(id) => reactivate(id)}
                      canModify={canModify}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User count */}
      {!isLoading && users.length > 0 && (
        <p className="mt-3 text-xs text-white/25 font-mono">
          {users.length} user{users.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* User detail drawer */}
      <UserDetailDrawer
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />

      {/* Create admin modal */}
      {showCreateAdmin && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60"
            onClick={() => setShowCreateAdmin(false)}
            aria-hidden="true"
          />
          <div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-fade-in"
            style={{
              background: 'var(--color-dash-sidebar)',
              border: '1px solid var(--color-dash-border)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-white">Create Admin Account</h2>
              <button
                type="button"
                onClick={() => setShowCreateAdmin(false)}
                className="text-white/40 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <CreateAdminForm onSuccess={() => setShowCreateAdmin(false)} />
          </div>
        </>
      )}
    </div>
  );
}
