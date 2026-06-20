'use client';

import Link from 'next/link';
import { BadgeDollarSign } from 'lucide-react';
import { useMyOffers, useReceivedOffers } from '@/features/offers/queries/offer.queries';
import { useAuthStore } from '@/stores/auth.store';

export default function AccountOffersPage() {
  const { currentUser } = useAuthStore();
  const mine = useMyOffers();
  const received = useReceivedOffers();
  const data = currentUser?.role === 'PROPERTY_OWNER' ? received.data ?? [] : mine.data ?? [];
  const isLoading = currentUser?.role === 'PROPERTY_OWNER' ? received.isLoading : mine.isLoading;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6f3c]">Purchases</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[#153828]">
          {currentUser?.role === 'PROPERTY_OWNER' ? 'Received offers' : 'My offers'}
        </h1>
      </div>
      <div className="grid gap-3">
        {data.map((offer: any) => (
          <div key={offer.id} className="rounded-lg border border-[#d5c8b3] bg-white p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold">{offer.listingTitle ?? offer.listing?.title ?? 'Purchase offer'}</h2>
                <p className="mt-1 text-sm text-[#5f6b61]">
                  {offer.currency ?? 'USD'} {Number(offer.amount ?? offer.offerAmount ?? 0).toLocaleString()} - {offer.status}
                </p>
              </div>
              {(offer.listingId || offer.listing?.id) && (
                <Link href={`/properties/${offer.listingId ?? offer.listing.id}`} className="text-sm font-medium text-[#1e5a3d]">
                  View listing
                </Link>
              )}
            </div>
          </div>
        ))}
        {!isLoading && data.length === 0 && (
          <div className="rounded-lg border border-[#d5c8b3] bg-white p-8 text-center">
            <BadgeDollarSign className="mx-auto h-8 w-8 text-[#8a6f3c]" />
            <p className="mt-3 font-medium">No offers yet</p>
            <p className="mt-1 text-sm text-[#5f6b61]">Purchase offers appear here after tenant submission or owner receipt.</p>
          </div>
        )}
      </div>
    </div>
  );
}
