import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  SavedSearch,
  CreateSavedSearchInput,
  UpdateSavedSearchInput,
} from '@/features/saved-searches/types/saved-search.types';

type RawItem = Record<string, unknown>;

function normalizeId(item: RawItem): RawItem {
  if (!item.id && item._id) return { ...item, id: item._id };
  return item;
}

function extractArray<T>(data: unknown): T[] {
  const d = data as RawItem;
  let arr: RawItem[] = [];
  if (Array.isArray(d))                        arr = d;
  else if (Array.isArray(d?.data))             arr = d.data as RawItem[];
  else if (Array.isArray((d?.data as RawItem)?.items)) arr = (d.data as RawItem).items as RawItem[];
  return arr.map(normalizeId) as T[];
}

function extractOne<T>(data: unknown): T {
  const d = data as RawItem;
  const item = (d?.data ?? d) as RawItem;
  return normalizeId(item) as T;
}

export async function getSavedSearches(): Promise<SavedSearch[]> {
  const { data } = await apiClient.get(ENDPOINTS.SAVED_SEARCHES.LIST);
  return extractArray<SavedSearch>(data);
}

export async function createSavedSearch(input: CreateSavedSearchInput): Promise<SavedSearch> {
  const { data } = await apiClient.post(ENDPOINTS.SAVED_SEARCHES.CREATE, input);
  return extractOne<SavedSearch>(data);
}

export async function updateSavedSearch(id: string, input: UpdateSavedSearchInput): Promise<SavedSearch> {
  const { data } = await apiClient.patch(ENDPOINTS.SAVED_SEARCHES.UPDATE(id), input);
  return extractOne<SavedSearch>(data);
}

export async function deleteSavedSearch(id: string): Promise<void> {
  await apiClient.delete(ENDPOINTS.SAVED_SEARCHES.DELETE(id));
}
