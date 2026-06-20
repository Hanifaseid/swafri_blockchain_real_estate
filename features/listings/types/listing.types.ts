// ─── Listing Types ────────────────────────────────────────────────────────────
// Matches the real API response shapes from the Listings & Discovery guide.

export type ListingType = "sale" | "rent";

export type ListingCategory = "residential" | "commercial";

export type PropertyType =
  | "apartment"
  | "house"
  | "villa"
  | "condominium"
  | "land"
  | "commercial_space"
  | "office"
  | "warehouse"
  | "shop"
  | "mixed_use";

export type ListingStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "published"
  | "rejected"
  | "suspended"
  | "rented"
  | "sold"
  | "archived";

export type VerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected"
  | "requires_more_info"
  | "suspended";

export type AvailabilityStatus =
  | "available"
  | "under_offer"
  | "rented"
  | "sold";

export type FurnishingStatus = "furnished" | "semi_furnished" | "unfurnished";

// ─── Rental Yield ───────────────────────────────────────────────────────────────

export interface YieldSummary {
  listingId: string;
  currency: string;
  period: {
    from: string;
    to: string;
  };
  grossRent: number;
  maintenanceCost: number;
  netIncome: number;
  occupiedDays: number;
  occupancyRate: number;
  escrowHistory: Array<{
    leaseId: string;
    status: string;
    escrowState: string;
    fundTxHash: string | null;
    settleTxHash: string | null;
  }>;
  annualizedYield: number | null;
}

export interface YieldDashboard {
  totalListings: number;
  activeLeaseCount: number;
  grossMonthlyRent: number;
  realizedRevenue: number;
  occupancyRate: number;
}

// ─── Maintenance Records ───────────────────────────────────────────────────────

export interface MaintenanceRecord {
  id: string;
  listing: string;
  lease: string | null;
  owner: string;
  type: 'maintenance' | 'repair' | 'utility' | 'tax' | 'insurance' | 'management' | 'other';
  amount: number;
  currency: string;
  incurredAt: string;
  note: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaintenanceInput {
  leaseId?: string;
  type: 'maintenance' | 'repair' | 'utility' | 'tax' | 'insurance' | 'management' | 'other';
  amount: number;
  currency: string;
  incurredAt: string;
  note?: string;
}

export interface MaintenanceRecordsResponse {
  items: MaintenanceRecord[];
  total: number;
  page: number;
  limit: number;
}

// ─── Neighborhood Analytics ─────────────────────────────────────────────────────

export interface NeighborhoodAnalytics {
  city: string;
  region: string;
  count: number;
  avgPrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  avgMonthlyRent: number | null;
  availability: Record<string, number>;
}

// ─── Bulk Actions ────────────────────────────────────────────────────────────────

export interface BulkActionItem {
  id: string;
  action: string;
  reason?: string;
  note?: string;
}

export interface BulkActionResult {
  success: boolean;
  message: string;
  results: Array<{
    id: string;
    success: boolean;
    message?: string;
  }>;
}

// ─── Photo ────────────────────────────────────────────────────────────────────

export interface ListingPhoto {
  url: string;
  publicId: string;
  isCover: boolean;
}

// ─── Area ────────────────────────────────────────────────────────────────────

export interface ListingArea {
  value: number;
  unit: "sqm" | "sqft";
}

// ─── Address ─────────────────────────────────────────────────────────────────

export interface ListingAddress {
  street: string;
  city: string;
  region?: string;
  country: string;
  postalCode?: string;
}

// ─── GeoJSON Point ───────────────────────────────────────────────────────────

export interface GeoPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

// ─── Full Listing ─────────────────────────────────────────────────────────────

export interface Listing {
  id: string;
  title: string;
  description?: string;
  listingType: ListingType;
  category: ListingCategory;
  propertyType: PropertyType;
  status: ListingStatus;
  verificationStatus: VerificationStatus;
  availabilityStatus?: AvailabilityStatus;

  // Pricing
  price?: number; // sale only
  monthlyRent?: number; // rent only
  currency: string;

  // Physical attributes
  bedrooms?: number;
  bathrooms?: number;
  area?: ListingArea;
  yearBuilt?: number;
  floorNumber?: number;
  totalFloors?: number;
  parkingSpaces?: number;
  maintenanceFee?: number;
  serviceCharge?: number;
  utilityDetails?: string;
  neighborhoodInfo?: string;
  furnishingStatus?: FurnishingStatus;
  nearbyLandmarks?: string[];
  rentalTerms?: string;
  saleTerms?: string;
  legalNotes?: string;

  // Location
  address: ListingAddress;
  location: GeoPoint;

  // Media
  amenities: string[];
  photos: ListingPhoto[];

  // Blockchain
  tokenId?: string;

  // Meta
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Create Listing Input ─────────────────────────────────────────────────────

export interface CreateListingInput {
  title: string;
  description?: string;
  listingType: ListingType;
  category: ListingCategory;
  propertyType: PropertyType;
  price?: number;
  monthlyRent?: number;
  currency?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: ListingArea;
  yearBuilt?: number;
  floorNumber?: number;
  parkingSpaces?: number;
  totalFloors?: number;
  maintenanceFee?: number;
  serviceCharge?: number;
  utilityDetails?: string;
  neighborhoodInfo?: string;
  furnishingStatus?: FurnishingStatus;
  nearbyLandmarks?: string[];
  rentalTerms?: string;
  saleTerms?: string;
  legalNotes?: string;
  amenities?: string[];
  address: ListingAddress;
  location: GeoPoint;
}

// ─── Discovery Filters ────────────────────────────────────────────────────────

export interface ListingFilters {
  q?: string;
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
  availabilityStatus?: AvailabilityStatus;
  amenities?: string | string[];
  sort?: "newest" | "oldest" | "price_asc" | "price_desc";
  page?: number;
  limit?: number;
  // Viewport (bounding box) - all 4 required together
  swLng?: number;
  swLat?: number;
  neLng?: number;
  neLat?: number;
  // Radius (point + distance) - all 3 required together
  lng?: number;
  lat?: number;
  radius?: number;
  // Custom polygon - JSON-stringified array of [lng,lat] coordinate pairs
  polygon?: [number, number][];
}



// ─── Paginated response ───────────────────────────────────────────────────────

export interface PaginatedListings {
  items: Listing[];
  total: number;
  page: number;
  limit: number;
}

export interface ListingCluster {
  id: string;
  count: number;
  center: GeoPoint;
  listingIds: string[];
  minPrice?: number;
  maxPrice?: number;
}

export interface ListingClusterFilters {
  swLng: number;
  swLat: number;
  neLng: number;
  neLat: number;
  zoom?: number;
  listingType?: ListingType;
  category?: ListingCategory;
  propertyType?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  verifiedOnly?: boolean;
  availabilityStatus?: AvailabilityStatus;
}

// ─── Transition input ─────────────────────────────────────────────────────────

export type TransitionAction =
  | "submit"
  | "start_review"
  | "request_info"
  | "approve"
  | "reject"
  | "publish"
  | "suspend"
  | "unsuspend"
  | "mark_rented"
  | "mark_sold"
  | "unmark_rented"
  | "unmark_sold"
  | "archive";

export type RejectionReason =
  | "missing_document"
  | "invalid_ownership_proof"
  | "wrong_location"
  | "poor_quality"
  | "suspicious"
  | "duplicate"
  | "other";

export interface TransitionInput {
  action: TransitionAction;
  reason?: RejectionReason;
  note?: string;
}

// ─── Adapter: Listing → PropertySummary (for existing components) ─────────────
// Converts a full Listing to the PropertySummary shape used by ListingCard etc.

import type { PropertySummary } from "@/types";

export function listingToSummary(l: Listing): PropertySummary {
  const coverPhoto = l.photos?.find((p) => p.isCover) ?? l.photos?.[0];
  return {
    id: l.id,
    title: l.title,
    address: l.address.street ?? "",
    city: l.address.city,
    country: l.address.country,
    price: l.price ?? l.monthlyRent ?? 0,
    currency: l.currency ?? "USD",
    image: coverPhoto?.url ?? null,
    listingType: l.listingType,
    type: l.category === "residential" ? "residential" : "commercial",
    status: mapStatus(l.status),
    beds: l.bedrooms,
    baths: l.bathrooms,
    sqft:
      l.area?.unit === "sqft"
        ? l.area.value
        : l.area
          ? Math.round(l.area.value * 10.764)
          : undefined,
    lat: l.location.coordinates[1],
    lng: l.location.coordinates[0],
    ownerId: l.createdBy,
    createdAt: l.createdAt,
  };
}

function mapStatus(s: ListingStatus): import("@/types").ListingStatus {
  const map: Record<ListingStatus, import("@/types").ListingStatus> = {
    draft: "draft",
    submitted: "pending",
    under_review: "pending",
    approved: "active",
    published: "active",
    rejected: "delisted",
    suspended: "flagged",
    rented: "rented",
    sold: "sold",
    archived: "expired",
  };
  return map[s] ?? "active";
}
