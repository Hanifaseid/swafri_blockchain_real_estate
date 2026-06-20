import type {
  ListingType,
  ListingCategory,
  PropertyType,
} from '@/features/listings/types/listing.types';

export interface SavedSearchQuery {
  listingType?: ListingType;
  category?: ListingCategory;
  propertyType?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  minArea?: number;
  maxArea?: number;
  verifiedOnly?: boolean;
  availabilityStatus?: 'available' | 'under_offer' | 'rented' | 'sold';
  amenities?: string | string[];
  swLng?: number;
  swLat?: number;
  neLng?: number;
  neLat?: number;
  lng?: number;
  lat?: number;
  radius?: number;
  polygon?: [number, number][];
}

export interface SavedSearch {
  id: string;
  name: string;
  query: SavedSearchQuery;
  alertEnabled: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateSavedSearchInput {
  name: string;
  query: SavedSearchQuery;
  alertEnabled?: boolean;
}

export interface UpdateSavedSearchInput {
  name?: string;
  query?: SavedSearchQuery;
  alertEnabled?: boolean;
}
