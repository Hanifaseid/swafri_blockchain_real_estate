'use client';

import Link from 'next/link';
import { Plus, Wrench } from 'lucide-react';
import { ListingCard } from '@/components/listing/ListingCard';
import { Button } from '@/components/ui/Button';
import { useMyListings } from '@/features/listings/queries/listing.queries';
import { listingToSummary } from '@/features/listings/types/listing.types';

export default function AccountListingsPage() {
  const { data = [], isLoading } = useMyListings();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6f3c]">Property owner</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-[#153828]">My listings</h1>
        </div>
        <Button asChild>
          <Link href="/account/listings/new">
            <Plus size={16} />
            New listing
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listingToSummary(listing)}
            href={`/properties/${listing.id}`}
          />
        ))}
      </div>
      {!isLoading && data.length === 0 && (
        <div className="rounded-lg border border-[#d5c8b3] bg-white p-8 text-center">
          <Wrench className="mx-auto h-8 w-8 text-[#8a6f3c]" />
          <p className="mt-3 font-medium">No property listings yet</p>
          <p className="mt-1 text-sm text-[#5f6b61]">Create a draft, upload photos and documents, then submit it for review.</p>
        </div>
      )}
    </div>
  );
}
