'use client';

import React from 'react';
import Link from 'next/link';
import { useMyLeases, useAllLeases } from '@/features/leases/queries/lease.queries';
import { useLeaseDetail } from '@/features/leases/queries/lease.queries';
import { useAuthStore } from '@/stores/auth.store';
import { FileSignature, Loader2, Calendar, FileText, Search, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function LeaseCard({ lease }: { lease: any }) {
  const status = (lease.status || '').toLowerCase();
  
  let statusBadge = 'bg-gray-100 text-gray-700 border-gray-200';
  if (status === 'draft' || status === 'proposed') statusBadge = 'bg-amber-50 text-amber-700 border-amber-200';
  if (status === 'funded') statusBadge = 'bg-blue-50 text-blue-700 border-blue-200';
  if (status === 'active' || status === 'completed') statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'cancelled' || status === 'terminated' || status === 'disputed') statusBadge = 'bg-red-50 text-red-700 border-red-200';

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className={cn("px-2 py-1 text-[10px] font-mono uppercase tracking-wider rounded-lg border", statusBadge)}>
              {status}
            </span>
            <p className="text-xs text-gray-500 font-mono mt-2">Lease #{lease.id.slice(-8)}</p>
          </div>
          <FileText className="w-5 h-5 text-gray-300" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Rent</span>
            <span className="font-semibold text-gray-900">{lease.monthlyRent?.toLocaleString()} {lease.currency}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Deposit</span>
            <span className="font-semibold text-gray-900">{lease.depositAmount?.toLocaleString()} {lease.currency}</span>
          </div>
        </div>

        {(lease.startDate || lease.endDate) && (
          <div className="pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>
              {lease.startDate ? new Date(lease.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
              {' - '}
              {lease.endDate ? new Date(lease.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
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

function AdminLeaseSearch() {
  const [inputId, setInputId] = React.useState('');
  const [searchId, setSearchId] = React.useState('');

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
          onChange={e => setInputId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setSearchId(inputId.trim())}
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

export default function LeasesDashboardPage() {
  const { currentUser } = useAuthStore();
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(currentUser?.role || '');

  const { data: myLeases = [], isLoading: myLoading } = useMyLeases();
  const { data: allLeases = [], isLoading: allLoading } = useAllLeases();

  // Admins see all leases (from /leases), tenants/owners see /leases/mine
  const leases = isAdmin ? allLeases : myLeases;
  const isLoading = isAdmin ? allLoading : myLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <FileSignature className="w-6 h-6 text-emerald-600" />
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Leases & Escrow</h1>
        {isAdmin && (
          <span className="px-2 py-1 text-[10px] font-mono uppercase bg-purple-50 text-purple-700 border border-purple-200 rounded-lg">Admin View</span>
        )}
      </div>

      {/* Admin: Lease lookup tool (always visible for admins) */}
      {isAdmin && (
        <AdminLeaseSearch />
      )}

      {leases.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <FileSignature className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-black/80">No Leases Found</h2>
          <p className="text-sm text-black/50 mt-2 max-w-sm mx-auto">
            {isAdmin
              ? "No leases exist in the system yet, or the /leases endpoint is restricted. Use the search above to look up a specific lease by ID."
              : "You don't have any active or drafted leases yet."}
          </p>
        </div>
      ) : (
        <>
          {isAdmin && <p className="text-xs text-gray-500">{leases.length} lease(s) found in system</p>}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {leases.map(lease => (
              <LeaseCard key={lease.id} lease={lease} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
