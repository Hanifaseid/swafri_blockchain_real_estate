/**
 * components/listing/types.ts — presentation-layer listing types.
 *
 * PropertySummary (from @/types) is the lightweight shape used in cards/grids.
 * PropertyDetail is the full shape used on the listing detail page.
 * These types are consumed by presentation components only — no API logic here.
 */

import type {
  PropertySummary,
  PropertyFilters,
  ListingType,
  PropertyType,
  ListingStatus,
  ListingTier,
} from '@/types';

// Re-export so components/listing/* only needs to import from this one file
export type {
  PropertySummary,
  PropertyFilters,
  ListingType,
  PropertyType,
  ListingStatus,
  ListingTier,
};

// ── Full listing detail (used on /listings/[id]) ──────────────────────────────

export interface Amenity {
  id: string;
  label: string;
  icon?: string; // lucide icon name
}

export interface PropertyPhoto {
  id: string;
  url: string;
  alt?: string;
  isPrimary: boolean;
}

export interface PropertyDetail extends PropertySummary {
  description: string;
  photos: PropertyPhoto[];
  amenities: Amenity[];
  yearBuilt?: number;
  parkingSpaces?: number;
  floorNumber?: number;
  totalFloors?: number;
  // Blockchain
  tokenId?: string;
  contractAddress?: string;
  ownerWalletAddress?: string;
  titleVerified: boolean;
  // Owner info (public-safe subset)
  owner: {
    id: string;
    name: string;
    avatarUrl?: string;
    verified: boolean;
  };
  // Metadata
  viewCount: number;
  favoriteCount: number;
  updatedAt: string;
}

// ── Filter option shapes (used by ListingFilters) ─────────────────────────────

export interface FilterOption<T extends string = string> {
  label: string;
  value: T;
}

export const LISTING_TYPE_OPTIONS: FilterOption<ListingType>[] = [
  { label: 'For Sale', value: 'sale' },
  { label: 'For Rent', value: 'rent' },
];

export const PROPERTY_TYPE_OPTIONS: FilterOption<PropertyType>[] = [
  { label: 'Residential', value: 'residential' },
  { label: 'Commercial', value: 'commercial' },
];

export const BED_OPTIONS: FilterOption[] = [
  { label: '1+', value: '1' },
  { label: '2+', value: '2' },
  { label: '3+', value: '3' },
  { label: '4+', value: '4' },
];

export const TIER_OPTIONS: FilterOption<ListingTier>[] = [
  { label: 'Basic', value: 'basic' },
  { label: 'Premium', value: 'premium' },
  { label: 'Featured', value: 'featured' },
];
