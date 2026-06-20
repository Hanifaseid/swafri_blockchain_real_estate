'use client';

import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  useMyRentalApplications,
  useWithdrawRentalApplication,
} from '@/features/rental-applications/queries/rental-application.queries';
import { useAuthStore } from '@/stores/auth.store';

const WITHDRAWABLE = new Set(['submitted', 'screening', 'pending', 'under_review']);

export default function AccountApplicationsPage() {
  const { data = [], isLoading } = useMyRentalApplications();
  const { currentUser } = useAuthStore();
  const withdraw = useWithdrawRentalApplication();
  const isTenant = currentUser?.role === 'TENANT';

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">Rentals</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-white">Rental applications</h1>
      </div>
      <div className="grid gap-3">
        {data.map((application: any) => {
          const status = application.status ?? 'submitted';
          const canWithdraw = isTenant && WITHDRAWABLE.has(status);
          return (
            <div key={application.id} className="rounded-lg border border-border-primary bg-surface-card p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-semibold text-white">
                    {application.listingTitle ?? application.listing?.title ?? 'Rental application'}
                  </h2>
                  <p className="mt-1 text-sm text-text-muted">
                    <span className="font-medium capitalize text-emerald-400">{status}</span>
                    {application.screeningStatus ? `, screening ${application.screeningStatus}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {(application.listingId || application.listing?.id) && (
                    <Link
                      href={`/properties/${application.listingId ?? application.listing.id}`}
                      className="text-sm font-medium text-accent-400"
                    >
                      View listing
                    </Link>
                  )}
                  {canWithdraw && (
                    <Button
                      size="sm"
                      variant="outline"
                      loading={withdraw.isPending}
                      onClick={() => withdraw.mutate(application.id)}
                    >
                      Withdraw
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {!isLoading && data.length === 0 && (
          <div className="rounded-lg border border-border-primary bg-surface-card p-8 text-center">
            <ClipboardList className="mx-auto h-8 w-8 text-accent-400" />
            <p className="mt-3 font-medium text-white">No rental applications yet</p>
            <p className="mt-1 text-sm text-text-muted">Apply from a rental property detail page.</p>
          </div>
        )}
      </div>
    </div>
  );
}
