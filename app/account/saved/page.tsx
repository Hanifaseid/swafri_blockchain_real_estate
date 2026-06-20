'use client';

import Link from 'next/link';
import { Bell, Search } from 'lucide-react';
import { useSavedSearches } from '@/features/listings/queries/listing.queries';

export default function AccountSavedPage() {
  const { data = [], isLoading } = useSavedSearches();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6f3c]">Marketplace</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[#153828]">Saved searches</h1>
      </div>
      <div className="grid gap-3">
        {data.map((search) => (
          <div key={search.id} className="rounded-lg border border-[#d5c8b3] bg-white p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold">{search.name}</h2>
                <p className="mt-1 text-sm text-[#5f6b61]">
                  {search.query.listingType ?? 'Sale and rent'} search
                  {search.alertEnabled ? ' with alerts enabled' : ''}
                </p>
              </div>
              <Link
                href="/properties"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#d5c8b3] px-3 text-sm font-medium"
              >
                <Search size={15} />
                Open search
              </Link>
            </div>
          </div>
        ))}
        {!isLoading && data.length === 0 && (
          <div className="rounded-lg border border-[#d5c8b3] bg-white p-8 text-center">
            <Bell className="mx-auto h-8 w-8 text-[#8a6f3c]" />
            <p className="mt-3 font-medium">No saved searches yet</p>
            <p className="mt-1 text-sm text-[#5f6b61]">Save map filters from the property discovery page.</p>
          </div>
        )}
      </div>
    </div>
  );
}
