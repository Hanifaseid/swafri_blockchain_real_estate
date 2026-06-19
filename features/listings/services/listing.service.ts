import { apiClient } from "@/lib/api/axios-client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  Listing,
  CreateListingInput,
  ListingFilters,
  PaginatedListings,
  TransitionInput,
  CreateSavedSearchInput,
  SavedSearch,
} from "@/features/listings/types/listing.types";

// ─── Response helpers ─────────────────────────────────────────────────────────

interface ApiResp<T> {
  success: boolean;
  message: string;
  data: T;
}
interface ApiPaginatedResp<T> {
  success: boolean;
  message: string;
  data: T[];
  meta?: { page: number; limit: number; total: number };
  items?: T[];
  total?: number;
  page?: number;
  limit?: number;
}

function extractList<T>(data: ApiPaginatedResp<T>): {
  items: T[];
  total: number;
  page: number;
  limit: number;
} {
  const d = data as unknown as Record<string, unknown>;

  // Shape: { data: { items: [...], total, page, limit } } — what the real API returns
  if (d.data && typeof d.data === "object" && !Array.isArray(d.data)) {
    const nested = d.data as Record<string, unknown>;
    if (Array.isArray(nested.items)) {
      return {
        items: nested.items as T[],
        total: (nested.total as number) ?? (nested.items as T[]).length,
        page: (nested.page as number) ?? 1,
        limit: (nested.limit as number) ?? (nested.items as T[]).length,
      };
    }
  }

  // Shape: { data: [...] }
  if (Array.isArray(d.data)) {
    const items = d.data as T[];
    const meta = d.meta as
      | { page: number; limit: number; total: number }
      | undefined;
    return {
      items,
      total: meta?.total ?? (d.total as number) ?? items.length,
      page: meta?.page ?? (d.page as number) ?? 1,
      limit: meta?.limit ?? (d.limit as number) ?? items.length,
    };
  }

  // Shape: top-level { items: [...] }
  if (Array.isArray(d.items)) {
    const items = d.items as T[];
    return {
      items,
      total: (d.total as number) ?? items.length,
      page: (d.page as number) ?? 1,
      limit: (d.limit as number) ?? items.length,
    };
  }

  return { items: [], total: 0, page: 1, limit: 20 };
}

// ─── getListings (public discovery) ──────────────────────────────────────────
// GET /listings — published listings with filters

export async function getListings(
  filters?: ListingFilters,
): Promise<PaginatedListings> {
  try {
    const params: Record<string, string | number | boolean | string[]> = {};
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          // Special handling for polygon: JSON-stringify the array
          if (k === 'polygon' && Array.isArray(v)) {
            params[k] = JSON.stringify(v);
          }
          // Special handling for amenities: can be string or string[]
          else if (k === 'amenities') {
            params[k] = v;
          }
          else {
            params[k] = v as string | number | boolean;
          }
        }
      });
    }
    const { data } = await apiClient.get<ApiPaginatedResp<Listing>>(
      ENDPOINTS.LISTINGS.DISCOVER,
      { params },
    );
    return extractList(data);
  } catch {
    return { items: [], total: 0, page: 1, limit: 20 };
  }
}

export async function createSavedSearch(
  input: CreateSavedSearchInput,
): Promise<SavedSearch> {
  const payload = {
    name: input.name,
    alertEnabled: input.alertEnabled ?? false,
    query: {
      ...(input.query.listingType && { listingType: input.query.listingType }),
      ...(input.query.category && { category: input.query.category }),
      ...(input.query.minPrice != null && { minPrice: input.query.minPrice }),
      ...(input.query.maxPrice != null && { maxPrice: input.query.maxPrice }),
      ...(input.query.minBedrooms != null && {
        minBedrooms: input.query.minBedrooms,
      }),
      ...(input.query.minBathrooms != null && {
        minBathrooms: input.query.minBathrooms,
      }),
    },
  };
  const { data } = await apiClient.post<ApiResp<SavedSearch>>(
    ENDPOINTS.SAVED_SEARCHES.CREATE,
    payload,
  );
  if (!data.success) throw new Error(data.message);
  return data.data;
}

export async function getSavedSearches(): Promise<SavedSearch[]> {
  try {
    const { data } = await apiClient.get<ApiResp<SavedSearch[]>>(
      ENDPOINTS.SAVED_SEARCHES.LIST,
    );
    return data.success ? (Array.isArray(data.data) ? data.data : []) : [];
  } catch {
    return [];
  }
}

export async function updateSavedSearch(
  id: string,
  input: Partial<CreateSavedSearchInput>,
): Promise<SavedSearch> {
  const { data } = await apiClient.patch<ApiResp<SavedSearch>>(
    ENDPOINTS.SAVED_SEARCHES.UPDATE(id),
    input,
  );
  if (!data.success) throw new Error(data.message);
  return data.data;
}

export async function deleteSavedSearch(id: string): Promise<void> {
  await apiClient.delete(ENDPOINTS.SAVED_SEARCHES.DELETE(id));
}

// ─── getMyListings ────────────────────────────────────────────────────────────
// GET /listings/mine — owner's own listings

export async function getMyListings(): Promise<Listing[]> {
  try {
    const { data } = await apiClient.get<
      ApiResp<Listing[]> | ApiPaginatedResp<Listing>
    >(ENDPOINTS.LISTINGS.MINE);
    if (Array.isArray((data as ApiResp<Listing[]>).data))
      return (data as ApiResp<Listing[]>).data;
    return extractList(data as ApiPaginatedResp<Listing>).items;
  } catch {
    return [];
  }
}

// ─── getListing ───────────────────────────────────────────────────────────────

export async function getListing(id: string): Promise<Listing | null> {
  try {
    const { data } = await apiClient.get<ApiResp<Listing>>(
      ENDPOINTS.LISTINGS.DETAIL(id),
    );
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

// ─── createListing ────────────────────────────────────────────────────────────

export async function createListing(
  input: CreateListingInput,
): Promise<Listing> {
  const { data } = await apiClient.post<ApiResp<Listing>>(
    ENDPOINTS.LISTINGS.CREATE,
    input,
  );
  if (!data.success) throw new Error(data.message);
  return data.data;
}

// ─── updateListing ────────────────────────────────────────────────────────────

export async function updateListing(
  id: string,
  input: Partial<CreateListingInput>,
): Promise<Listing> {
  const { data } = await apiClient.patch<ApiResp<Listing>>(
    ENDPOINTS.LISTINGS.UPDATE(id),
    input,
  );
  if (!data.success) throw new Error(data.message);
  return data.data;
}

// ─── deleteListing ────────────────────────────────────────────────────────────

export async function deleteListing(id: string): Promise<void> {
  await apiClient.delete(ENDPOINTS.LISTINGS.DELETE(id));
}

// ─── transitionListing ───────────────────────────────────────────────────────

export async function transitionListing(
  id: string,
  input: TransitionInput,
): Promise<Listing> {
  const { data } = await apiClient.post<ApiResp<Listing>>(
    ENDPOINTS.LISTINGS.TRANSITION(id),
    input,
  );
  if (!data.success) throw new Error(data.message);
  return data.data;
}

// ─── Admin: getAdminListings ──────────────────────────────────────────────────

export async function getAdminListings(
  params?: Record<string, string | number>,
): Promise<PaginatedListings> {
  try {
    const { data } = await apiClient.get<ApiPaginatedResp<Listing>>(
      ENDPOINTS.ADMIN.LISTINGS,
      { params },
    );
    return extractList(data);
  } catch {
    return { items: [], total: 0, page: 1, limit: 20 };
  }
}

// ─── Admin: getAdminListingsStats ───────────────────────────────────────────────

export async function getAdminListingsStats(): Promise<Record<string, unknown> | null> {
  try {
    const { data } = await apiClient.get<ApiResp<Record<string, unknown>>>(
      ENDPOINTS.ADMIN.LISTINGS_STATS,
    );
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

// ─── Duplicate Detection ───────────────────────────────────────────────────────

export interface DuplicateHint {
  id: string;
  title: string;
  status: string;
  reasons: string[];
}

export async function getListingDuplicates(id: string): Promise<DuplicateHint[]> {
  try {
    const { data } = await apiClient.get<ApiResp<DuplicateHint[]>>(
      ENDPOINTS.LISTINGS.DUPLICATES(id),
    );
    return data.success ? (Array.isArray(data.data) ? data.data : []) : [];
  } catch {
    return [];
  }
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface ListingAnalytics {
  listingId: string;
  counts: {
    view: number;
    favorite: number;
    inquiry: number;
    offer: number;
    rental_application: number;
  };
  uniqueViewers: number;
  leadCount: number;
  conversionRate: number;
  lastEventAt?: string;
}

export async function getListingAnalytics(
  id: string,
): Promise<ListingAnalytics | null> {
  try {
    const { data } = await apiClient.get<ApiResp<ListingAnalytics>>(
      `/listings/${id}/analytics`,
    );
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

// ─── Owner dashboard stats ────────────────────────────────────────────────────

export async function getListingDashboard(): Promise<Record<
  string,
  unknown
> | null> {
  try {
    const { data } = await apiClient.get<ApiResp<Record<string, unknown>>>(
      ENDPOINTS.LISTINGS.DASHBOARD,
    );
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

// ─── Documents ────────────────────────────────────────────────────────────────

export interface ListingDocument {
  id: string;
  type: string;
  status: string;
  hash?: string;
  reviewNote?: string;
  uploadedAt: string;
}

export async function getListingDocuments(
  id: string,
): Promise<ListingDocument[]> {
  try {
    const { data } = await apiClient.get<ApiResp<ListingDocument[]>>(
      ENDPOINTS.LISTINGS.LIST_DOCS(id),
    );
    return data.success ? (Array.isArray(data.data) ? data.data : []) : [];
  } catch {
    return [];
  }
}

export async function getDocumentSignedUrl(
  listingId: string,
  docId: string,
): Promise<string | null> {
  try {
    const { data } = await apiClient.get<any>(
      ENDPOINTS.LISTINGS.DOC_URL(listingId, docId),
    );
    if (typeof data === "string" && data.startsWith("http")) return data;
    if (data?.url) return data.url;
    if (data?.data?.url) return data.data.url;
    if (typeof data?.data === "string" && data.data.startsWith("http"))
      return data.data;
    return null;
  } catch {
    return null;
  }
}

export async function reviewDocument(
  listingId: string,
  docId: string,
  input: { decision: "approve" | "reject"; note?: string },
): Promise<void> {
  await apiClient.post(
    ENDPOINTS.ADMIN.DOC_REVIEW(listingId, docId),
    input,
  );
}

// ─── Photos ───────────────────────────────────────────────────────────────────

export async function uploadPhotos(
  listingId: string,
  files: File[],
): Promise<void> {
  const form = new FormData();
  files.forEach((f) => form.append("photos", f));
  try {
    await apiClient.post(ENDPOINTS.LISTINGS.UPLOAD_PHOTOS(listingId), form, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 0,
    });
  } catch (error: any) {
    const errData = error.response?.data;
    if (errData) {
      if (errData.stack && errData.stack.includes("MulterError")) {
        throw new Error(errData.stack.split("\n")[0]);
      }
      throw new Error(errData.message || "Upload failed");
    }
    throw error;
  }
}

export async function deletePhoto(
  listingId: string,
  publicId: string,
): Promise<void> {
  await apiClient.delete(ENDPOINTS.LISTINGS.DELETE_PHOTO(listingId), {
    data: { publicId },
  });
}

export async function setCoverPhoto(
  listingId: string,
  publicId: string,
): Promise<void> {
  await apiClient.patch(ENDPOINTS.LISTINGS.SET_COVER(listingId), { publicId });
}

export async function reorderPhotos(
  listingId: string,
  order: string[],
): Promise<void> {
  await apiClient.patch(ENDPOINTS.LISTINGS.REORDER_PHOTOS(listingId), {
    order,
  });
}

// ─── On-chain title ───────────────────────────────────────────────────────────

export interface TitleInfo {
  tokenId: string;
  contractAddress: string;
  owner: string;
  onChainHash: string;
  offChainHash: string;
  verified: boolean;
}

export async function getListingTitle(id: string): Promise<TitleInfo | null> {
  try {
    const { data } = await apiClient.get<ApiResp<TitleInfo>>(
      ENDPOINTS.LISTINGS.GET_TITLE(id),
    );
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function mintTitle(id: string): Promise<Listing> {
  const { data } = await apiClient.post<ApiResp<Listing>>(
    ENDPOINTS.LISTINGS.MINT_TITLE(id),
  );
  if (!data.success) throw new Error(data.message);
  return data.data;
}

export async function disputeTitle(id: string, reason: string): Promise<void> {
  await apiClient.post(ENDPOINTS.LISTINGS.DISPUTE_TITLE(id), { reason });
}

export async function clearTitleDispute(
  id: string,
  reason: string,
): Promise<void> {
  await apiClient.post(ENDPOINTS.LISTINGS.CLEAR_DISPUTE(id), { reason });
}

export async function revokeTitle(id: string, reason: string): Promise<void> {
  await apiClient.post(ENDPOINTS.LISTINGS.REVOKE_TITLE(id), { reason });
}
