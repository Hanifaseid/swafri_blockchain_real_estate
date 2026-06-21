'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeDollarSign,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  useMyOffers,
  useReceivedOffers,
  useRespondOffer,
  useCancelOffer,
} from '@/features/offers/queries/offer.queries';
import type { Offer, OfferStatus } from '@/features/offers/types/offer.types';
import { useAuthStore } from '@/stores/auth.store';
import { formatCurrency } from '@/lib/utils';

// Backend sends 'submitted'; 'pending' kept for legacy safety.
const ACTIVE_STATUSES = new Set<OfferStatus>(['submitted', 'pending', 'countered']);
const TERMINAL_STATUSES = new Set<OfferStatus>(['accepted', 'rejected', 'cancelled']);

type Tab = 'active' | 'all';

// ── Helpers ───────────────────────────────────────────────────────────────────

function listingTitle(offer: Offer): string {
  if (typeof offer.listing === 'object' && offer.listing?.title) return offer.listing.title;
  return (offer as any).listingTitle ?? 'Purchase offer';
}

function listingHref(offer: Offer): string {
  const id = offer.listingId ?? (typeof offer.listing === 'object' ? offer.listing?.id : offer.listing);
  return id ? `/listings/${id}` : '/listings';
}

function relativeTime(d: string) {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);
  if (days < 1) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  submitted: { label: 'Awaiting response', bg: 'bg-amber-500/15', text: 'text-amber-300' },
  pending:   { label: 'Awaiting response', bg: 'bg-amber-500/15', text: 'text-amber-300' },
  countered: { label: 'Countered',         bg: 'bg-blue-500/15',  text: 'text-blue-300' },
  accepted:  { label: 'Accepted',          bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  rejected:  { label: 'Rejected',          bg: 'bg-red-500/15',   text: 'text-red-400' },
  cancelled: { label: 'Cancelled',         bg: 'bg-white/5',      text: 'text-text-muted' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { label: status, bg: 'bg-white/5', text: 'text-text-muted' };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

// ── ReceivedOfferCard (owner) ─────────────────────────────────────────────────

function ReceivedOfferCard({ offer }: { offer: Offer }) {
  const respond = useRespondOffer();
  const [expanded, setExpanded] = useState(ACTIVE_STATUSES.has(offer.status));
  const [mode, setMode] = useState<'idle' | 'counter'>('idle');
  const [counterAmount, setCounterAmount] = useState(String(offer.offerPrice ?? ''));
  const [note, setNote] = useState('');

  const isActive = ACTIVE_STATUSES.has(offer.status);
  const currency = offer.currency ?? 'USD';

  const doRespond = (status: 'accepted' | 'rejected' | 'countered') => {
    if (status === 'countered' && (!counterAmount || Number(counterAmount) <= 0)) return;
    respond.mutate({
      id: offer.id,
      payload: {
        status,
        ...(counterAmount && status === 'countered' ? { counterOfferPrice: Number(counterAmount) } : {}),
        ...(note.trim() ? { responseMessage: note.trim() } : {}),
      },
    }, { onSuccess: () => { setMode('idle'); setNote(''); } });
  };

  return (
    <div className={`rounded-2xl border bg-surface-card transition-colors ${isActive ? 'border-accent-400/30' : 'border-border-primary'}`}>
      {/* Header row */}
      <button
        className="flex w-full items-start justify-between gap-4 p-5 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={offer.status} />
            {offer.counterOfferPrice != null && offer.status === 'countered' && (
              <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-300">
                Counter: {formatCurrency(offer.counterOfferPrice, currency)}
              </span>
            )}
          </div>
          <p className="mt-2 truncate text-sm font-semibold text-white">
            {listingTitle(offer)}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-text-muted">
            <span className="font-mono text-base font-bold text-accent-400">
              {formatCurrency(offer.offerPrice, currency)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} /> {relativeTime(offer.createdAt)}
            </span>
            <Link
              href={listingHref(offer)}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-accent-400 hover:text-accent-300 transition-colors"
            >
              View listing <ArrowRight size={11} />
            </Link>
          </div>
        </div>
        {expanded ? <ChevronUp size={16} className="mt-1 shrink-0 text-text-muted" /> : <ChevronDown size={16} className="mt-1 shrink-0 text-text-muted" />}
      </button>

      {expanded && (
        <div className="border-t border-border-secondary px-5 pb-5">
          {/* Buyer message */}
          {offer.message && (
            <div className="mt-4 rounded-xl bg-surface-highlight p-4">
              <p className="mb-1 text-[10px] font-mono uppercase tracking-widest text-text-muted">Buyer&apos;s message</p>
              <p className="text-sm leading-relaxed text-text-secondary">{offer.message}</p>
            </div>
          )}

          {/* Previous response note */}
          {offer.responseMessage && (
            <div className="mt-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 p-4">
              <p className="mb-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400/60">Your response</p>
              <p className="text-sm leading-relaxed text-text-secondary">{offer.responseMessage}</p>
            </div>
          )}

          {/* Link to deal tracker for accepted offers */}
          {offer.status === 'accepted' && (
            <div className="mt-4">
              <Link
                href="/account/purchases"
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent-400/15 border border-accent-400/30 px-4 py-2.5 text-sm font-semibold text-accent-400 hover:bg-accent-400/25 transition-colors"
              >
                Track deal progress <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* Action panel — only for active offers */}
          {isActive && (
            <div className="mt-4">
              {mode === 'counter' ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Counter amount ({currency})</label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={counterAmount}
                      onChange={(e) => setCounterAmount(e.target.value)}
                      className="mt-1 h-10 w-full rounded-xl border border-border-primary bg-surface-input px-3 text-sm text-white outline-none focus:border-accent-400 transition-colors"
                      placeholder="Enter counter amount"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Note to buyer (optional)</label>
                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="mt-1 w-full resize-none rounded-xl border border-border-primary bg-surface-input p-3 text-sm text-white outline-none focus:border-accent-400 transition-colors"
                      placeholder="Explain your counter offer…"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={respond.isPending || !counterAmount || Number(counterAmount) <= 0}
                      onClick={() => doRespond('countered')}
                      className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
                    >
                      <RefreshCw size={14} /> {respond.isPending ? 'Sending…' : 'Send counter'}
                    </button>
                    <button
                      onClick={() => setMode('idle')}
                      className="rounded-xl border border-border-primary px-4 py-2.5 text-sm font-medium text-text-muted hover:bg-surface-highlight transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Note for any response */}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Note to buyer (optional)</label>
                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="mt-1 w-full resize-none rounded-xl border border-border-primary bg-surface-input p-3 text-sm text-white outline-none focus:border-accent-400 transition-colors"
                      placeholder="Add a message for the buyer…"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      disabled={respond.isPending}
                      onClick={() => doRespond('accepted')}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                    >
                      <Check size={14} /> Accept offer
                    </button>
                    <button
                      onClick={() => setMode('counter')}
                      className="flex items-center gap-1.5 rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-2.5 text-sm font-semibold text-blue-300 transition-colors hover:bg-blue-500/20"
                    >
                      <RefreshCw size={14} /> Counter
                    </button>
                    <button
                      disabled={respond.isPending}
                      onClick={() => doRespond('rejected')}
                      className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── SentOfferCard (tenant) ────────────────────────────────────────────────────

function SentOfferCard({ offer }: { offer: Offer }) {
  const cancel = useCancelOffer();
  const [expanded, setExpanded] = useState(false);

  const isActive = ACTIVE_STATUSES.has(offer.status);
  const isCountered = offer.status === 'countered';
  const currency = offer.currency ?? 'USD';

  return (
    <div className={`rounded-2xl border bg-surface-card transition-colors ${isCountered ? 'border-blue-500/30' : isActive ? 'border-border-primary' : 'border-border-secondary opacity-75'}`}>
      <button
        className="flex w-full items-start justify-between gap-4 p-5 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={offer.status} />
            {isCountered && offer.counterOfferPrice != null && (
              <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-300">
                Owner countered: {formatCurrency(offer.counterOfferPrice, currency)}
              </span>
            )}
          </div>
          <p className="mt-2 truncate text-sm font-semibold text-white">
            {listingTitle(offer)}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-text-muted">
            <span className="font-mono text-base font-bold text-white/80">
              {formatCurrency(offer.offerPrice, currency)}
            </span>
            <span className="flex items-center gap-1"><Clock size={11} /> {relativeTime(offer.createdAt)}</span>
            <Link
              href={listingHref(offer)}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-accent-400 hover:text-accent-300 transition-colors"
            >
              View listing <ArrowRight size={11} />
            </Link>
          </div>
        </div>
        {expanded ? <ChevronUp size={16} className="mt-1 shrink-0 text-text-muted" /> : <ChevronDown size={16} className="mt-1 shrink-0 text-text-muted" />}
      </button>

      {expanded && (
        <div className="border-t border-border-secondary px-5 pb-5">
          {/* Your original message */}
          {offer.message && (
            <div className="mt-4 rounded-xl bg-surface-highlight p-4">
              <p className="mb-1 text-[10px] font-mono uppercase tracking-widest text-text-muted">Your message</p>
              <p className="text-sm leading-relaxed text-text-secondary">{offer.message}</p>
            </div>
          )}

          {/* Owner response note */}
          {offer.responseMessage && (
            <div className="mt-3 rounded-xl bg-accent-400/5 border border-accent-400/15 p-4">
              <p className="mb-1 text-[10px] font-mono uppercase tracking-widest text-accent-400/60">Owner&apos;s response</p>
              <p className="text-sm leading-relaxed text-text-secondary">{offer.responseMessage}</p>
            </div>
          )}

          {/* Expiry */}
          {(offer as any).expiresAt && (
            <p className="mt-3 text-xs text-text-muted">
              Expires: {new Date((offer as any).expiresAt).toLocaleDateString()}
            </p>
          )}

          {/* Link to purchase transaction for accepted offers */}
          {offer.status === 'accepted' && (
            <div className="mt-4">
              <Link
                href="/account/purchases"
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent-400/15 border border-accent-400/30 px-4 py-2.5 text-sm font-semibold text-accent-400 hover:bg-accent-400/25 transition-colors"
              >
                Track deal progress <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* Cancel — only for active offers */}
          {isActive && (
            <div className="mt-4">
              <button
                disabled={cancel.isPending}
                onClick={() => cancel.mutate(offer.id)}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
              >
                <X size={14} /> {cancel.isPending ? 'Cancelling…' : 'Cancel offer'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AccountOffersPage() {
  const { currentUser } = useAuthStore();
  const isOwner = currentUser?.role === 'PROPERTY_OWNER';
  const [tab, setTab] = useState<Tab>('active');

  const mine = useMyOffers();
  const received = useReceivedOffers();

  const rawOffers = isOwner ? (received.data ?? []) : (mine.data ?? []);
  const isLoading = isOwner ? received.isLoading : mine.isLoading;

  const activeOffers = rawOffers.filter((o) => ACTIVE_STATUSES.has(o.status));
  const allOffers = rawOffers;
  const displayed = tab === 'active' ? activeOffers : allOffers;

  return (
    <div className="space-y-6">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">Purchases</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-3xl font-semibold text-white">
            {isOwner ? 'Received offers' : 'My offers'}
          </h1>
          {!isOwner && (
            <Link
              href="/listings"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-400 hover:text-accent-300 transition-colors"
            >
              Browse listings <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 rounded-xl border border-border-primary bg-surface-card p-1 self-start">
        {(['active', 'all'] as Tab[]).map((t) => {
          const count = t === 'active' ? activeOffers.length : allOffers.length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-surface-highlight text-white'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {t === 'active' ? (isOwner ? 'Needs action' : 'Active') : 'All'}
              {count > 0 && (
                <span className={`grid h-5 min-w-[20px] place-items-center rounded-full px-1 text-[10px] font-bold ${
                  tab === t ? 'bg-accent-400 text-emerald-950' : 'bg-surface-highlight text-text-muted'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── List ─────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-border-primary bg-surface-card" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border-primary bg-surface-card py-16">
          {tab === 'active' ? (
            <>
              <Check className="h-10 w-10 text-emerald-400/50" />
              <p className="mt-3 font-medium text-white">
                {isOwner ? 'No offers need a response' : 'No active offers'}
              </p>
              <p className="mt-1 text-sm text-text-muted">
                {isOwner
                  ? 'All received offers have been responded to.'
                  : 'Offers you submit on sale listings appear here.'}
              </p>
            </>
          ) : (
            <>
              <BadgeDollarSign className="h-10 w-10 text-accent-400/50" />
              <p className="mt-3 font-medium text-white">No offers yet</p>
              <p className="mt-1 text-sm text-text-muted">
                {isOwner
                  ? 'Offers from buyers on your listings appear here.'
                  : 'Make an offer on any sale listing to see it here.'}
              </p>
              {!isOwner && (
                <Link
                  href="/listings"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent-400 px-5 py-2.5 text-sm font-semibold text-emerald-950 hover:bg-accent-300 transition-colors"
                >
                  <Building2 size={15} /> Browse listings
                </Link>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((offer) =>
            isOwner
              ? <ReceivedOfferCard key={offer.id} offer={offer} />
              : <SentOfferCard key={offer.id} offer={offer} />
          )}
        </div>
      )}

      {/* Summary footer */}
      {!isLoading && allOffers.length > 0 && (
        <div className="flex flex-wrap gap-4 rounded-xl border border-border-secondary bg-surface-card p-4 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            {rawOffers.filter(o => ACTIVE_STATUSES.has(o.status)).length} active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {rawOffers.filter(o => o.status === 'accepted').length} accepted
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            {rawOffers.filter(o => o.status === 'rejected').length} rejected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white/20" />
            {rawOffers.filter(o => o.status === 'cancelled').length} cancelled
          </span>
        </div>
      )}
    </div>
  );
}
