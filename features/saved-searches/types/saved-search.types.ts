export type ListingType = 'sale' | 'rent';
export type Category    = 'residential' | 'commercial';

export interface SavedSearchQuery {
  swLng?:        number;
  swLat?:        number;
  neLng?:        number;
  neLat?:        number;
  lng?:          number;
  lat?:          number;
  radius?:       number;
  polygon?:      [number, number][];
  listingType?:  ListingType;
  category?:     Category;
  minPrice?:     number;
  maxPrice?:     number;
  minBedrooms?:  number;
  minBathrooms?: number;
}

export interface SavedSearch {
  id:           string;
  name:         string;
  query:        SavedSearchQuery;
  alertEnabled: boolean;
  createdAt:    string;
  updatedAt?:   string;
}

export interface CreateSavedSearchInput {
  name:          string;
  query:         SavedSearchQuery;
  alertEnabled?: boolean;
}

export interface UpdateSavedSearchInput {
  name?:         string;
  query?:        SavedSearchQuery;
  alertEnabled?: boolean;
}
