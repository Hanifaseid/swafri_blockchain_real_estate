'use client';

import { FileClock } from 'lucide-react';
import { useLeaseTimeline, useMyLeases } from '@/features/leases/queries/lease.queries';
import type { Lease } from '@/features/leases/types/lease.types';

function LeaseRow({ lease }: { lease: Lease }) {
  const timeline = useLeaseTimeline(lease.id);
  const latest = timeline.data?.events?.[timeline.data.events.length - 1];

  return (
    <div className="rounded-lg border border-[#d5c8b3] bg-white p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="font-semibold">Lease {lease.id.slice(-8)}</h2>
          <p className="mt-1 text-sm text-[#5f6b61]">
            {lease.currency} {lease.monthlyRent.toLocaleString()}/mo, deposit {lease.depositAmount.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-[#6d766d]">
            {lease.startDate} to {lease.endDate}
          </p>
        </div>
        <span className="rounded-full bg-[#e7f0e8] px-3 py-1 text-xs font-semibold text-[#163c2c]">
          {lease.status}
        </span>
      </div>
      <div className="mt-4 rounded-lg bg-[#f7f2e8] p-3 text-sm">
        <p className="font-medium">Latest timeline event</p>
        <p className="mt-1 text-[#5f6b61]">
          {latest?.label ?? latest?.type ?? 'Timeline will appear after lease activity.'}
        </p>
      </div>
    </div>
  );
}

export default function AccountLeasesPage() {
  const { data = [], isLoading } = useMyLeases();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6f3c]">Lease escrow</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[#153828]">Leases</h1>
      </div>
      <div className="grid gap-3">
        {data.map((lease) => (
          <LeaseRow key={lease.id} lease={lease} />
        ))}
        {!isLoading && data.length === 0 && (
          <div className="rounded-lg border border-[#d5c8b3] bg-white p-8 text-center">
            <FileClock className="mx-auto h-8 w-8 text-[#8a6f3c]" />
            <p className="mt-3 font-medium">No leases yet</p>
            <p className="mt-1 text-sm text-[#5f6b61]">Accepted rental applications and lease proposals appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
