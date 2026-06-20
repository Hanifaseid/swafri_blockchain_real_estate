import type { ListingFilters } from '@/features/listings/types/listing.types';
import type { SavedSearchQuery } from '@/features/saved-searches/types/saved-search.types';

export function buildSavedSearchQuery(filters: ListingFilters): SavedSearchQuery {
  return {
    ...(filters.listingType && { listingType: filters.listingType }),
    ...(filters.category && { category: filters.category }),
    ...(filters.propertyType && { propertyType: filters.propertyType }),
    ...(filters.minPrice != null && { minPrice: filters.minPrice }),
    ...(filters.maxPrice != null && { maxPrice: filters.maxPrice }),
    ...(filters.minBedrooms != null && { minBedrooms: filters.minBedrooms }),
    ...(filters.minBathrooms != null && { minBathrooms: filters.minBathrooms }),
    ...(filters.minArea != null && { minArea: filters.minArea }),
    ...(filters.maxArea != null && { maxArea: filters.maxArea }),
    ...(filters.verifiedOnly != null && { verifiedOnly: filters.verifiedOnly }),
    ...(filters.availabilityStatus && { availabilityStatus: filters.availabilityStatus }),
    ...(filters.amenities != null && filters.amenities !== '' && { amenities: filters.amenities }),
    ...(filters.swLng != null && { swLng: filters.swLng }),
    ...(filters.swLat != null && { swLat: filters.swLat }),
    ...(filters.neLng != null && { neLng: filters.neLng }),
    ...(filters.neLat != null && { neLat: filters.neLat }),
    ...(filters.lng != null && { lng: filters.lng }),
    ...(filters.lat != null && { lat: filters.lat }),
    ...(filters.radius != null && { radius: filters.radius }),
    ...(filters.polygon?.length ? { polygon: filters.polygon } : {}),
  };
}

export function buildSavedSearchPills(query: SavedSearchQuery): string[] {
  const amenitiesLabel = Array.isArray(query.amenities)
    ? query.amenities.length > 0 ? `Amenities: ${query.amenities.join(', ')}` : false
    : query.amenities ? `Amenity: ${query.amenities}` : false;

  const pills = [
    query.listingType && (query.listingType === 'sale' ? 'For Sale' : 'For Rent'),
    query.category && (query.category === 'residential' ? 'Residential' : 'Commercial'),
    query.propertyType && query.propertyType.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
    query.minBedrooms != null && `${query.minBedrooms}+ BR`,
    query.minBathrooms != null && `${query.minBathrooms}+ BA`,
    query.minArea != null && `Min area ${query.minArea}`,
    query.maxArea != null && `Max area ${query.maxArea}`,
    query.verifiedOnly && 'Verified only',
    query.availabilityStatus && `Status: ${query.availabilityStatus.replace(/_/g, ' ')}`,
    amenitiesLabel,
    query.minPrice != null && query.maxPrice != null && `$${query.minPrice.toLocaleString()} – $${query.maxPrice.toLocaleString()}`,
    query.minPrice != null && query.maxPrice == null && `From $${query.minPrice.toLocaleString()}`,
    query.maxPrice != null && query.minPrice == null && `Up to $${query.maxPrice.toLocaleString()}`,
    query.swLng != null && query.swLat != null && query.neLng != null && query.neLat != null && 'Map area',
    query.lng != null && query.lat != null && query.radius != null && `Within ${query.radius / 1000}km`,
    query.polygon?.length && 'Custom area',
  ].filter(Boolean);

  return pills as string[];
}

export function buildSavedSearchParams(query: SavedSearchQuery): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value == null) return;
    if (key === 'polygon' && Array.isArray(value)) {
      params.set(key, JSON.stringify(value));
      return;
    }
    params.set(key, String(value));
  });

  return params;
}

export function hasSpatialFilters(query: SavedSearchQuery): boolean {
  return Boolean(
    (query.swLng != null && query.swLat != null && query.neLng != null && query.neLat != null) ||
    (query.lng != null && query.lat != null && query.radius != null) ||
    query.polygon?.length
  );
}

export function hasSavedSearchFilters(query: SavedSearchQuery): boolean {
  return Object.values(query).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    return value != null && value !== '';
  });
}
