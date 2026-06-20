'use client';

import Link from 'next/link';
import { Building2, ShieldCheck } from 'lucide-react';
import { useAdminListings, useAdminListingsStats } from '@/features/listings/queries/listing.queries';
import { Loader2 } from 'lucide-react';

// ─── Admin Properties Page ────────────────────────────────────────────────────
// Lists all platform listings with status and verification state.
// Links to /admin/properties/[id] for full moderation controls.

export default function AdminPropertiesPage() {
  const { data, isLoading } = useAdminListings({ limit: 50 });
  const { data: stats, isLoading: statsLoading } = useAdminListingsStats();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-6 h-6 text-emerald-500 shrink-0" />
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">Admin</p>
          <h1 className="text-2xl font-light text-[#0f172a] tracking-tight">Properties</h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statsLoading ? (
          <div className="col-span-4 flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
          </div>
        ) : (
          <>
            {[
              { key: 'total', label: 'Total', value: (data?.total ?? 0) },
              { key: 'pending', label: 'Pending Review', value: (stats as any)?.pending ?? (stats as any)?.counts?.pending ?? 0 },
              { key: 'published', label: 'Published', value: (stats as any)?.published ?? (stats as any)?.counts?.published ?? 0 },
              { key: 'rejected', label: 'Rejected', value: (stats as any)?.rejected ?? (stats as any)?.counts?.rejected ?? 0 },
            ].map(({ key, label, value }) => (
              <div key={key} className="bg-white rounded-2xl border border-gray-200 p-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-1">{label}</p>
                <p className="text-2xl font-semibold text-[#0f172a]">{String(value)}</p>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1fr)_120px_140px_100px] border-b border-gray-200 bg-gray-50 px-4 py-3 text-[10px] font-mono uppercase tracking-widest text-black/40">
          <span>Listing</span>
          <span>Status</span>
          <span>Verification</span>
          <span>Action</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
          </div>
        ) : (data?.items ?? []).length === 0 ? (
          <div className="py-12 text-center">
            <Building2 className="mx-auto w-8 h-8 text-black/15 mb-3" />
            <p className="text-sm text-black/30 font-light">No listings found</p>
          </div>
        ) : (
          (data?.items ?? []).map((listing) => (
            <div
              key={listing.id}
              className="grid grid-cols-[minmax(0,1fr)_120px_140px_100px] items-center gap-3 border-b border-gray-100 px-4 py-3 text-sm last:border-b-0 hover:bg-gray-50/50 transition-colors"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-[#0f172a]">{listing.title}</p>
                <p className="truncate text-xs text-black/40">
                  {listing.address?.city}, {listing.address?.country}
                </p>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-gray-100 text-black/50 w-fit">
                {listing.status}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono text-black/50">
                <ShieldCheck size={13} />
                {listing.verificationStatus}
              </span>
              <Link
                href={`/admin/properties/${listing.id}`}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Review →
              </Link>
            </div>
          ))
        )}
      </div>

      {!isLoading && (data?.items ?? []).length > 0 && (
        <p className="mt-3 text-xs text-black/25 font-mono">
          {data?.items.length} of {data?.total ?? 0} listings shown
        </p>
      )}
    </div>
  );
}
