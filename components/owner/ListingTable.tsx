'use client';

import * as React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { Edit2, Eye, Trash2, Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonTable } from '@/components/ui/LoadingSkeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatCurrency } from '@/lib/utils';
import type { PropertySummary } from '@/components/listing/types';

/**
 * ListingTable — owner's listings manager on /dashboard/listings.
 * Wraps DataTable with listing-specific columns and row actions.
 */

interface ListingTableProps {
  listings: PropertySummary[];
  isLoading?: boolean;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export function ListingTable({
  listings,
  isLoading,
  onDelete,
  isDeleting,
}: ListingTableProps) {
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);

  const columns: ColumnDef<PropertySummary>[] = [
    {
      accessorKey: 'title',
      header: 'Property',
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="font-medium text-gray-900 truncate max-w-xs">
            {row.original.title}
          </p>
          <p className="text-xs text-gray-400 truncate">{row.original.city}</p>
        </div>
      ),
    },
    {
      accessorKey: 'listingType',
      header: 'Type',
      cell: ({ getValue }) => (
        <Badge
          status={getValue<string>() === 'sale' ? 'active' : 'rented'}
          label={getValue<string>() === 'sale' ? 'Sale' : 'Rent'}
          hideDot
        />
      ),
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(row.original.price, row.original.currency ?? 'USD')}
          {row.original.listingType === 'rent' && (
            <span className="font-normal text-gray-400">/mo</span>
          )}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <Badge status={getValue<string>()} />,
    },
    {
      accessorKey: 'tier',
      header: 'Tier',
      cell: ({ getValue }) => {
        const tier = getValue<string>();
        if (!tier) return <span className="text-gray-400 text-xs">—</span>;
        return (
          <span className="capitalize text-xs font-medium text-gray-700">{tier}</span>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip content="View listing">
            <Button variant="ghost" size="icon" asChild>
              <Link
                href={`/listings/${row.original.id}`}
                aria-label={`View ${row.original.title}`}
              >
                <Eye size={15} />
              </Link>
            </Button>
          </Tooltip>

          <Tooltip content="Edit listing">
            <Button variant="ghost" size="icon" asChild>
              <Link
                href={`/dashboard/listings/${row.original.id}/edit`}
                aria-label={`Edit ${row.original.title}`}
              >
                <Edit2 size={15} />
              </Link>
            </Button>
          </Tooltip>

          {onDelete && (
            <Tooltip content="Delete listing">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteTarget(row.original.id)}
                aria-label={`Delete ${row.original.title}`}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50"
              >
                <Trash2 size={15} />
              </Button>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) return <SkeletonTable rows={5} cols={5} />;

  if (!listings.length) {
    return (
      <EmptyState
        title="No listings yet"
        description="Create your first property listing to get started."
        action={
          <Button asChild>
            <Link href="/dashboard/listings/new">
              <Plus size={15} />
              Add Listing
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <DataTable columns={columns} data={listings} pageSize={12} />

      {onDelete && (
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
          title="Delete listing"
          description="This listing will be permanently removed. This action cannot be undone."
          confirmLabel="Delete"
          confirmVariant="destructive"
          loading={isDeleting}
          onConfirm={() => {
            if (deleteTarget) onDelete(deleteTarget);
            setDeleteTarget(null);
          }}
        />
      )}
    </>
  );
}
