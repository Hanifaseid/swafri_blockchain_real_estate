'use client';

import { FileClock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  useLeaseTimeline,
  useMyLeases,
  useProposeLease,
  useSignLease,
  useCancelLease,
  useDisputeLease,
} from '@/features/leases/queries/lease.queries';
import type { Lease } from '@/features/leases/types/lease.types';
import { useAuthStore } from '@/stores/auth.store';

function LeaseRow({ lease, userId }: { lease: Lease; userId?: string }) {
  const timeline = useLeaseTimeline(lease.id);
  const latest = timeline.data?.events?.[timeline.data.events.length - 1];

  const propose = useProposeLease();
  const sign = useSignLease();
  const cancel = useCancelLease();
  const dispute = useDisputeLease();

  const isLandlord = !!userId && lease.landlord === userId;
  const isTenant = !!userId && lease.tenant === userId;

  const canPropose = isLandlord && lease.status === 'draft';
  const canSign = isTenant && lease.status === 'proposed';
  const canCancel = (isLandlord || isTenant) && ['draft', 'proposed'].includes(lease.status);
  const canDispute = (isLandlord || isTenant) && ['proposed', 'active'].includes(lease.status);
  const hasActions = canPropose || canSign || canCancel || canDispute;
  const busy =
    propose.isPending || sign.isPending || cancel.isPending || dispute.isPending;

  return (
    <div className="rounded-lg border border-border-primary bg-surface-card p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="font-semibold text-white">Lease {lease.id.slice(-8)}</h2>
          <p className="mt-1 text-sm text-text-muted">
            {lease.currency} {lease.monthlyRent.toLocaleString()}/mo, deposit{' '}
            {lease.depositAmount.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {lease.startDate} to {lease.endDate}
          </p>
        </div>
        <span className="rounded-full bg-surface-success px-3 py-1 text-xs font-semibold capitalize text-emerald-400">
          {lease.status}
        </span>
      </div>

      <div className="mt-4 rounded-lg bg-surface-highlight p-3 text-sm">
        <p className="font-medium text-white">Latest timeline event</p>
        <p className="mt-1 text-text-muted">
          {latest?.label ?? latest?.type ?? 'Timeline will appear after lease activity.'}
        </p>
      </div>

      {hasActions && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border-secondary pt-3">
          {canPropose && (
            <Button size="sm" loading={busy} onClick={() => propose.mutate(lease.id)}>
              Propose to tenant
            </Button>
          )}
          {canSign && (
            <Button size="sm" loading={busy} onClick={() => sign.mutate(lease.id)}>
              Sign lease
            </Button>
          )}
          {canDispute && (
            <Button size="sm" variant="outline" loading={busy} onClick={() => dispute.mutate(lease.id)}>
              Report dispute
            </Button>
          )}
          {canCancel && (
            <Button size="sm" variant="destructive" loading={busy} onClick={() => cancel.mutate(lease.id)}>
              Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function AccountLeasesPage() {
  const { data = [], isLoading } = useMyLeases();
  const { currentUser } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">Lease escrow</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-white">Leases</h1>
        <p className="mt-1 text-sm text-text-muted">
          Funding, activation, and settlement are handled by the platform escrow operator.
        </p>
      </div>
      <div className="grid gap-3">
        {data.map((lease) => (
          <LeaseRow key={lease.id} lease={lease} userId={currentUser?.id} />
        ))}
        {!isLoading && data.length === 0 && (
          <div className="rounded-lg border border-border-primary bg-surface-card p-8 text-center">
            <FileClock className="mx-auto h-8 w-8 text-accent-400" />
            <p className="mt-3 font-medium text-white">No leases yet</p>
            <p className="mt-1 text-sm text-text-muted">
              Accepted rental applications and lease proposals appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
