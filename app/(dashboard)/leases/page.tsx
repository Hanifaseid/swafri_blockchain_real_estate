'use client';

import React from 'react';
import Link from 'next/link';
import { useMyLeases } from '@/features/leases/queries/lease.queries';
import { useAuthStore } from '@/stores/auth.store';
import { FileSignature, Loader2, Calendar, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LeasesDashboardPage() {
  const { data: leases = [], isLoading } = useMyLeases();
  const { currentUser } = useAuthStore();
  const isTenant = currentUser?.role === 'TENANT';

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (leases.length === 0) {
    return (
      <div className="p-8 text-center bg-white m-6 rounded-2xl border border-gray-100 shadow-sm">
        <FileSignature className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h2 className="text-xl font-semibold text-black/80">No Leases Found</h2>
        <p className="text-sm text-black/50 mt-2">
          {isTenant ? "You don't have any active or drafted leases yet." : "You haven't generated any leases yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <FileSignature className="w-6 h-6 text-emerald-600" />
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Leases & Escrow</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {leases.map(lease => {
          const status = (lease.status || '').toLowerCase();
          
          let statusBadge = 'bg-gray-100 text-gray-700 border-gray-200';
          if (status === 'draft' || status === 'proposed') statusBadge = 'bg-amber-50 text-amber-700 border-amber-200';
          if (status === 'funded') statusBadge = 'bg-blue-50 text-blue-700 border-blue-200';
          if (status === 'active' || status === 'completed') statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
          if (status === 'cancelled' || status === 'terminated' || status === 'disputed') statusBadge = 'bg-red-50 text-red-700 border-red-200';

          return (
            <div key={lease.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className={cn("px-2 py-1 text-[10px] font-mono uppercase tracking-wider rounded-lg border", statusBadge)}>
                      {status}
                    </span>
                    <p className="text-xs text-gray-500 font-mono mt-2">Lease #{lease.id.slice(-6)}</p>
                  </div>
                  <FileText className="w-5 h-5 text-gray-300" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Rent</span>
                    <span className="font-semibold text-gray-900">{lease.monthlyRent.toLocaleString()} {lease.currency}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Deposit</span>
                    <span className="font-semibold text-gray-900">{lease.depositAmount.toLocaleString()} {lease.currency}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(lease.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(lease.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
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
        })}
      </div>
    </div>
  );
}
