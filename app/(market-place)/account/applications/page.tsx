'use client';

import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import { useMyRentalApplications } from '@/features/rental-applications/queries/rental-application.queries';

export default function AccountApplicationsPage() {
  const { data = [], isLoading } = useMyRentalApplications();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6f3c]">Rentals</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[#153828]">Rental applications</h1>
      </div>
      <div className="grid gap-3">
        {data.map((application: any) => (
          <div key={application.id} className="rounded-lg border border-[#d5c8b3] bg-white p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold">{application.listingTitle ?? application.listing?.title ?? 'Rental application'}</h2>
                <p className="mt-1 text-sm text-[#5f6b61]">
                  {application.status ?? 'submitted'} {application.screeningStatus ? `, screening ${application.screeningStatus}` : ''}
                </p>
              </div>
              {application.listingId && (
                <Link href={`/properties/${application.listingId}`} className="text-sm font-medium text-[#1e5a3d]">
                  View listing
                </Link>
              )}
            </div>
          </div>
        ))}
        {!isLoading && data.length === 0 && (
          <div className="rounded-lg border border-[#d5c8b3] bg-white p-8 text-center">
            <ClipboardList className="mx-auto h-8 w-8 text-[#8a6f3c]" />
            <p className="mt-3 font-medium">No rental applications yet</p>
            <p className="mt-1 text-sm text-[#5f6b61]">Apply from a rental property detail page.</p>
          </div>
        )}
      </div>
    </div>
  );
}
