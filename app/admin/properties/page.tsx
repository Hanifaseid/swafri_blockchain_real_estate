'use client';

import Link from 'next/link';
import { Building2, ShieldCheck } from 'lucide-react';
import { useAdminListings, useAdminListingsStats } from '@/features/listings/queries/listing.queries';
import {
  AdminPageLayout,
  AdminStatCard,
  AdminTable,
  AdminTableRow,
  AdminTableCell,
  AdminLoadingState,
  AdminEmptyState,
} from '@/components/admin/ui';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';

export default function AdminPropertiesPage() {
  const { data, isLoading } = useAdminListings({ limit: 50 });
  const { data: stats, isLoading: statsLoading } = useAdminListingsStats();

  return (
    <AdminPageLayout icon={Building2} label="Admin" title="Properties">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statsLoading ? (
          <div className="col-span-4"><AdminLoadingState size="sm" /></div>
        ) : (
          <>
            <AdminStatCard label="Total"          value={data?.total ?? 0} />
            <AdminStatCard label="Pending Review" value={(stats as any)?.pending ?? (stats as any)?.counts?.pending ?? 0} variant="warning" />
            <AdminStatCard label="Published"      value={(stats as any)?.published ?? (stats as any)?.counts?.published ?? 0} variant="success" />
            <AdminStatCard label="Rejected"       value={(stats as any)?.rejected ?? (stats as any)?.counts?.rejected ?? 0} variant="danger" />
          </>
        )}
      </div>

      {/* Table */}
      <AdminTable
        headers={['Listing', 'Status', 'Verification', 'Action']}
        loading={isLoading}
        empty={
          !isLoading && (data?.items ?? []).length === 0 ? (
            <AdminEmptyState icon={Building2} title="No listings found" />
          ) : undefined
        }
      >
        {(data?.items ?? []).map((listing) => (
          <AdminTableRow key={listing.id}>
            <AdminTableCell>
              <p className="font-medium text-gray-900 truncate max-w-xs">{listing.title}</p>
              <p className="text-xs text-gray-400 truncate">
                {listing.address?.city}, {listing.address?.country}
              </p>
            </AdminTableCell>
            <AdminTableCell>
              <StatusBadge status={listing.status} />
            </AdminTableCell>
            <AdminTableCell>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <ShieldCheck size={13} className="text-gray-400" />
                {listing.verificationStatus}
              </span>
            </AdminTableCell>
            <AdminTableCell>
              <Link
                href={`/admin/properties/${listing.id}`}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Review →
              </Link>
            </AdminTableCell>
          </AdminTableRow>
        ))}
      </AdminTable>

      {!isLoading && (data?.items ?? []).length > 0 && (
        <p className="mt-3 text-xs text-gray-400 font-mono">
          {data?.items.length} of {data?.total ?? 0} listings shown
        </p>
      )}
    </AdminPageLayout>
  );
}
