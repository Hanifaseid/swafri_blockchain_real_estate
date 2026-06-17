'use client';

import { ListingTable } from '@/components/owner/ListingTable';
import { useListings } from '@/features/listings/queries/listings.queries';
import { useDeleteListing } from '@/features/listings/queries/listings.queries';

export function ListingsManagerClient() {
  const { data, isLoading }           = useListings({ pageSize: 50 });
  const { mutate: deleteListing, isPending: isDeleting } = useDeleteListing();

  return (
    <ListingTable
      listings={data?.items ?? []}
      isLoading={isLoading}
      onDelete={deleteListing}
      isDeleting={isDeleting}
    />
  );
}
