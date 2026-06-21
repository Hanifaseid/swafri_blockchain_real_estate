'use client';

import { useState } from 'react';
import {
  FileClock,
  ChevronDown,
  ChevronUp,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Coins,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  useMyLeases,
  useProposeLease,
  useSignLease,
  useCancelLease,
  useDisputeLease,
  useRespondToDispute,
  useLeaseTimeline,
} from '@/features/leases/queries/lease.queries';
import type { Lease, LeaseStatus } from '@/features/leases/types/lease.types';
import { useAuthStore } from '@/stores/auth.store';

// ─── Config ──────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<LeaseStatus, { label: string; cls: string }> = {
  draft:      { label: 'Draft',      cls: 'bg-zinc-400/15 text-zinc-300 border-zinc-400/30' },
  proposed:   { label: 'Proposed',   cls: 'bg-amber-400/15 text-amber-300 border-amber-400/30' },
  funded:     { label: 'Funded',     cls: 'bg-indigo-400/15 text-indigo-300 border-indigo-400/30' },
  active:     { label: 'Active',     cls: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30' },
  disputed:   { label: 'Disputed',   cls: 'bg-red-400/15 text-red-300 border-red-400/30' },
  completed:  { label: 'Completed',  cls: 'bg-blue-400/15 text-blue-300 border-blue-400/30' },
  terminated: { label: 'Terminated', cls: 'bg-orange-400/15 text-orange-300 border-orange-400/30' },
  cancelled:  { label: 'Cancelled',  cls: 'bg-white/10 text-white/50 border-white/15' },
};

const ESCROW_CFG = {
  none:   { label: 'No escrow',     cls: 'bg-white/8 text-white/40' },
  funded: { label: 'Escrow funded', cls: 'bg-amber-400/15 text-amber-300' },
  active: { label: 'Escrow active', cls: 'bg-emerald-400/15 text-emerald-300' },
  closed: { label: 'Escrow closed', cls: 'bg-zinc-400/15 text-zinc-400' },
};

const TERMINAL = new Set<LeaseStatus>(['completed', 'terminated', 'cancelled']);

// ─── Utilities ────────────────────────────────────────────────────────────────

function fmtDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function fmtMoney(n: number, currency: string) {
  return `${currency} ${n.toLocaleString()}`;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: LeaseStatus }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.cancelled;
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ─── Timeline ────────────────────────────────────────────────────────────────

function TimelineSection({ leaseId }: { leaseId: string }) {
  const { data, isLoading } = useLeaseTimeline(leaseId);

  if (isLoading) {
    return (
      <div className="space-y-2 py-1">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-5 animate-pulse rounded bg-white/5" />
        ))}
      </div>
    );
  }

  const events = data?.events ?? [];
  if (!events.length) {
    return <p className="text-sm text-text-muted">No timeline events yet.</p>;
  }

  return (
    <ol className="space-y-3">
      {events.map((evt, i) => {
        const at = evt.at ?? evt.occurredAt;
        const done = evt.status === 'completed';
        const current = evt.status === 'active';
        return (
          <li key={evt.key ?? i} className="flex items-start gap-3">
            <div className="mt-[5px] shrink-0">
              {done ? (
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              ) : current ? (
                <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-amber-400" />
              ) : (
                <div className="h-2.5 w-2.5 rounded-full border border-white/25" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-sm leading-tight ${done ? 'text-white/80' : current ? 'text-amber-300' : 'text-white/35'}`}>
                {evt.label ?? evt.type}
              </p>
              {at && (
                <p className="mt-0.5 text-xs text-white/35">{fmtDate(at)}</p>
              )}
              {evt.txHash && (
                <p className="mt-0.5 truncate font-mono text-[10px] text-white/25">{evt.txHash}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ─── Lease card ───────────────────────────────────────────────────────────────

type CardMode = 'idle' | 'dispute' | 'respond' | 'cancel';

function LeaseCard({ lease, userId }: { lease: Lease; userId?: string }) {
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<CardMode>('idle');
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeResponse, setDisputeResponse] = useState('');

  const propose = useProposeLease();
  const sign = useSignLease();
  const cancel = useCancelLease();
  const disputeMut = useDisputeLease();
  const respondDispute = useRespondToDispute();

  // Resolve populated fields
  const landlordId = typeof lease.landlord === 'object' ? lease.landlord.id : lease.landlord;
  const tenantId   = typeof lease.tenant   === 'object' ? lease.tenant.id   : lease.tenant;
  const tenantName   = typeof lease.tenant   === 'object' ? (lease.tenant.name   ?? lease.tenant.email)   : null;
  const landlordName = typeof lease.landlord === 'object' ? (lease.landlord.name ?? lease.landlord.email) : null;
  const listingTitle = typeof lease.listing  === 'object' ? (lease.listing as any).title as string | undefined : null;

  const isLandlord = !!userId && landlordId === userId;
  const isTenant   = !!userId && tenantId   === userId;

  const escrowState = lease.escrow?.state ?? 'none';
  const hasSigned   = Boolean(lease.signedByTenantAt);

  const disputeOpenerId   = lease.dispute?.openedBy;
  const disputeResponded  = Boolean(lease.dispute?.respondedAt);

  // Action gates
  const canPropose        = isLandlord && lease.status === 'draft';
  const canSign           = isTenant && lease.status === 'proposed' && !hasSigned;
  const canCancel         = (isLandlord || isTenant) && ['draft', 'proposed'].includes(lease.status);
  const canDispute        = (isLandlord || isTenant) && ['proposed', 'active'].includes(lease.status);
  const canRespondDispute =
    lease.status === 'disputed' &&
    Boolean(disputeOpenerId) &&
    disputeOpenerId !== userId &&
    !disputeResponded;

  const isTerminal    = TERMINAL.has(lease.status);
  const needsAction   = canPropose || canSign || canRespondDispute;
  const anyPending    = propose.isPending || sign.isPending || cancel.isPending ||
                        disputeMut.isPending || respondDispute.isPending;

  // Context hint shown under the subtext
  function statusHint(): string | null {
    if (lease.status === 'draft') {
      return isLandlord ? 'Propose to send to tenant' : 'Awaiting landlord proposal';
    }
    if (lease.status === 'proposed') {
      if (isTenant && !hasSigned) return 'Your signature is required';
      if (escrowState === 'funded')  return 'Escrow funded — awaiting platform activation';
      return hasSigned ? 'Awaiting escrow funding by platform' : 'Awaiting tenant signature';
    }
    if (lease.status === 'disputed') return 'Under dispute — platform reviewing';
    return null;
  }

  const hint = statusHint();

  function resetMode() { setMode('idle'); setDisputeReason(''); setDisputeResponse(''); }

  return (
    <div className={[
      'overflow-hidden rounded-xl border bg-surface-card transition-colors',
      needsAction ? 'border-accent-400/40' :
      lease.status === 'disputed' ? 'border-red-400/40' :
      'border-border-primary',
    ].join(' ')}>

      {/* ── Collapsed header ─────────────────────────────────── */}
      <button className="w-full p-5 text-left" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-semibold text-white">
                {listingTitle ?? `Lease ${lease.id.slice(-8)}`}
              </span>
              {needsAction && (
                <span className="rounded bg-accent-400/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-400">
                  Action needed
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted">
              <span>{fmtMoney(lease.monthlyRent, lease.currency)}/mo</span>
              <span>{fmtDate(lease.startDate)} – {fmtDate(lease.endDate)}</span>
              {isLandlord && tenantName   && <span>Tenant: {tenantName}</span>}
              {isTenant   && landlordName && <span>Landlord: {landlordName}</span>}
            </div>
            {hint && <p className="text-xs text-amber-300/80">{hint}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <StatusBadge status={lease.status} />
            {expanded
              ? <ChevronUp  className="h-4 w-4 text-white/40" />
              : <ChevronDown className="h-4 w-4 text-white/40" />}
          </div>
        </div>
      </button>

      {/* ── Expanded body ─────────────────────────────────────── */}
      {expanded && (
        <div className="space-y-5 border-t border-border-primary px-5 pb-5">

          {/* Financial grid */}
          <div className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-white/40">Monthly rent</p>
              <p className="mt-0.5 font-semibold text-white">{fmtMoney(lease.monthlyRent, lease.currency)}</p>
            </div>
            <div>
              <p className="text-xs text-white/40">Deposit</p>
              <p className="mt-0.5 font-semibold text-white">{fmtMoney(lease.depositAmount, lease.currency)}</p>
            </div>
            {lease.escrowAmount != null && (
              <div>
                <p className="text-xs text-white/40">Total escrow</p>
                <p className="mt-0.5 font-semibold text-white">{fmtMoney(lease.escrowAmount, lease.currency)}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-white/40">Period</p>
              <p className="mt-0.5 text-sm text-white/80">
                {fmtDate(lease.startDate)}
                <br />
                {fmtDate(lease.endDate)}
              </p>
            </div>
          </div>

          {/* Escrow + signature status pills */}
          <div className="flex flex-wrap gap-2">
            {(() => {
              const cfg = ESCROW_CFG[escrowState as keyof typeof ESCROW_CFG] ?? ESCROW_CFG.none;
              return (
                <span className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium ${cfg.cls}`}>
                  <Shield className="h-3.5 w-3.5" />
                  {cfg.label}
                </span>
              );
            })()}
            {hasSigned ? (
              <span className="inline-flex items-center gap-1.5 rounded bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Tenant signed {fmtDate(lease.signedByTenantAt)}
              </span>
            ) : lease.status === 'proposed' ? (
              <span className="inline-flex items-center gap-1.5 rounded bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-300">
                <Clock className="h-3.5 w-3.5" />
                Awaiting tenant signature
              </span>
            ) : null}
          </div>

          {/* On-chain escrow details */}
          {(lease.escrow?.contractAddress || lease.escrow?.fundTxHash) && (
            <div className="rounded-lg border border-white/8 bg-white/4 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-white/40">
                <Coins className="h-3.5 w-3.5" />
                On-chain escrow
              </p>
              {lease.escrow.contractAddress && (
                <p className="break-all font-mono text-xs text-white/50">{lease.escrow.contractAddress}</p>
              )}
              {lease.escrow.escrowId && (
                <p className="mt-0.5 font-mono text-xs text-white/35">ID: {lease.escrow.escrowId}</p>
              )}
              {lease.escrow.fundTxHash && (
                <p className="mt-0.5 truncate font-mono text-xs text-white/35">
                  Fund tx: {lease.escrow.fundTxHash}
                </p>
              )}
              {lease.escrow.activateTxHash && (
                <p className="mt-0.5 truncate font-mono text-xs text-white/35">
                  Activate tx: {lease.escrow.activateTxHash}
                </p>
              )}
              {lease.escrow.settleTxHash && (
                <p className="mt-0.5 truncate font-mono text-xs text-white/35">
                  Settle tx: {lease.escrow.settleTxHash}
                </p>
              )}
            </div>
          )}

          {/* Terms */}
          {lease.terms && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/40">Terms</p>
              <p className="line-clamp-4 text-sm leading-relaxed text-white/60">{lease.terms}</p>
            </div>
          )}

          {/* Dispute panel */}
          {lease.dispute && (
            <div className="rounded-xl border border-red-400/25 bg-red-400/5 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <p className="text-sm font-semibold text-red-300">Dispute</p>
                {lease.dispute.openedAt && (
                  <span className="ml-auto text-xs text-white/35">{fmtDate(lease.dispute.openedAt)}</span>
                )}
              </div>
              {lease.dispute.reason && (
                <div>
                  <p className="mb-0.5 text-xs text-white/40">Reason</p>
                  <p className="text-sm text-white/70">"{lease.dispute.reason}"</p>
                </div>
              )}
              {lease.dispute.response ? (
                <div>
                  <p className="mb-0.5 text-xs text-white/40">
                    Response {lease.dispute.respondedAt ? `· ${fmtDate(lease.dispute.respondedAt)}` : ''}
                  </p>
                  <p className="text-sm text-white/70">"{lease.dispute.response}"</p>
                </div>
              ) : (
                <p className="text-xs italic text-white/35">Awaiting counterparty response</p>
              )}
            </div>
          )}

          {/* Timeline */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Timeline</p>
            <TimelineSection leaseId={lease.id} />
          </div>

          {/* ── Action panel ─────────────────────────────────── */}
          {(!isTerminal || canRespondDispute) && (
            <div className="space-y-4 border-t border-border-primary pt-4">

              {/* Idle — main action buttons */}
              {mode === 'idle' && (
                <div className="flex flex-wrap gap-2">
                  {canPropose && (
                    <Button size="sm" loading={anyPending} onClick={() => propose.mutate(lease.id)}>
                      Propose to tenant
                    </Button>
                  )}
                  {canSign && (
                    <Button
                      size="sm"
                      className="border border-emerald-400/40 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20"
                      loading={anyPending}
                      onClick={() => sign.mutate(lease.id)}
                    >
                      Sign lease
                    </Button>
                  )}
                  {canRespondDispute && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-400/40 text-red-300 hover:bg-red-400/10"
                      onClick={() => setMode('respond')}
                    >
                      Respond to dispute
                    </Button>
                  )}
                  {canDispute && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-orange-400/40 text-orange-300 hover:bg-orange-400/10"
                      onClick={() => setMode('dispute')}
                    >
                      Report dispute
                    </Button>
                  )}
                  {canCancel && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/15 text-white/45 hover:bg-white/5"
                      onClick={() => setMode('cancel')}
                    >
                      Cancel lease
                    </Button>
                  )}
                </div>
              )}

              {/* Dispute form */}
              {mode === 'dispute' && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-white">Report a dispute</p>
                  <textarea
                    className="w-full resize-none rounded-lg border border-border-primary bg-surface-base px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                    rows={3}
                    value={disputeReason}
                    onChange={e => setDisputeReason(e.target.value)}
                    placeholder="Describe the issue (optional)..."
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="border border-orange-400/30 bg-orange-500/15 text-orange-300 hover:bg-orange-500/25"
                      loading={disputeMut.isPending}
                      onClick={() =>
                        disputeMut.mutate(
                          { id: lease.id, reason: disputeReason || undefined },
                          { onSuccess: resetMode }
                        )
                      }
                    >
                      Submit dispute
                    </Button>
                    <Button size="sm" variant="outline" onClick={resetMode}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Respond to dispute */}
              {mode === 'respond' && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-white">Respond to dispute</p>
                  {lease.dispute?.reason && (
                    <p className="text-sm italic text-white/50">"{lease.dispute.reason}"</p>
                  )}
                  <textarea
                    className="w-full resize-none rounded-lg border border-border-primary bg-surface-base px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                    rows={3}
                    value={disputeResponse}
                    onChange={e => setDisputeResponse(e.target.value)}
                    placeholder="Your response (required)..."
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      loading={respondDispute.isPending}
                      disabled={!disputeResponse.trim()}
                      onClick={() =>
                        respondDispute.mutate(
                          { id: lease.id, response: disputeResponse },
                          { onSuccess: resetMode }
                        )
                      }
                    >
                      Submit response
                    </Button>
                    <Button size="sm" variant="outline" onClick={resetMode}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Cancel confirmation */}
              {mode === 'cancel' && (
                <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-medium text-white">Cancel this lease?</p>
                  <p className="text-sm text-white/50">
                    {escrowState === 'funded'
                      ? 'Escrow will be refunded to the tenant automatically.'
                      : 'This cannot be undone.'}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="border border-white/15 bg-white/10 text-white/80 hover:bg-white/15"
                      loading={cancel.isPending}
                      onClick={() => cancel.mutate(lease.id, { onSuccess: () => setMode('idle') })}
                    >
                      Confirm cancel
                    </Button>
                    <Button size="sm" variant="outline" onClick={resetMode}>
                      Keep lease
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Platform note — informational only */}
          {lease.status === 'proposed' && hasSigned && escrowState === 'none' && (
            <p className="rounded-lg border border-white/8 bg-white/4 px-4 py-3 text-xs text-white/40">
              Platform will fund escrow once KYC and wallet verification are complete for both parties.
            </p>
          )}
          {lease.status === 'proposed' && escrowState === 'funded' && (
            <p className="rounded-lg border border-white/8 bg-white/4 px-4 py-3 text-xs text-white/40">
              Escrow is funded. Platform will activate the lease and release the first month's rent to the landlord.
            </p>
          )}
          {lease.status === 'active' && (
            <p className="rounded-lg border border-white/8 bg-white/4 px-4 py-3 text-xs text-white/40">
              Lease is active. Completion, termination, and dispute resolution are handled by the platform operator.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'active' | 'all';

export default function AccountLeasesPage() {
  const { data = [], isLoading } = useMyLeases();
  const { currentUser } = useAuthStore();
  const [tab, setTab] = useState<Tab>('active');

  const allLeases = data as Lease[];
  const activeLeases = allLeases.filter(l => !TERMINAL.has(l.status));
  const displayed: Lease[] = tab === 'active' ? activeLeases : allLeases;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
          Lease escrow
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-white">Leases</h1>
        <p className="mt-1 text-sm text-text-muted">
          Escrow funding, activation, and settlement are handled by the platform operator.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border-primary bg-surface-card p-1">
        {(['active', 'all'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              tab === t ? 'bg-accent-400 text-black' : 'text-text-muted hover:text-white',
            ].join(' ')}
          >
            {t === 'active' ? `Active (${activeLeases.length})` : `All (${allLeases.length})`}
          </button>
        ))}
      </div>

      {/* Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl border border-border-primary bg-surface-card"
            />
          ))}
        </div>
      )}

      {/* Lease list */}
      {!isLoading && (
        <div className="grid gap-3">
          {displayed.map(lease => (
            <LeaseCard key={lease.id} lease={lease} userId={currentUser?.id} />
          ))}
          {displayed.length === 0 && (
            <div className="rounded-xl border border-border-primary bg-surface-card p-8 text-center">
              <FileClock className="mx-auto h-8 w-8 text-accent-400" />
              <p className="mt-3 font-medium text-white">
                {tab === 'active' ? 'No active leases' : 'No leases yet'}
              </p>
              <p className="mt-1 text-sm text-text-muted">
                {tab === 'active'
                  ? 'Your historical leases are in the All tab.'
                  : 'Approved rental applications and lease proposals appear here.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
