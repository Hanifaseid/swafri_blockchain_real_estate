import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { favoritesService } from "@/features/favorites/services/favorite.service";
import { queryKeys } from "@/lib/query/query-keys";
import { listingToSummary } from "@/features/listings/types/listing.types";
import type { PropertySummary } from "@/components/listing/types";
import type { Listing } from "@/features/listings/types/listing.types";

// Normalise whatever the API returns — full Listing or already-mapped PropertySummary
function normalise(item: PropertySummary | Listing): PropertySummary {
  if (typeof item.address === "object")
    return listingToSummary(item as Listing);
  return item as PropertySummary;
}

// ── Query Keys ────────────────────────────────────────────────────────────────

export const favoriteKeys = queryKeys.favorites;

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useFavorites() {
  return useQuery({
    queryKey: favoriteKeys.all(),
    queryFn: favoritesService.getFavorites,
    staleTime: 60_000,
    select: (data) => data.map(normalise),
  });
}

export function useSaveFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (listingId: string) => favoritesService.saveFavorite(listingId),
    onMutate: async (listingId) => {
      await qc.cancelQueries({ queryKey: favoriteKeys.all() });
      const prev = qc.getQueryData<PropertySummary[]>(favoriteKeys.all());
      qc.setQueryData<PropertySummary[]>(favoriteKeys.all(), (old = []) =>
        old.some((p) => p.id === listingId)
          ? old
          : [...old, { id: listingId } as PropertySummary],
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      qc.setQueryData(favoriteKeys.all(), ctx?.prev);
      toast.error("Failed to save listing.");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: favoriteKeys.all() }),
  });
}

export function useRemoveFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (listingId: string) =>
      favoritesService.removeFavorite(listingId),
    onMutate: async (listingId) => {
      await qc.cancelQueries({ queryKey: favoriteKeys.all() });
      const prev = qc.getQueryData<PropertySummary[]>(favoriteKeys.all());
      qc.setQueryData<PropertySummary[]>(favoriteKeys.all(), (old = []) =>
        old.filter((p) => p.id !== listingId),
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      qc.setQueryData(favoriteKeys.all(), ctx?.prev);
      toast.error("Failed to remove listing.");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: favoriteKeys.all() }),
  });
}
