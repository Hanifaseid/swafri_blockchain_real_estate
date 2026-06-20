'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BadgeDollarSign } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  useMyOffers,
  useReceivedOffers,
  useRespondOffer,
  useCancelOffer,
} from '@/features/offers/queries/offer.queries';
import type { Offer } from '@/features/offers/types/offer.types';
import { useAuthStore } from '@/stores/auth.store';

const ACTIONABLE = new Set(['pending', 'countered']);

function listingTitle(offer: Offer): string {
  return typeof offer.listing === 'object' && offer.listing
    ? offer.listing.title
    : (offer as any).listingTitle ?? 'Purchase offer';
}
function listingId(offer: Offer): string | undefined {
  return offer.listingId ?? (typeof offer.listing === 'object' ? offer.listing?.id : undefined);
}

function OfferRow({ offer, isOwner }: { offer: Offer; isOwner: boolean }) {
  const respond = useRespondOffer();
  const cancel = useCancelOffer();
  const [countering, setCountering] = useState(false);
  const [counterPrice, setCounterPrice] = useState<string>(String(offer.offerPrice ?? ''));

  const actionable = ACTIONABLE.has(offer.status);
  const id = listingId(offer);

  return (
    <div className="rounded-lg border border-[#d5c8b3] bg-white p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="font-semibold">{listingTitle(offer)}</h2>
          <p className="mt-1 text-sm text-[#5f6b61]">
            {offer.currency ?? 'USD'} {Number(offer.offerPrice ?? 0).toLocaleString()}
            <span className="mx-2 text-[#c3b9a3]">·</span>
            <span className="font-medium capitalize text-[#163c2c]">{offer.status}</span>
            {offer.counterOfferPrice ? (
              <span className="ml-2 text-[#8a6f3c]">
                (countered {offer.currency ?? 'USD'} {offer.counterOfferPrice.toLocaleString()})
              </span>
            ) : null}
          </p>
        </div>
        {id && (
          <Link href={`/properties/${id}`} className="text-sm font-medium text-[#1e5a3d]">
            View listing
          </Link>
        )}
      </div>

      {/* Actions */}
      {actionable && (
        <div className="mt-4 border-t border-[#efe7d6] pt-3">
          {isOwner ? (
            countering ? (
              <div className="flex flex-wrap items-end gap-2">
                <label className="flex-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#5f6b61]">
                    Counter price
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(e.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-[#d5c8b3] bg-[#fbf8f1] px-3 text-sm text-[#1c1a16] outline-none focus:border-[#1e5a3d]"
                  />
                </label>
                <Button
                  size="sm"
                  loading={respond.isPending}
                  onClick={() =>
                    respond.mutate(
                      { id: offer.id, payload: { status: 'countered', counterOfferPrice: Number(counterPrice) } },
                      { onSuccess: () => setCountering(false) },
                    )
                  }
                >
                  Send counter
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setCountering(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  loading={respond.isPending}
                  onClick={() => respond.mutate({ id: offer.id, payload: { status: 'accepted' } })}
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCountering(true)}
                >
                  Counter
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  loading={respond.isPending}
                  onClick={() => respond.mutate({ id: offer.id, payload: { status: 'rejected' } })}
                >
                  Reject
                </Button>
              </div>
            )
          ) : (
            <Button
              size="sm"
              variant="outline"
              loading={cancel.isPending}
              onClick={() => cancel.mutate(offer.id)}
            >
              Cancel offer
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function AccountOffersPage() {
  const { currentUser } = useAuthStore();
  const isOwner = currentUser?.role === 'PROPERTY_OWNER';
  const mine = useMyOffers();
  const received = useReceivedOffers();
  const data = isOwner ? received.data ?? [] : mine.data ?? [];
  const isLoading = isOwner ? received.isLoading : mine.isLoading;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6f3c]">Purchases</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[#153828]">
          {isOwner ? 'Received offers' : 'My offers'}
        </h1>
      </div>
      <div className="grid gap-3">
        {data.map((offer) => (
          <OfferRow key={offer.id} offer={offer} isOwner={isOwner} />
        ))}
        {!isLoading && data.length === 0 && (
          <div className="rounded-lg border border-[#d5c8b3] bg-white p-8 text-center">
            <BadgeDollarSign className="mx-auto h-8 w-8 text-[#8a6f3c]" />
            <p className="mt-3 font-medium">No offers yet</p>
            <p className="mt-1 text-sm text-[#5f6b61]">
              {isOwner
                ? 'Offers from buyers on your listings appear here.'
                : 'Make an offer from any sale listing to see it here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
