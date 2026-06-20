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
  GeocodeResult,
  ReverseGeocodeResult,
  Neighborhood,
  NeighborhoodAnalytics,
  GeoNeighborhoodStat,
  MaintenanceRecord,
  MaintenanceRecordsResponse,
  CreateMaintenanceInput,
  YieldSummary,
  YieldDashboard,
  BulkActionItem,
  BulkActionResult,
} from "@/features/listings/types/listing.types";

// â”€â”€â”€ Response helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

  // Shape: { data: { items: [...], total, page, limit } } â€” what the real API returns
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

// â”€â”€â”€ Geo coordinate helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// The backend returns GeoJSON ([lng, lat] under a `coordinates` array). The UI
// (PropertyMap, geocode pickers) works in flat lat/lng. These helpers normalise
// whatever coordinate shape the API hands back into a flat { lat, lng } pair.

function coordsOf(value: unknown): [number, number] | null {
  if (!value) return null;
  // GeoJSON object: { type: "Point", coordinates: [lng, lat] }
  if (typeof value === "object" && !Array.isArray(value)) {
    const c = (value as { coordinates?: unknown }).coordinates;
    if (Array.isArray(c) && c.length >= 2) return [Number(c[0]), Number(c[1])];
    return null;
  }
  // Raw [lng, lat] array
  if (Array.isArray(value) && value.length >= 2) {
    return [Number(value[0]), Number(value[1])];
  }
  return null;
}

function mapGeocode(raw: unknown): GeocodeResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const coords = coordsOf(r.location) ?? coordsOf(r.coordinates);
  const lng = coords ? coords[0] : (r.lng as number);
  const lat = coords ? coords[1] : (r.lat as number);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    label: (r.label as string) ?? "",
    lat,
    lng,
    address: r.address as GeocodeResult["address"],
    source: (r.provider as string) ?? (r.source as string),
    confidence: r.confidence as number | undefined,
  };
}

function mapNeighborhood(raw: unknown): Neighborhood {
  const r = (raw ?? {}) as Record<string, unknown>;
  const center = coordsOf(r.centroid) ?? coordsOf(r.center);
  const boundary = (r.boundary as { coordinates?: unknown })?.coordinates;
  return {
    id: (r.id as string) ?? (r._id as string) ?? "",
    name: (r.name as string) ?? "",
    city: r.city as string | undefined,
    region: r.region as string | undefined,
    country: r.country as string | undefined,
    center: center ?? undefined,
    // GeoJSON Polygon coordinates are number[][][]; expose the outer ring.
    boundary: Array.isArray(boundary)
      ? (boundary[0] as [number, number][] | undefined)
      : undefined,
  };
}

function mapCluster(raw: unknown): ListingCluster | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const coords =
    coordsOf(r.center) ??
    (Number.isFinite(r.lng) && Number.isFinite(r.lat)
      ? [Number(r.lng), Number(r.lat)]
      : Number.isFinite(r.longitude) && Number.isFinite(r.latitude)
        ? [Number(r.longitude), Number(r.latitude)]
        : null);
  if (!coords) return null;
  return {
    id: r.id as string | undefined,
    count: Number(r.count) || 0,
    center: coords,
    lng: coords[0],
    lat: coords[1],
    listingIds: r.listingIds as string[] | undefined,
    minPrice: r.minPrice as number | undefined,
    maxPrice: r.maxPrice as number | undefined,
  };
}

// â”€â”€â”€ getListings (public discovery) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// GET /listings â€” published listings with filters

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
    const unwrapped = unwrapData<unknown[] | { items?: unknown[] }>(data, []);
    const list = Array.isArray(unwrapped) ? unwrapped : unwrapped.items ?? [];
    return list.map(mapCluster).filter((c): c is ListingCluster => c !== null);
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
    const unwrapped = unwrapData<unknown[] | { items?: unknown[] }>(data, []);
    const list = Array.isArray(unwrapped) ? unwrapped : unwrapped.items ?? [];
    return list.map(mapGeocode).filter((r): r is GeocodeResult => r !== null);
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
    const raw = unwrapData<unknown>(data, null);
    const mapped = mapGeocode(raw);
    if (!mapped) return null;
    const r = raw as Record<string, unknown>;
    return {
      ...mapped,
      neighborhoodId: r.neighborhoodId as string | undefined,
      neighborhoodName: r.neighborhoodName as string | undefined,
    };
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
    const unwrapped = unwrapData<unknown[] | { items?: unknown[] }>(data, []);
    const list = Array.isArray(unwrapped) ? unwrapped : unwrapped.items ?? [];
    return list.map(mapNeighborhood);
  } catch {
    return [];
  }
}


export async function createSavedSearch(
  input: CreateSavedSearchInput,
): Promise<SavedSearch> {
  const payload = {
    name: input.name,
    alertEnabled: input.alertEnabled ?? false,
    query: {
      ...(input.query.listingType ? { listingType: input.query.listingType } : {}),
      ...(input.query.category ? { category: input.query.category } : {}),
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




// â”€â”€â”€ getMyListings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// GET /listings/mine â€” owner's own listings

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

// â”€â”€â”€ getListing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ createListing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ updateListing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ deleteListing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function deleteListing(id: string): Promise<void> {
  await apiClient.delete(ENDPOINTS.LISTINGS.DELETE(id));
}

// â”€â”€â”€ transitionListing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Admin: getAdminListings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Admin: getAdminListingsStats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Duplicate Detection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Analytics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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


// â”€â”€â”€ Owner dashboard stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Documents â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Photos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ On-chain title â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Rental Yield â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Maintenance Records â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// ——————————————————————————————————————————————————————————————————————————————

// Returns a single analytics summary for one neighbourhood (discovery detail panel).
// Backend: GET /geo/neighborhoods/{id}/analytics returns a grouped aggregation
// ({ neighborhood, listings[], availability[], leads[], poiCount, pois[] }) which
// we flatten into the NeighborhoodAnalytics shape the UI consumes.
export async function getNeighborhoodAnalytics(
  id?: string,
): Promise<NeighborhoodAnalytics | null> {
  if (!id) return null;
  try {
    const { data } = await apiClient.get<unknown>(
      ENDPOINTS.GEO.NEIGHBORHOOD_ANALYTICS(id),
    );
    const raw = unwrapData<Record<string, unknown> | null>(data, null);
    if (!raw) return null;

    const byKey = (arr: unknown, key: string) =>
      (Array.isArray(arr) ? arr : []).find(
        (e) => (e as { _id?: string })?._id === key,
      ) as Record<string, number> | undefined;

    const listings = Array.isArray(raw.listings) ? raw.listings : [];
    const sale = byKey(listings, "sale");
    const rent = byKey(listings, "rent");
    const leads = raw.leads;

    const listingCount = listings.reduce(
      (sum: number, e: unknown) => sum + (Number((e as { count?: number })?.count) || 0),
      0,
    );
    const leadCount = (Array.isArray(leads) ? leads : []).reduce(
      (sum: number, e: unknown) => sum + (Number((e as { count?: number })?.count) || 0),
      0,
    );

    return {
      neighborhoodId: id,
      listingCount,
      availableCount: byKey(raw.availability, "available")?.count,
      averagePrice: sale?.avgPrice,
      averageRent: rent?.avgRent,
      leadCount,
      inquiryCount: byKey(leads, "inquiry")?.count,
      offerCount: byKey(leads, "offer")?.count,
      rentalApplicationCount: byKey(leads, "rental_application")?.count,
    };
  } catch {
    return null;
  }
}

// Returns an array of city/region geo stats used by the NeighborhoodAnalytics grid.
// Backend: GET /listings/analytics/neighborhood?region= returns the array directly.
export async function getGeoNeighborhoodStats(
  params?: { region?: string },
): Promise<GeoNeighborhoodStat[]> {
  try {
    const { data } = await apiClient.get<ApiResp<GeoNeighborhoodStat[]>>(
      ENDPOINTS.LISTINGS.NEIGHBORHOOD_ANALYTICS,
      { params },
    );
    return data.success && Array.isArray(data.data) ? data.data : [];
  } catch {
    return [];
  }
}

// ——————————————————————————————————————————————————————————————————————————————

export async function executeBulkActions(actions: BulkActionItem[]): Promise<BulkActionResult> {
  const { data } = await apiClient.post<ApiResp<BulkActionResult>>(
    ENDPOINTS.LISTINGS.BULK_ACTIONS,
    { actions }
  );
  if (!data.success) throw new Error(data.message);
  return data.data;
}

// â”€â”€â”€ Saved Searches â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getSavedSearches(): Promise<SavedSearch[]> {
  try {
    const { data } = await apiClient.get<ApiResp<SavedSearch[]>>(
      ENDPOINTS.SAVED_SEARCHES.LIST
    );
    return data.success && Array.isArray(data.data) ? data.data : [];
  } catch {
    return [];
  }
}

export async function saveSearch(input: CreateSavedSearchInput): Promise<SavedSearch> {
  const { data } = await apiClient.post<ApiResp<SavedSearch>>(
    ENDPOINTS.SAVED_SEARCHES.CREATE,
    input
  );
  if (!data.success) throw new Error(data.message);
  return data.data;
}

export async function deleteSavedSearch(id: string): Promise<void> {
  await apiClient.delete(ENDPOINTS.SAVED_SEARCHES.DELETE(id));
}
