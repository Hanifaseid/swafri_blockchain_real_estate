import { apiClient } from "@/lib/api/axios-client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  Listing,
  CreateListingInput,
  ListingFilters,
  ListingCluster,
  ListingClusterFilters,
  PaginatedListings,
  TransitionInput,
  CreateSavedSearchInput,
  SavedSearch,
  ListingCluster,
  GeocodeResult,
  ReverseGeocodeResult,
  Neighborhood,
  NeighborhoodAnalytics,
  MaintenanceRecord,
  CreateMaintenanceRecordInput,
  YieldSummary,
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

function unwrapData<T>(payload: unknown, fallback: T): T {
  const value = payload as Record<string, unknown>;
  if (value?.data !== undefined) {
    const nested = value.data as Record<string, unknown>;
    if (nested?.data !== undefined) return nested.data as T;
    return value.data as T;
  }
  return (payload as T) ?? fallback;
}

// ─── getListings (public discovery) ──────────────────────────────────────────
// GET /listings — published listings with filters

function serializeDiscoveryParams(
  filters?: ListingFilters | ListingClusterFilters,
): URLSearchParams {
  const params = new URLSearchParams();

  if (!filters) return params;

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;

    if (key === 'polygon' && Array.isArray(value)) {
      params.append(key, JSON.stringify(value));
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== '') {
          params.append(key, String(item));
        }
      });
      return;
    }

    params.append(key, String(value));
  });

  return params;
}

export async function getListings(
  filters?: ListingFilters,
): Promise<PaginatedListings> {
  try {
    const { data } = await apiClient.get<ApiPaginatedResp<Listing>>(
      ENDPOINTS.LISTINGS.DISCOVER,
      { params: serializeDiscoveryParams(filters) },
    );
    return extractList(data);
  } catch {
    return { items: [], total: 0, page: 1, limit: 20 };
  }
}

export async function getListingClusters(
  filters?: ListingFilters & { zoom?: number },
): Promise<ListingCluster[]> {
  try {
    const params: Record<string, string | number | boolean | string[]> = {};
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        params[k] =
          k === "polygon" && Array.isArray(v)
            ? JSON.stringify(v)
            : (v as string | number | boolean | string[]);
      });
    }
    const { data } = await apiClient.get<unknown>(ENDPOINTS.LISTINGS.CLUSTERS, {
      params,
    });
    const unwrapped = unwrapData<ListingCluster[] | { items?: ListingCluster[] }>(
      data,
      [],
    );
    return Array.isArray(unwrapped) ? unwrapped : unwrapped.items ?? [];
  } catch {
    return [];
  }
}

export async function geocode(query: string): Promise<GeocodeResult[]> {
  if (!query.trim()) return [];
  try {
    const { data } = await apiClient.get<unknown>(ENDPOINTS.GEO.GEOCODE, {
      params: { q: query },
    });
    const unwrapped = unwrapData<GeocodeResult[] | { items?: GeocodeResult[] }>(
      data,
      [],
    );
    return Array.isArray(unwrapped) ? unwrapped : unwrapped.items ?? [];
  } catch {
    return [];
  }
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<ReverseGeocodeResult | null> {
  try {
    const { data } = await apiClient.get<unknown>(ENDPOINTS.GEO.REVERSE, {
      params: { lat, lng },
    });
    return unwrapData<ReverseGeocodeResult | null>(data, null);
  } catch {
    return null;
  }
}

export async function getNeighborhoods(params?: {
  city?: string;
  country?: string;
  q?: string;
  page?: number;
  limit?: number;
}): Promise<Neighborhood[]> {
  try {
    const { data } = await apiClient.get<unknown>(ENDPOINTS.GEO.NEIGHBORHOODS, {
      params,
    });
    const unwrapped = unwrapData<Neighborhood[] | { items?: Neighborhood[] }>(
      data,
      [],
    );
    return Array.isArray(unwrapped) ? unwrapped : unwrapped.items ?? [];
  } catch {
    return [];
  }
}

export async function getNeighborhoodAnalytics(
  id: string,
): Promise<NeighborhoodAnalytics | null> {
  try {
    const { data } = await apiClient.get<unknown>(
      ENDPOINTS.GEO.NEIGHBORHOOD_ANALYTICS(id),
    );
    return unwrapData<NeighborhoodAnalytics | null>(data, null);
  } catch {
    return null;
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
      ...(input.query.swLng != null && { swLng: input.query.swLng }),
      ...(input.query.swLat != null && { swLat: input.query.swLat }),
      ...(input.query.neLng != null && { neLng: input.query.neLng }),
      ...(input.query.neLat != null && { neLat: input.query.neLat }),
      ...(input.query.lng != null && { lng: input.query.lng }),
      ...(input.query.lat != null && { lat: input.query.lat }),
      ...(input.query.radius != null && { radius: input.query.radius }),
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
    const { data } = await apiClient.get<ApiResp<ListingCluster[]>>(
      ENDPOINTS.LISTINGS.CLUSTERS,
      { params: serializeDiscoveryParams(filters) },
    );
    return data.success && Array.isArray(data.data) ? data.data : [];
  } catch {
    return [];
  }
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
      ENDPOINTS.LISTINGS.ANALYTICS(id),
    );
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function getListingYield(id: string): Promise<YieldSummary | null> {
  try {
    const { data } = await apiClient.get<unknown>(ENDPOINTS.LISTINGS.YIELD(id));
    return unwrapData<YieldSummary | null>(data, null);
  } catch {
    return null;
  }
}

export async function getMaintenanceRecords(
  id: string,
): Promise<MaintenanceRecord[]> {
  try {
    const { data } = await apiClient.get<unknown>(
      ENDPOINTS.LISTINGS.MAINTENANCE(id),
    );
    const unwrapped = unwrapData<
      MaintenanceRecord[] | { items?: MaintenanceRecord[] }
    >(data, []);
    return Array.isArray(unwrapped) ? unwrapped : unwrapped.items ?? [];
  } catch {
    return [];
  }
}

export async function createMaintenanceRecord(
  id: string,
  input: CreateMaintenanceRecordInput,
): Promise<MaintenanceRecord> {
  const { data } = await apiClient.post<unknown>(
    ENDPOINTS.LISTINGS.MAINTENANCE(id),
    input,
  );
  const record = unwrapData<MaintenanceRecord | null>(data, null);
  if (!record) throw new Error("Failed to create maintenance record.");
  return record;
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

export type ListingDocumentType =
  | "title_deed"
  | "tax_record"
  | "utility_bill"
  | "ownership_certificate"
  | "lease_authority"
  | "government_doc"
  | "government_document"
  | "other";

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

export async function uploadListingDocuments(
  listingId: string,
  type: ListingDocumentType,
  files: File[],
): Promise<void> {
  const form = new FormData();
  form.append("type", type);
  files.forEach((file) => form.append("documents", file));

  try {
    await apiClient.post(ENDPOINTS.LISTINGS.UPLOAD_DOCS(listingId), form, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 0,
    });
  } catch (error: any) {
    const errData = error.response?.data;
    if (errData) {
      throw new Error(errData.message || "Document upload failed");
    }
    throw error;
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

export async function uploadDocuments(
  listingId: string,
  files: File[],
  type: string,
): Promise<void> {
  const form = new FormData();
  files.forEach((f) => form.append("documents", f));
  form.append("type", type);
  try {
    await apiClient.post(ENDPOINTS.LISTINGS.UPLOAD_DOCS(listingId), form, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 0,
    });
  } catch (error: any) {
    const errData = error.response?.data;
    if (errData) {
      if (errData.stack && errData.stack.includes("MulterError")) {
        throw new Error(errData.stack.split("\n")[0]);
      }
      throw new Error(errData.message || "Document upload failed");
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
  status?: string;
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

// ─── Rental Yield ───────────────────────────────────────────────────────────────

export async function getListingRentalYield(id: string): Promise<YieldSummary | null> {
  try {
    const { data } = await apiClient.get<ApiResp<YieldSummary>>(
      ENDPOINTS.LISTINGS.RENTAL_YIELD(id)
    );
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function getYieldDashboard(): Promise<YieldDashboard | null> {
  try {
    const { data } = await apiClient.get<ApiResp<YieldDashboard>>(
      ENDPOINTS.LISTINGS.DASHBOARD_YIELD
    );
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

// ─── Maintenance Records ───────────────────────────────────────────────────────

export async function createMaintenanceRecord(
  listingId: string,
  input: CreateMaintenanceInput
): Promise<MaintenanceRecord> {
  const { data } = await apiClient.post<ApiResp<MaintenanceRecord>>(
    ENDPOINTS.LISTINGS.MAINTENANCE(listingId),
    input
  );
  if (!data.success) throw new Error(data.message);
  return data.data;
}

export async function getMaintenanceRecords(
  listingId: string,
  params?: {
    type?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }
): Promise<MaintenanceRecordsResponse> {
  try {
    const { data } = await apiClient.get<ApiPaginatedResp<MaintenanceRecord>>(
      ENDPOINTS.LISTINGS.MAINTENANCE(listingId),
      { params }
    );
    return extractList(data);
  } catch {
    return { items: [], total: 0, page: 1, limit: 20 };
  }
}

// ─── Neighborhood Analytics ─────────────────────────────────────────────────────

export async function getNeighborhoodAnalytics(params?: { region?: string }): Promise<NeighborhoodAnalytics[]> {
  try {
    const { data } = await apiClient.get<ApiResp<NeighborhoodAnalytics[]>>(
      ENDPOINTS.LISTINGS.NEIGHBORHOOD_ANALYTICS,
      { params }
    );
    return data.success && Array.isArray(data.data) ? data.data : [];
  } catch {
    return [];
  }
}

// ─── Bulk Actions ────────────────────────────────────────────────────────────────

export async function executeBulkActions(actions: BulkActionItem[]): Promise<BulkActionResult> {
  const { data } = await apiClient.post<ApiResp<BulkActionResult>>(
    ENDPOINTS.LISTINGS.BULK_ACTIONS,
    { actions }
  );
  if (!data.success) throw new Error(data.message);
  return data.data;
}
