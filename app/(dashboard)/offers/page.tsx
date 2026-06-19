'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CreditCard, Loader2, ArrowRightLeft, Slash, Send, XCircle } from 'lucide-react';
import { ROLE_LABELS } from '@/features/roles/types/role.types';
import { useAuthStore } from '@/stores/auth.store';
import { useMyOffers, useReceivedOffers, useRespondOffer, useCancelOffer } from '@/features/offers/queries/offer.queries';
import type { Offer } from '@/features/offers/types/offer.types';
import { cn } from '@/lib/utils';

const STATUS_STYLE: Record<string, string> = {
  submitted: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  countered: 'bg-blue-50 text-blue-700 border-blue-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
};

const RESPONSE_ACTIONS = [
  { label: 'Accept', value: 'accept' as const },
  { label: 'Reject', value: 'reject' as const },
  { label: 'Counter', value: 'counter' as const },
];

type OfferResponseAction = 'accept' | 'reject' | 'counter';

// --- FIX APPLIED HERE ---
function formatCurrency(amount: number | string | null | undefined, currency: string) {
  // 1. Explicitly handle null, undefined, and empty strings to prevent the minus sign
  if (amount == null || amount === '') return '—';

  // 2. Convert to number (strips out currency symbols or commas safely)
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) : amount;

  // 3. Check if it's a valid finite number
  if (!isNaN(num) && isFinite(num)) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(num);
  }

  // 4. Final fallback if parsing failed
  return '—';
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl p-12 text-center" style={{ border: '1px solid var(--color-dash-border)', background: 'var(--color-dash-card)' }}>
      <CreditCard className="w-10 h-10 text-black/15 mx-auto mb-4" />
      <p className="text-sm text-black/60 font-light mb-2">{title}</p>
      <p className="text-xs text-black/50">{description}</p>
      <Link href="/properties" className="inline-block mt-4 text-xs text-emerald-600 hover:text-emerald-700 font-medium">
        Browse properties →
      </Link>
    </div>
  );
}

export default function OffersPage() {
  const { currentUser } = useAuthStore();
  if (!currentUser) return null;

  const isOwner = currentUser.role === 'PROPERTY_OWNER' || currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="w-6 h-6 text-emerald-500 shrink-0" />
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">{ROLE_LABELS[currentUser.role]}</p>
          <h1 className="text-2xl font-light text-dash-sidebar tracking-tight">{isOwner ? 'Offers Dashboard' : 'My Offers'}</h1>
        </div>
      </div>
      {isOwner ? <OwnerOffersView /> : <TenantOffersView />}
    </div>
  );
}

function TenantOffersView() {
  const { data: offers = [], isLoading } = useMyOffers();
  const cancelOfferMutation = useCancelOffer();

  if (isLoading) return <LoadingState />;

  if (offers.length === 0) {
    return (
      <EmptyState
        title="No offers submitted yet."
        description="Submit an offer from a property detail page to see it here."
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-black/35 font-mono">{offers.length} offer{offers.length === 1 ? '' : 's'} submitted</p>
      <div className="space-y-4">
        {offers.map((offer) => (
          <SentOfferCard key={offer.id} offer={offer} cancelOfferMutation={cancelOfferMutation} />
        ))}
      </div>
    </div>
  );
}

function OwnerOffersView() {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const { data: receivedOffers = [], isLoading: loadingReceived } = useReceivedOffers();
  const { data: sentOffers = [], isLoading: loadingSent } = useMyOffers();
  const cancelOfferMutation = useCancelOffer();

  const items = activeTab === 'received' ? receivedOffers : sentOffers;
  const isLoading = activeTab === 'received' ? loadingReceived : loadingSent;

  return (
    <div>
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        {(['received', 'sent'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              'text-xs font-medium px-4 py-2 rounded-lg capitalize transition-all',
              activeTab === tab ? 'bg-white text-black shadow-sm' : 'text-black/50 hover:text-black/70'
            )}
          >
            {tab === 'received' ? 'Received' : 'Sent'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState
          title={activeTab === 'received' ? 'No received offers yet.' : 'No sent offers yet.'}
          description={activeTab === 'received'
            ? 'Waiting for buyers to submit offers on your listings.'
            : 'You have not submitted any offers from this account.'}
        />
      ) : (
        <div className="space-y-4">
          {activeTab === 'received'
            ? items.map((offer) => <ReceivedOfferCard key={offer.id} offer={offer} />)
            : items.map((offer) => <SentOfferCard key={offer.id} offer={offer} cancelOfferMutation={cancelOfferMutation} />)}
        </div>
      )}
    </div>
  );
}

function ReceivedOfferCard({ offer }: { offer: Offer }) {
  const [expanded, setExpanded] = useState(false);
  const [responseNote, setResponseNote] = useState(offer.responseNote || '');
  const [responseAction, setResponseAction] = useState<OfferResponseAction>('accept');
  const [counterAmount, setCounterAmount] = useState<number>(offer.counterAmount ?? offer.amount);
  const { mutate: respond, isPending } = useRespondOffer();

  const listing = typeof offer.listing === 'string' ? null : offer.listing;
  const buyer = typeof offer.buyer === 'string' ? null : offer.buyer;

  const canRespond = offer.status === 'submitted' || offer.status === 'countered';
  const canSubmit = responseAction !== 'counter' || counterAmount > 0;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-dash-border)', background: 'var(--color-dash-card)' }}>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex items-center justify-between gap-3 w-full p-4 text-left"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2 items-center mb-2">
            <span className={cn('text-[10px] font-mono uppercase px-2 py-0.5 rounded border', STATUS_STYLE[offer.status] ?? 'border-gray-200 text-black/50')}>
              {offer.status.replace('_', ' ')}
            </span>
            <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">Received</span>
          </div>
          <p className="text-sm font-medium text-black/80 truncate">{listing?.title ?? `Listing ${offer.listingId}`}</p>
          <p className="text-xs text-black/50">{buyer?.name ?? buyer?.email ?? 'Buyer'}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-emerald-700">{formatCurrency(offer.amount, offer.currency)}</span>
          {expanded ? <XCircle className="w-4 h-4 text-black/30" /> : <ArrowRightLeft className="w-4 h-4 text-black/30" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-gray-50 p-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-1">Offer amount</p>
              <p className="text-sm font-semibold text-black/80">{formatCurrency(offer.amount, offer.currency)}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-1">Submitted</p>
              <p className="text-sm text-black/60">{new Date(offer.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-1">Message</p>
            <p className="text-sm text-black/70 leading-relaxed rounded-2xl bg-gray-50 p-3">{offer.message || 'No message provided.'}</p>
          </div>

          {offer.responseNote && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-1">Previous response</p>
              <p className="text-sm text-black/70 leading-relaxed rounded-2xl bg-gray-50 p-3">{offer.responseNote}</p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-1 block">Response</label>
              <select
                value={responseAction}
                onChange={(event) => setResponseAction(event.target.value as OfferResponseAction)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-black/70 bg-white focus:outline-none focus:border-emerald-400"
              >
                {RESPONSE_ACTIONS.map((action) => (
                  <option key={action.value} value={action.value}>{action.label}</option>
                ))}
              </select>
            </div>
            {responseAction === 'counter' && (
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-1 block">Counter offer</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-black/60">{offer.currency}</span>
                  <input
                    type="number"
                    min={0}
                    value={counterAmount}
                    onChange={(event) => setCounterAmount(Number(event.target.value))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-black/70 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-1 block">Message</label>
            <textarea
              value={responseNote}
              onChange={(event) => setResponseNote(event.target.value)}
              rows={3}
              placeholder="Write a response to the buyer…"
              className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm text-black/70 bg-white focus:outline-none focus:border-emerald-400 resize-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-black/50">
              Choose a response and save it to notify the buyer.
            </div>
            <button
              type="button"
              disabled={isPending || !canRespond || !canSubmit}
              onClick={() => {
                respond({ id: offer.id, payload: {
                  action: responseAction,
                  responseNote: responseNote.trim() || undefined,
                  counterAmount: responseAction === 'counter' ? counterAmount : undefined,
                } });
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
            >
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={12} />}
              Save response
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SentOfferCard({ offer, cancelOfferMutation }: { offer: Offer; cancelOfferMutation: ReturnType<typeof useCancelOffer> }) {
  const [expanded, setExpanded] = useState(false);
  const isCancelable = offer.status === 'submitted' || offer.status === 'countered';

  // Safety check: If listing is just an ID string, we handle it gracefully
  const listing = typeof offer.listing === 'string' ? null : offer.listing;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-dash-border)', background: 'var(--color-dash-card)' }}>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex items-center justify-between gap-3 w-full p-4 text-left"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2 items-center mb-2">
            <span className={cn('text-[10px] font-mono uppercase px-2 py-0.5 rounded border', STATUS_STYLE[offer.status] ?? 'border-gray-200 text-black/50')}>
              {offer.status.replace('_', ' ')}
            </span>
            <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">Sent</span>
          </div>
          <p className="text-sm font-medium text-black/80 truncate">{listing?.title ?? `Listing ${offer.listingId}`}</p>
          <p className="text-xs text-black/50">{new Date(offer.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-emerald-700">{formatCurrency(offer.amount, offer.currency)}</span>
          {expanded ? <XCircle className="w-4 h-4 text-black/30" /> : <ArrowRightLeft className="w-4 h-4 text-black/30" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-1">Message</p>
            <p className="text-sm text-black/70 leading-relaxed rounded-2xl bg-gray-50 p-3">{offer.message || 'No message provided.'}</p>
          </div>

          {offer.responseNote && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-1">Owner response</p>
              <p className="text-sm text-black/70 leading-relaxed rounded-2xl bg-gray-50 p-3">{offer.responseNote}</p>
            </div>
          )}

          {isCancelable && (
            <button
              type="button"
              disabled={cancelOfferMutation.isPending}
              onClick={() => cancelOfferMutation.mutate(offer.id)}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-black/70 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {cancelOfferMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Slash size={12} />}
              Cancel offer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
