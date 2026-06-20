'use client';

import Link from 'next/link';
import { Building2, ShieldCheck } from 'lucide-react';
import { useAdminListings, useAdminListingsStats } from '@/features/listings/queries/listing.queries';
import type { Listing } from '@/features/listings/types/listing.types';

export default function AdminPropertiesPage() {
  const { data, isLoading } = useAdminListings({ limit: 25 });
  const stats = useAdminListingsStats();

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Admin review</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-gray-950">Properties</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review listing lifecycle, ownership status, and title verification from backend admin endpoints.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm">
          {(data?.total ?? 0).toLocaleString()} listings in queue
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {['pending', 'published', 'rejected'].map((key) => (
          <div key={key} className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">{key}</p>
            <p className="mt-2 text-2xl font-semibold text-gray-950">
              {String((stats.data as any)?.[key] ?? (stats.data as any)?.counts?.[key] ?? 0)}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="grid grid-cols-[minmax(0,1fr)_140px_140px_130px] border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
          <span>Listing</span>
          <span>Status</span>
          <span>Verification</span>
          <span>Action</span>
        </div>
        {(data?.items as Listing[] ?? []).map((listing) => (
          <div
            key={listing.id}
            className="grid grid-cols-[minmax(0,1fr)_140px_140px_130px] items-center gap-3 border-b border-gray-100 px-4 py-3 text-sm last:border-b-0"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-gray-950">{listing.title}</p>
              <p className="truncate text-xs text-gray-500">
                {listing.address.city}, {listing.address.country}
              </p>
            </div>
            <span>{listing.status}</span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck size={14} />
              {listing.verificationStatus}
            </span>
            <Link href={`/properties/${listing.id}`} className="text-sm font-medium text-emerald-700">
              Review
            </Link>
          </div>
        ))}
        {!isLoading && (data?.items ?? []).length === 0 && (
          <div className="p-8 text-center">
            <Building2 className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-3 text-sm font-medium text-gray-700">No listings found</p>
          </div>
        )}
      </div>
    </div>
  );
}
