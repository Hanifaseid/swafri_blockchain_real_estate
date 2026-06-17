'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useMyRentalApplications } from '@/features/rental-applications/queries/rental-application.queries';
import { FileText, Loader2, Calendar } from 'lucide-react';

export default function ApplicationsPage() {
  const { currentUser } = useAuthStore();
  const { data: applications = [], isLoading } = useMyRentalApplications();

  const isTenant = currentUser?.role === 'TENANT';
  const isOwner = currentUser?.role === 'PROPERTY_OWNER';

  if (!currentUser) return null;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <FileText className="w-6 h-6 text-emerald-500" />
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">Overview</p>
          <h1 className="text-2xl font-light text-[#0f172a] tracking-tight">Rental Applications</h1>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <FileText className="w-10 h-10 text-black/15 mx-auto mb-3" />
          <p className="text-sm text-black/40 font-light">
            {isTenant ? "You haven't submitted any rental applications yet." : "You don't have any rental applications yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-black/80">Application #{app.id.slice(-6)}</h3>
                  <p className="text-xs text-black/40">For Listing: {app.listingId}</p>
                </div>
                <span className="px-2.5 py-1 text-[10px] font-mono uppercase rounded-lg bg-gray-100 text-gray-600">
                  {app.status.replace('_', ' ')}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-black/60">
                <div>
                  <span className="block text-[10px] font-mono uppercase text-black/30 mb-1">Start Date</span>
                  <div className="flex items-center gap-1.5"><Calendar size={13}/> {app.desiredStartDate}</div>
                </div>
                <div>
                  <span className="block text-[10px] font-mono uppercase text-black/30 mb-1">Occupants</span>
                  {app.occupants}
                </div>
                <div>
                  <span className="block text-[10px] font-mono uppercase text-black/30 mb-1">Monthly Income</span>
                  ${app.monthlyIncome?.toLocaleString()}
                </div>
                <div className="flex items-center justify-end">
                  <button className="text-emerald-600 font-medium hover:text-emerald-700">View Details →</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
