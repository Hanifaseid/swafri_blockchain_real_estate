import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  GeoResult,
  Neighborhood,
  NeighborhoodListResponse,
  NeighborhoodAnalyticsData,
} from '../types/geo.types';

interface ApiResp<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

function isGeoResult(value: unknown): value is GeoResult {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Record<string, unknown>;
  const location = candidate.location as Record<string, unknown> | undefined;
  const coordinates = location?.coordinates;

  return typeof candidate.label === 'string'
    && location?.type === 'Point'
    && Array.isArray(coordinates)
    && coordinates.length === 2
    && typeof coordinates[0] === 'number'
    && typeof coordinates[1] === 'number';
}

function normalizeGeoResults(payload: unknown): GeoResult[] {
  if (Array.isArray(payload)) {
    return payload.filter(isGeoResult);
  }

  if (payload && typeof payload === 'object') {
    const candidate = payload as Record<string, unknown>;

    if (Array.isArray(candidate.data)) {
      return candidate.data.filter(isGeoResult);
    }

    if (Array.isArray(candidate.results)) {
      return candidate.results.filter(isGeoResult);
    }
  }

  return [];
}

function normalizeGeoResult(payload: unknown): GeoResult | null {
  if (isGeoResult(payload)) return payload;

  if (payload && typeof payload === 'object') {
    const candidate = payload as Record<string, unknown>;

    if (isGeoResult(candidate.data)) return candidate.data;
    if (isGeoResult(candidate.result)) return candidate.result;
  }

  return null;
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function isEchoedMockResult(result: GeoResult, query: string): boolean {
  return result.provider === 'mock'
    && normalizeText(result.label) === normalizeText(query)
    && (result.confidence ?? 0) <= 0.5;
}

interface NominatimSearchItem {
  display_name?: string;
  lat?: string;
  lon?: string;
  address?: Record<string, string>;
}

interface NominatimReverseItem {
  display_name?: string;
  lat?: string;
  lon?: string;
  address?: Record<string, string>;
}

function toGeoResult(item: {
  display_name?: string;
  lat?: string;
  lon?: string;
  address?: Record<string, string>;
}): GeoResult | null {
  const lat = Number(item.lat);
  const lng = Number(item.lon);

  if (!item.display_name || Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }

  return {
    label: item.display_name,
    location: {
      type: 'Point' as const,
      coordinates: [lng, lat] as [number, number],
    },
    address: item.address,
    provider: 'nominatim' as const,
  };
}

async function geocodeWithNominatim(query: string): Promise<GeoResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    addressdetails: '1',
    limit: '5',
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to geocode location');
  }

  const data = await response.json() as NominatimSearchItem[];

  return (Array.isArray(data) ? data : [])
    .map(toGeoResult)
    .filter((item): item is GeoResult => item !== null);
}

async function reverseGeocodeWithNominatim(lat: number, lng: number): Promise<GeoResult | null> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'jsonv2',
    addressdetails: '1',
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to reverse geocode location');
  }

  const data = await response.json() as NominatimReverseItem;
  return toGeoResult(data);
}

export async function geocode(query: string): Promise<GeoResult[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  try {
    const response = await apiClient.get<ApiResp<GeoResult[]>>(ENDPOINTS.GEO.GEOCODE, {
      params: { q: trimmedQuery },
    });

    const payload = response.data;
    if (payload?.success === false) {
      throw new Error(payload.message || 'Failed to geocode location');
    }

    const backendResults = normalizeGeoResults(payload?.data ?? payload)
      .filter((result) => !isEchoedMockResult(result, trimmedQuery));

    if (backendResults.length > 0) {
      return backendResults;
    }
  } catch {
    // Fall through to Nominatim fallback below.
  }

  return geocodeWithNominatim(trimmedQuery);
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeoResult | null> {
  try {
    const response = await apiClient.get<ApiResp<GeoResult>>(ENDPOINTS.GEO.REVERSE, {
      params: { lat, lng },
    });

    const payload = response.data;
    if (payload?.success === false) {
      throw new Error(payload.message || 'Failed to reverse geocode location');
    }

    const backendResult = normalizeGeoResult(payload?.data ?? payload);
    if (backendResult) {
      return backendResult;
    }
  } catch {
    // Fall through to Nominatim fallback below.
  }

  return reverseGeocodeWithNominatim(lat, lng);
}

// ─── Neighborhoods ─────────────────────────────────────────────────────────────

export async function getNeighborhoods(params?: {
  city?: string;
  region?: string;
  country?: string;
  page?: number;
  limit?: number;
}): Promise<NeighborhoodListResponse> {
  try {
    const { data } = await apiClient.get<any>(ENDPOINTS.GEO.NEIGHBORHOODS, { params });
    if (data?.success) {
      return {
        items: data.data?.items || data.data || [],
        total: data.data?.total || data.total || 0,
        page: data.data?.page || data.page || 1,
        limit: data.data?.limit || data.limit || 20,
      };
    }
    return { items: [], total: 0, page: 1, limit: 20 };
  } catch {
    return { items: [], total: 0, page: 1, limit: 20 };
  }
}

export async function getNeighborhoodDetail(id: string): Promise<Neighborhood | null> {
  try {
    const { data } = await apiClient.get<ApiResp<Neighborhood>>(ENDPOINTS.GEO.NEIGHBORHOOD_DETAIL(id));
    return data.success ? (data.data ?? null) : null;
  } catch {
    return null;
  }
}

export async function getNeighborhoodAnalytics(id: string): Promise<NeighborhoodAnalyticsData | null> {
  try {
    const { data } = await apiClient.get<ApiResp<NeighborhoodAnalyticsData>>(
      ENDPOINTS.GEO.NEIGHBORHOOD_ANALYTICS(id)
    );
    return data.success ? (data.data ?? null) : null;
  } catch {
    return null;
  }
}
