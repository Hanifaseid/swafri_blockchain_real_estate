import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { PropertySummary } from '@/components/listing/types';
import { listingToSummary, type Listing } from '@/features/listings/types/listing.types';
import { AxiosError } from 'axios';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SaveFavoriteRequest {
  listingId: string;
}

export interface FavoritesListResponse {
  data: Listing[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const IS_MOCK = typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_API_URL;

function handleError(error: unknown): never {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message ?? error.message;
    throw new Error(message);
  }
  throw error;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const favoritesService = {
  async getFavorites(): Promise<PropertySummary[]> {
    if (IS_MOCK) {
      const ids = JSON.parse(localStorage.getItem('vex_favorites') ?? '[]') as string[];
      return ids.map((id) => ({
        id,
        title: `Saved ${id}`,
        address: '',
        city: '',
        country: '',
        price: 0,
        currency: 'USD',
        image: '',
        listingType: 'rent',
        type: 'residential',
        status: 'active',
        tier: 'basic',
      } as PropertySummary));
    }
    try {
      const { data } = await apiClient.get<FavoritesListResponse>(ENDPOINTS.FAVORITES.LIST);
      return data.data.map(listingToSummary);
    } catch (error) {
      handleError(error);
    }
  },

  async saveFavorite(listingId: string): Promise<void> {
    if (IS_MOCK) {
      const arr = JSON.parse(localStorage.getItem('vex_favorites') ?? '[]') as string[];
      if (!arr.includes(listingId)) arr.push(listingId);
      localStorage.setItem('vex_favorites', JSON.stringify(arr));
      return;
    }
    try {
      await apiClient.post(ENDPOINTS.FAVORITES.SAVE, { listingId } satisfies SaveFavoriteRequest);
    } catch (error) {
      handleError(error);
    }
  },

  async removeFavorite(listingId: string): Promise<void> {
    if (IS_MOCK) {
      const arr = (JSON.parse(localStorage.getItem('vex_favorites') ?? '[]') as string[]).filter(
        (id) => id !== listingId,
      );
      localStorage.setItem('vex_favorites', JSON.stringify(arr));
      return;
    }
    try {
      await apiClient.delete(ENDPOINTS.FAVORITES.REMOVE(listingId));
    } catch (error) {
      handleError(error);
    }
  },
};
