export interface GeoResult {
  label: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  address?: Record<string, string>;
  provider?: 'mock' | 'nominatim';
  confidence?: number;
}

// ─── Neighborhoods ─────────────────────────────────────────────────────────────

export interface Neighborhood {
  id: string;
  name: string;
  city: string;
  region: string;
  country: string;
  boundary: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  centroid: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface NeighborhoodListResponse {
  items: Neighborhood[];
  total: number;
  page: number;
  limit: number;
}

export interface NeighborhoodAnalyticsData {
  neighborhood: {
    name: string;
    boundary: any;
    centroid: any;
  };
  listings: Array<{
    _id: string;
    count: number;
    avgPrice?: number;
    avgRent?: number;
  }>;
  availability: Array<{
    _id: string;
    count: number;
  }>;
  leads: Array<{
    _id: string;
    count: number;
  }>;
  poiCount: number;
  pois: Array<{
    name: string;
    category: string;
    location: any;
  }>;
}
