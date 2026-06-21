'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  FileText,
  ShieldAlert,
  X,
} from 'lucide-react';
import {
  usePurchaseTransactions,
  useDisputePurchaseTransaction,
} from '@/features/transactions/queries/transaction.queries';
import type {
  PurchaseTransaction,
  PurchaseStatus,
  ClosingChecklist,
} from '@/features/transactions/types/transaction.types';
import { useAuthStore } from '@/stores/auth.store';
import { formatCurrency } from '@/lib/utils';

// ── Status config ─────────────────────────────────────────────────────────────

const PIPELINE: { status: PurchaseStatus; label: string }[] = [
  { status: 'offer_accepted',        label: 'Offer accepted' },
  { status: 'deposit_pending',       label: 'Deposit pending' },
  { status: 'deposit_received',      label: 'Deposit received' },
  { status: 'closing_review',        label: 'Closing review' },
  { status: 'title_transfer_pending', label: 'Title transfer' },
  { status: 'completed',             label: 'Completed' },
];

const TERMINAL = new Set<PurchaseStatus>(['completed', 'cancelled']);
const ACTIVE_STATUSES = new Set<PurchaseStatus>([
  'offer_accepted', 'deposit_pending', 'deposit_received',
  'closing_review', 'title_transfer_pending',
]);

const STATUS_LABEL: Record<PurchaseStatus, string> = {
  offer_accepted:         'Offer accepted',
  deposit_pending:        'Deposit pending',
  deposit_received:       'Deposit received',
  closing_review:         'Closing review',
  title_transfer_pending: 'Title transfer',
  completed:              'Completed',
  cancelled:              'Cancelled',
  disputed:               'Disputed',
};

const STATUS_COLOR: Record<PurchaseStatus, { bg: string; text: string }> = {
  offer_accepted:         { bg: 'bg-blue-500/15',    text: 'text-blue-300' },
  deposit_pending:        { bg: 'bg-amber-500/15',   text: 'text-amber-300' },
  deposit_received:       { bg: 'bg-teal-500/15',    text: 'text-teal-300' },
  closing_review:         { bg: 'bg-purple-500/15',  text: 'text-purple-300' },
  title_transfer_pending: { bg: 'bg-indigo-500/15',  text: 'text-indigo-300' },
  completed:              { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  cancelled:              { bg: 'bg-white/5',        text: 'text-text-muted' },
  disputed:               { bg: 'bg-red-500/15',     text: 'text-red-400' },
};

const ESCROW_COLOR: Record<string, { bg: string; text: string }> = {
  none:     { bg: 'bg-white/5',        text: 'text-text-muted' },
  funded:   { bg: 'bg-teal-500/15',    text: 'text-teal-300' },
  released: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  refunded: { bg: 'bg-amber-500/15',   text: 'text-amber-300' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function pipelineIndex(status: PurchaseStatus): number {
  return PIPELINE.findIndex((s) => s.status === status);
}

function checklistCount(cl?: ClosingChecklist): { done: number; total: number } {
  if (!cl) return { done: 0, total: 5 };
  const fields: (keyof ClosingChecklist)[] = [
    'purchaseAgreement', 'inspection', 'financing', 'titleReview', 'settlementStatement',
  ];
  return { done: fields.filter((f) => cl[f]).length, total: fields.length };
}

function relativeTime(d: string) {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);
  if (days < 1) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function short(id: string) { return `#${id.slice(-6).toUpperCase()}`; }

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PurchaseStatus }) {
  const c = STATUS_COLOR[status] ?? STATUS_COLOR.offer_accepted;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${c.bg} ${c.text}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function PipelineBar({ status }: { status: PurchaseStatus }) {
  if (status === 'cancelled' || status === 'disputed') return null;
  const idx = pipelineIndex(status);
  return (
    <div className="mt-4 flex items-center gap-0">
      {PIPELINE.map((step, i) => {
        const done    = i < idx;
        const current = i === idx;
        return (
          <div key={step.status} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {i > 0 && (
                <div className={`h-0.5 flex-1 ${done || current ? 'bg-accent-400' : 'bg-border-primary'}`} />
              )}
              <div className={`h-2.5 w-2.5 shrink-0 rounded-full border-2 ${
                done    ? 'border-accent-400 bg-accent-400' :
                current ? 'border-accent-400 bg-surface-card' :
                          'border-border-primary bg-surface-card'
              }`} />
              {i < PIPELINE.length - 1 && (
                <div className={`h-0.5 flex-1 ${done ? 'bg-accent-400' : 'bg-border-primary'}`} />
              )}
            </div>
            <span className={`mt-1 text-center text-[9px] leading-tight font-medium ${
              done || current ? 'text-accent-400' : 'text-text-muted'
            }`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ChecklistBar({ checklist }: { checklist?: ClosingChecklist }) {
  const { done, total } = checklistCount(checklist);
  if (done === 0 && total === 5) return null;
  const pct = Math.round((done / total) * 100);
  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between text-xs text-text-muted">
        <span>Closing checklist</span>
        <span>{done}/{total}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border-primary">
        <div
          className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-400' : 'bg-accent-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── TransactionCard ───────────────────────────────────────────────────────────

function TransactionCard({
  tx,
  currentUserId,
}: {
  tx: PurchaseTransaction;
  currentUserId: string;
}) {
  const dispute = useDisputePurchaseTransaction();
  const [expanded, setExpanded] = useState(ACTIVE_STATUSES.has(tx.status));
  const [disputeMode, setDisputeMode] = useState(false);
  const [reason, setReason] = useState('');

  const isBuyer  = tx.buyerId === currentUserId;
  const currency = tx.currency ?? 'USD';
  const escrow   = tx.escrow ?? { state: 'none' };
  const ec       = ESCROW_COLOR[escrow.state] ?? ESCROW_COLOR.none;

  const canDispute =
    !TERMINAL.has(tx.status) &&
    tx.status !== 'disputed' &&
    (isBuyer || tx.sellerId === currentUserId);

  const doDispute = () => {
    dispute.mutate(
      { id: tx.id, payload: reason.trim() ? { reason: reason.trim() } : undefined },
      { onSuccess: () => { setDisputeMode(false); setReason(''); } },
    );
  };

  return (
    <div className={`rounded-2xl border bg-surface-card transition-colors ${
      tx.status === 'disputed' ? 'border-red-500/30' :
      ACTIVE_STATUSES.has(tx.status) ? 'border-accent-400/25' :
      'border-border-primary'
    }`}>
      {/* Header */}
      <button
        className="flex w-full items-start justify-between gap-4 p-5 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={tx.status} />
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ec.bg} ${ec.text}`}>
              Escrow: {escrow.state}
            </span>
            {isBuyer ? (
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-300">Buyer</span>
            ) : (
              <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] text-purple-300">Seller</span>
            )}
          </div>
          <p className="mt-2 truncate text-sm font-semibold text-white">{tx.listingTitle}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-text-muted">
            <span className="font-mono text-base font-bold text-accent-400">
              {formatCurrency(tx.listingPrice, currency)}
            </span>
            {tx.depositAmount && (
              <span className="flex items-center gap-1">
                <DollarSign size={11} />
                Deposit: {formatCurrency(tx.depositAmount, currency)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={11} /> {relativeTime(tx.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="font-mono text-[10px] text-text-muted">{short(tx.id)}</span>
          {expanded ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border-secondary px-5 pb-5">
          {/* Pipeline progress */}
          <PipelineBar status={tx.status} />

          {/* Financials */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Tile label="Purchase price" value={formatCurrency(tx.listingPrice, currency)} />
            <Tile label="Deposit"        value={tx.depositAmount ? formatCurrency(tx.depositAmount, currency) : '—'} />
            <Tile label="Escrow state"   value={escrow.state} />
            <Tile label="Your role"      value={isBuyer ? 'Buyer' : 'Seller'} />
          </div>

          {/* Closing checklist */}
          <ChecklistBar checklist={tx.closingChecklist} />

          {/* On-chain escrow */}
          {(escrow.contractAddress || escrow.fundTxHash || escrow.settleTxHash) && (
            <div className="mt-4 rounded-xl border border-border-primary bg-surface-highlight p-4 space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted">On-chain escrow</p>
              {escrow.contractAddress && (
                <p className="font-mono text-[11px] text-text-secondary break-all">Contract: {escrow.contractAddress}</p>
              )}
              {escrow.fundTxHash && (
                <p className="font-mono text-[11px] text-teal-400 break-all">Fund tx: {escrow.fundTxHash}</p>
              )}
              {escrow.settleTxHash && (
                <p className="font-mono text-[11px] text-emerald-400 break-all">Settle tx: {escrow.settleTxHash}</p>
              )}
              {tx.titleTransferTxHash && (
                <p className="font-mono text-[11px] text-accent-400 break-all">Title transfer: {tx.titleTransferTxHash}</p>
              )}
            </div>
          )}

          {/* Dispute panel */}
          {tx.dispute && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="mb-1 text-[10px] font-mono uppercase tracking-widest text-red-400/70">Dispute opened</p>
              {tx.dispute.reason && (
                <p className="text-sm leading-relaxed text-text-secondary">{tx.dispute.reason}</p>
              )}
              {tx.dispute.openedAt && (
                <p className="mt-1 text-xs text-text-muted">Opened {relativeTime(tx.dispute.openedAt)}</p>
              )}
              <p className="mt-2 text-xs text-text-muted">Platform admin will review and resolve the dispute.</p>
            </div>
          )}

          {/* Note */}
          {tx.note && (
            <div className="mt-4 rounded-xl bg-surface-highlight p-4">
              <p className="mb-1 text-[10px] font-mono uppercase tracking-widest text-text-muted">Note</p>
              <p className="text-sm leading-relaxed text-text-secondary">{tx.note}</p>
            </div>
          )}

          {/* Platform info */}
          <p className="mt-4 flex items-center gap-1.5 text-xs text-text-muted">
            <ShieldAlert size={12} className="text-accent-400/60" />
            Escrow funding, closing steps, and title transfer are managed by the platform.
          </p>

          {/* Actions */}
          {canDispute && (
            <div className="mt-4">
              {disputeMode ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Reason for dispute
                    </label>
                    <textarea
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="mt-1 w-full resize-none rounded-xl border border-border-primary bg-surface-input p-3 text-sm text-white outline-none focus:border-red-500/60 transition-colors"
                      placeholder="Describe the issue in detail…"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={dispute.isPending}
                      onClick={doDispute}
                      className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-50"
                    >
                      <AlertTriangle size={14} />
                      {dispute.isPending ? 'Submitting…' : 'Submit dispute'}
                    </button>
                    <button
                      onClick={() => { setDisputeMode(false); setReason(''); }}
                      className="rounded-xl border border-border-primary px-4 py-2.5 text-sm font-medium text-text-muted hover:bg-surface-highlight transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setDisputeMode(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20"
                >
                  <AlertTriangle size={14} /> Report an issue
                </button>
              )}
            </div>
          )}

          {/* Link to listing */}
          {tx.listingId && (
            <div className="mt-4">
              <Link
                href={`/listings/${tx.listingId}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-400 hover:text-accent-300 transition-colors"
              >
                <Building2 size={14} /> View property listing <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-primary bg-surface-highlight p-3">
      <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Tab = 'active' | 'all';

export default function AccountPurchasesPage() {
  const { currentUser } = useAuthStore();
  const [tab, setTab] = useState<Tab>('active');

  const { data, isLoading } = usePurchaseTransactions(1, 50);
  const all    = data?.items ?? [];
  const active = all.filter((t) => ACTIVE_STATUSES.has(t.status) || t.status === 'disputed');
  const displayed = tab === 'active' ? active : all;

  const userId = currentUser?.id ?? '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">Purchases</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-3xl font-semibold text-white">My transactions</h1>
          <Link
            href="/account/offers"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-400 hover:text-accent-300 transition-colors"
          >
            <FileText size={14} /> View offers <ArrowRight size={12} />
          </Link>
        </div>
        <p className="mt-2 text-sm text-text-muted">
          Track your active property purchases and sales through closing.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 self-start rounded-xl border border-border-primary bg-surface-card p-1">
        {(['active', 'all'] as Tab[]).map((t) => {
          const count = t === 'active' ? active.length : all.length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === t ? 'bg-surface-highlight text-white' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {t === 'active' ? 'In progress' : 'All'}
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

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl border border-border-primary bg-surface-card" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border-primary bg-surface-card py-16">
          {tab === 'active' ? (
            <>
              <CheckCircle2 className="h-10 w-10 text-emerald-400/40" />
              <p className="mt-3 font-medium text-white">No active transactions</p>
              <p className="mt-1 text-sm text-text-muted">
                Transactions appear here once an offer is accepted.
              </p>
            </>
          ) : (
            <>
              <DollarSign className="h-10 w-10 text-accent-400/40" />
              <p className="mt-3 font-medium text-white">No transactions yet</p>
              <p className="mt-1 text-sm text-text-muted">
                Make an offer on a sale listing to start a transaction.
              </p>
              <Link
                href="/listings"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent-400 px-5 py-2.5 text-sm font-semibold text-emerald-950 hover:bg-accent-300 transition-colors"
              >
                <Building2 size={15} /> Browse listings
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((tx) => (
            <TransactionCard key={tx.id} tx={tx} currentUserId={userId} />
          ))}
        </div>
      )}

      {/* Summary footer */}
      {!isLoading && all.length > 0 && (
        <div className="flex flex-wrap gap-4 rounded-xl border border-border-secondary bg-surface-card p-4 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent-400" />
            {active.length} in progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {all.filter((t) => t.status === 'completed').length} completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            {all.filter((t) => t.status === 'disputed').length} disputed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white/20" />
            {all.filter((t) => t.status === 'cancelled').length} cancelled
          </span>
        </div>
      )}
    </div>
  );
}
