'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  useMyLeases,
  useLeaseDetail,
  useTenantRoster,
} from '@/features/leases/queries/lease.queries';
import type { Lease } from '@/features/leases/types/lease.types';
import { useAuthStore } from '@/stores/auth.store';
import {
  FileSignature, Loader2, Calendar, FileText, Search, Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusBadgeClass(status: string) {
  const s = status.toLowerCase();
  if (s === 'draft' || s === 'proposed') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (s === 'funded') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (s === 'active' || s === 'completed') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (s === 'cancelled' || s === 'terminated' || s === 'disputed') return 'bg-red-50 text-red-700 border-red-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
}


// ─── Lease Card ───────────────────────────────────────────────────────────────

function LeaseCard({ lease }: { lease: Lease }) {
  const status = (lease.status || '').toLowerCase();
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className={cn('px-2 py-1 text-[10px] font-mono uppercase tracking-wider rounded-lg border', statusBadgeClass(status))}>
              {status}
            </span>
            <p className="text-xs text-gray-500 font-mono mt-2">Lease #{lease.id.slice(-8)}</p>
          </div>
          <FileText className="w-5 h-5 text-gray-300" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Rent</span>
            <span className="font-semibold text-gray-900">
              {lease.monthlyRent?.toLocaleString()} {lease.currency}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Deposit</span>
            <span className="font-semibold text-gray-900">
              {lease.depositAmount?.toLocaleString()} {lease.currency}
            </span>
          </div>
        </div>

        {(lease.startDate || lease.endDate) && (
          <div className="pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>
              {lease.startDate
                ? new Date(lease.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'N/A'}
              {' – '}
              {lease.endDate
                ? new Date(lease.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'N/A'}
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <Link
          href={`/leases/${lease.id}`}
          className="w-full block text-center py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-sm font-semibold transition-colors"
        >
          Manage Lease
        </Link>
      </div>
    </div>
  );
}

// ─── Admin Lease Search ───────────────────────────────────────────────────────

function AdminLeaseSearch() {
  const [inputId, setInputId] = useState('');
  const [searchId, setSearchId] = useState('');
  const { data: lease, isLoading, isError } = useLeaseDetail(searchId);
 

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Look up Lease by ID</h3>
        <p className="text-xs text-gray-500">Paste a lease ID to access and manage it directly.</p>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setSearchId(inputId.trim())}
          placeholder="e.g. 6a33017ce2831bdf0dd9ee8f"
          className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 font-mono"
        />
        <button
          onClick={() => setSearchId(inputId.trim())}
          disabled={!inputId.trim()}
          className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-40 flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Find
        </button>
      </div>
      {isLoading && searchId && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Looking up lease…
        </div>
      )}
      {isError && searchId && (
        <p className="text-sm text-red-500">Lease not found. Check the ID and try again.</p>
      )}
      {lease && !isLoading && (
        <div className="pt-2">
          <LeaseCard lease={lease} />
        </div>
      )}
    </div>
  );
}

// ─── Tenant Roster View ───────────────────────────────────────────────────────
// Uses GET /leases/tenants → returns [{ id, name, email, phone }]

function TenantRosterView() {
  const { data: tenants = [], isLoading } = useTenantRoster();
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (tenants.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-100">
        <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">No tenants found.</p>
        <p className="text-xs text-gray-400 mt-1">
          Tenants appear here once they have active leases on your properties.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px_80px_100px] border-b border-gray-200 bg-gray-50 px-4 py-3 text-[10px] font-mono uppercase tracking-widest text-gray-400">
        <span>Tenant</span>
        <span>Listing</span>
        <span>Email</span>
        <span>Status</span>
        <span>End Date</span>
      </div>

      {tenants.map((t, i) => (
        <div
          key={t.leaseId || i}
          className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px_80px_100px] items-center gap-3 border-b border-gray-100 px-4 py-3 text-sm last:border-b-0 hover:bg-gray-50/50 transition-colors"
        >
          {/* Tenant name */}
          <div className="min-w-0">
            <p className="font-medium text-gray-800 truncate">
              {t.tenantName ?? <span className="text-gray-400 font-mono text-xs">…{t.tenantId.slice(-8)}</span>}
            </p>
          </div>

          {/* Listing title */}
          <p className="text-xs text-gray-600 truncate">
            {t.listingTitle ?? '—'}
          </p>

          {/* Email */}
          <p className="text-xs text-gray-500 font-mono truncate">
            {t.tenantEmail ?? '—'}
          </p>

          {/* Status */}
          <span className={cn(
            'text-[10px] font-mono uppercase px-2 py-0.5 rounded border w-fit',
            statusBadgeClass(t.status)
          )}>
            {t.status}
          </span>

          {/* End date */}
          <p className="text-xs text-gray-400 font-mono">
            {t.endDate
              ? new Date(t.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
              : '—'}
          </p>
        </div>
      ))}

      <p className="px-4 py-2 text-xs text-gray-400 font-mono border-t border-gray-100">
        {tenants.length} tenant{tenants.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type TabId = 'leases' | 'tenants';

export default function LeasesDashboardPage() {
  const { currentUser } = useAuthStore();
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(currentUser?.role ?? '');

  const [activeTab, setActiveTab] = useState<TabId>('leases');

  // /leases/mine returns leases where caller is landlord or tenant
  const { data: leases = [], isLoading } = useMyLeases();
  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'leases', label: 'All Leases', icon: <FileSignature size={14} /> },
    ...(isAdmin ? [{ id: 'tenants' as TabId, label: 'Tenant Roster', icon: <Users size={14} /> }] : []),
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <FileSignature size={16} className="text-emerald-600" />
        </div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Leases & Escrow</h1>
          {isAdmin && (
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-violet-50 text-violet-700 border border-violet-200 rounded-md">
              Admin View
            </span>
          )}
        </div>
      </div>

      {/* Tabs — admin only */}
      {isAdmin && (
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit border border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Tenant Roster tab */}
      {activeTab === 'tenants' && isAdmin && <TenantRosterView />}

      {/* Leases tab */}
      {activeTab === 'leases' && (
        <>
          {isAdmin && <AdminLeaseSearch />}

          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : leases.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
              <FileSignature className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-black/80">No Leases Found</h2>
              <p className="text-sm text-black/50 mt-2 max-w-sm mx-auto">
                {isAdmin
                  ? 'No leases exist yet. Use the search above to look up a specific lease by ID.'
                  : "You don't have any active or drafted leases yet."}
              </p>
            </div>
          ) : (
            <>
              {isAdmin && (
                <p className="text-xs text-gray-500 font-mono">{leases.length} lease(s) found in system</p>
              )}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {leases.map((lease) => (
                  <LeaseCard key={lease.id} lease={lease} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
