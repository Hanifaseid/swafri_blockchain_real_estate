import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { listingsService } from '../services/listings.service';
import { queryKeys } from '@/lib/query/query-keys';
import type { PropertyFilters } from '../types';

/**
 * listings.queries.ts — React Query hooks for listing data.
 */

export function useListings(filters?: PropertyFilters) {
  return useQuery({
    queryKey: queryKeys.listings.list(filters),
    queryFn: () => listingsService.getListings(filters),
  });
}

export function useFeaturedListings() {
  return useQuery({
    queryKey: queryKeys.listings.featured,
    queryFn: listingsService.getFeatured,
    staleTime: 5 * 60 * 1000, // 5 min — featured listings don't change often
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: queryKeys.listings.detail(id),
    queryFn: () => listingsService.getListing(id),
    enabled: !!id,
  });
}

export function useDeleteListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: listingsService.deleteListing,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.listings.all });
      toast.success('Listing deleted.');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateListing(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof listingsService.updateListing>[1]) =>
      listingsService.updateListing(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.listings.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.listings.all });
      toast.success('Listing updated.');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
