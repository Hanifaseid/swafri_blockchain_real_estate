"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Plus,
  Search,
  SlidersHorizontal,
  X,
  Loader2,
  AlertCircle,
  Clock,
  BookmarkPlus,
  Bell,
  BellOff,
  Check,
  Map,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import {
  useListings,
  useMyListings,
  useAdminListings,
  useAdminListingsStats,
  useDeleteListing,
  useTransitionListing,
  useSavedSearches,
  useUpdateSavedSearch,
  useDeleteSavedSearch,
  useSaveSearch,
} from "@/features/listings/queries/listing.queries";
import { listingToSummary } from "@/features/listings/types/listing.types";
import type {
  Listing,
  ListingFilters,
  PropertyType,
  TransitionAction,
} from "@/features/listings/types/listing.types";
import { ListingCard } from "@/components/listing/ListingCard";
import { FavoriteButton } from "@/components/common/FavoriteButton";
import { PropertyMap, type MapSearchMode } from "@/components/map/PropertyMap";
import { cn } from "@/lib/utils";

// ─── Properties Page ──────────────────────────────────────────────────────────
// Role-aware: TENANT=browse, PROPERTY_OWNER=manage, ADMIN=review queue

export default function PropertiesPage() {
  const { currentUser } = useAuthStore();
  if (!currentUser) return null;

  if (currentUser.role === "TENANT") return <TenantView />;
  if (currentUser.role === "PROPERTY_OWNER") return <OwnerView />;
  return <AdminView />;
}

function fuzzySearchMatch(value: string, query: string) {
  let searchIndex = 0;
  for (let i = 0; i < value.length && searchIndex < query.length; i += 1) {
    if (value[i] === query[searchIndex]) {
      searchIndex += 1;
    }
  }
  return searchIndex === query.length;
}

// ─── Tenant: Browse published listings ────────────────────────────────────────

function TenantView() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState<ListingFilters>(() => ({
    limit: 20,
    page: 1,
    sort: "newest",
    listingType:
      (searchParams.get("listingType") as ListingFilters["listingType"]) ||
      undefined,
    category:
      (searchParams.get("category") as ListingFilters["category"]) || undefined,
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
    minBedrooms: searchParams.get("minBedrooms")
      ? Number(searchParams.get("minBedrooms"))
      : undefined,
    minBathrooms: searchParams.get("minBathrooms")
      ? Number(searchParams.get("minBathrooms"))
      : undefined,
  }));
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [showFilters, setShowFilters] = useState(
    !!(
      searchParams.get("listingType") ||
      searchParams.get("category") ||
      searchParams.get("minPrice") ||
      searchParams.get("maxPrice") ||
      searchParams.get("minBedrooms") ||
      searchParams.get("minBathrooms")
    )
  );
  const [showMap, setShowMap] = useState(false);
  const [mapMode, setMapMode] = useState<MapSearchMode>("viewport");
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.4897, 9.1450]); // Ethiopia center
  const [mapRadius, setMapRadius] = useState(5000); // 5km
  const [mapPolygon, setMapPolygon] = useState<[number, number][]>([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("recentSearches");
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      // Ignore errors
    }
    return [];
  });
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveModalName, setSaveModalName] = useState("");
  const [saveModalAlert, setSaveModalAlert] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search → push into filters.q after 800ms to avoid 429 rate limit
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => ({
        ...f,
        q: search.trim().toLowerCase() || undefined,
        page: 1,
      }));
    }, 800);
    return () => clearTimeout(t);
  }, [search]);

  const { data: listingsData, isLoading } = useListings(filters);

  // Client-side filtering for radius search to ensure correct display
  const listings = useMemo(() => {
    const allListings = listingsData?.items ?? [];

    // If radius search is active, filter listings by distance
    if (filters.lng && filters.lat && filters.radius) {
      const centerLat = filters.lat;
      const centerLng = filters.lng;
      const radiusMeters = filters.radius;

      return allListings.filter((listing) => {
        if (!listing.location?.coordinates) return false;
        const [listingLng, listingLat] = listing.location.coordinates;

        // Calculate distance using Haversine formula
        const R = 6371000; // Earth's radius in meters
        const dLat = ((listingLat - centerLat) * Math.PI) / 180;
        const dLng = ((listingLng - centerLng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((centerLat * Math.PI) / 180) *
            Math.cos((listingLat * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance <= radiusMeters;
      });
    }

    return allListings;
  }, [listingsData?.items, filters.lng, filters.lat, filters.radius]);
  const normalizedSearch = search.trim().toLowerCase();

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const priceValue = listing.price ?? listing.monthlyRent ?? 0;
      if (filters.minPrice != null && priceValue < filters.minPrice)
        return false;
      if (filters.maxPrice != null && priceValue > filters.maxPrice)
        return false;

      if (!normalizedSearch) return true;
      const normalizedTitle = listing.title?.toLowerCase() ?? "";
      const normalizedType = listing.propertyType?.toLowerCase() ?? "";
      const normalizedCategory = listing.category?.toLowerCase() ?? "";
      const normalizedCity = listing.address?.city?.toLowerCase() ?? "";
      const normalizedStreet = listing.address?.street?.toLowerCase() ?? "";
      const normalizedId = listing.id?.toLowerCase() ?? "";

      return (
        normalizedTitle.includes(normalizedSearch) ||
        fuzzySearchMatch(normalizedTitle, normalizedSearch) ||
        normalizedType.includes(normalizedSearch) ||
        fuzzySearchMatch(normalizedType, normalizedSearch) ||
        normalizedCategory.includes(normalizedSearch) ||
        fuzzySearchMatch(normalizedCategory, normalizedSearch) ||
        normalizedCity.includes(normalizedSearch) ||
        fuzzySearchMatch(normalizedCity, normalizedSearch) ||
        normalizedStreet.includes(normalizedSearch) ||
        fuzzySearchMatch(normalizedStreet, normalizedSearch) ||
        normalizedId.includes(normalizedSearch) ||
        fuzzySearchMatch(normalizedId, normalizedSearch)
      );
    });
  }, [normalizedSearch, listings, filters.minPrice, filters.maxPrice]);

  const { data: savedSearchesData } = useSavedSearches();
  const savedSearches = savedSearchesData ?? [];

  const { mutate: deleteSavedSearch } = useDeleteSavedSearch();
  const { mutate: saveSearch, isPending: savingSearch } = useSaveSearch();

  // Map event handlers
  const handleViewportChange = (bounds: { swLng: number; swLat: number; neLng: number; neLat: number }) => {
    setFilters((f) => ({
      ...f,
      swLng: bounds.swLng,
      swLat: bounds.swLat,
      neLng: bounds.neLng,
      neLat: bounds.neLat,
      lng: undefined,
      lat: undefined,
      radius: undefined,
      polygon: undefined,
      page: 1,
    }));
  };

  const handleRadiusChange = (center: [number, number], radius: number) => {
    setMapCenter(center);
    setMapRadius(radius);
    setFilters((f) => ({
      ...f,
      lng: center[0],
      lat: center[1],
      radius: radius,
      swLng: undefined,
      swLat: undefined,
      neLng: undefined,
      neLat: undefined,
      polygon: undefined,
      page: 1,
    }));
  };

  const handlePolygonChange = (polygon: [number, number][]) => {
    setMapPolygon(polygon);
    setFilters((f) => ({
      ...f,
      polygon: polygon.length > 0 ? polygon : undefined,
      swLng: undefined,
      swLat: undefined,
      neLng: undefined,
      neLat: undefined,
      lng: undefined,
      lat: undefined,
      radius: undefined,
      page: 1,
    }));
  };

  // Persist recent searches to localStorage
  const saveRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const updated = [
      trimmed,
      ...recentSearches.filter((s) => s !== trimmed),
    ].slice(0, 8);
    setRecentSearches(updated);
    try {
      localStorage.setItem("recentSearches", JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  const removeRecentSearch = (query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== query);
    setRecentSearches(updated);
    try {
      localStorage.setItem("recentSearches", JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      saveRecentSearch(search);
    }
    setFilters((f) => ({
      ...f,
      q: search.trim().toLowerCase() || undefined,
      page: 1,
    }));
    setShowRecentSearches(false);
  };

  const applyRecentSearch = (query: string) => {
    setSearch(query);
    setFilters((f) => ({
      ...f,
      q: query.toLowerCase(),
      page: 1,
    }));
    setShowRecentSearches(false);
    searchInputRef.current?.blur();
  };

  const applySavedSearch = (savedSearch: any) => {
    const q = savedSearch.query ?? {};
    setSearch(savedSearch.name);
    setFilters((f) => ({
      ...f,
      q: undefined,
      listingType: q.listingType || undefined,
      category: q.category || undefined,
      minPrice: q.minPrice ?? undefined,
      maxPrice: q.maxPrice ?? undefined,
      minBedrooms: q.minBedrooms ?? undefined,
      minBathrooms: q.minBathrooms ?? undefined,
      page: 1,
    }));
    if (
      q.listingType ||
      q.category ||
      q.minPrice ||
      q.maxPrice ||
      q.minBedrooms ||
      q.minBathrooms
    ) {
      setShowFilters(true);
    }
    setShowRecentSearches(false);
    searchInputRef.current?.blur();
  };

  const handleDeleteSavedSearch = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Delete this saved search?")) {
      deleteSavedSearch(id);
    }
  };

  const handleSaveCurrentSearch = () => {
    setSaveModalName(search.trim() || "My saved search");
    setSaveModalAlert(false);
    setShowSaveModal(true);
  };

  const confirmSave = () => {
    if (!saveModalName.trim()) return;
    saveSearch(
      {
        name: saveModalName.trim(),
        alertEnabled: saveModalAlert,
        query: {
          listingType: filters.listingType ?? undefined,
          category: (filters as any).category ?? undefined,
          minPrice: filters.minPrice ?? undefined,
          maxPrice: filters.maxPrice ?? undefined,
          minBedrooms: filters.minBedrooms ?? undefined,
          minBathrooms: filters.minBathrooms ?? undefined,
        },
      },
      { onSuccess: () => setShowSaveModal(false) },
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-6 h-6 text-emerald-500 shrink-0" />
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">
            Marketplace
          </p>
          <h1 className="text-2xl font-light text-[#0f172a] tracking-tight">
            Browse Properties
          </h1>
        </div>
      </div>

      {/* Search + filter bar */}
      <form
        onSubmit={handleSearch}
        className="grid gap-2 mb-4 sm:grid-cols-[1fr_auto_auto_auto] items-center"
      >
        <div className="relative min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setShowRecentSearches(true)}
            onBlur={() => setTimeout(() => setShowRecentSearches(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setShowRecentSearches(false);
            }}
            placeholder="Search by ID, location, or keyword…"
            className="w-full h-11 rounded-2xl border border-gray-200 pl-10 pr-3 text-sm text-black/70 placeholder:text-black/25 focus:outline-none focus:border-emerald-400 bg-white"
          />
          {/* Search dropdown with real-time results, recent, and saved searches */}
          {showRecentSearches &&
            (search.trim() ||
              recentSearches.length > 0 ||
              savedSearches.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  {/* Live API results preview */}
                  {search.trim() && filteredListings.length > 0 && (
                    <>
                      <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-black/40 bg-gray-50 border-b border-gray-100">
                        Results ({filteredListings.length})
                      </div>
                      {filteredListings.slice(0, 5).map((listing) => (
                        <button
                          key={listing.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setShowRecentSearches(false);
                            router.push(`/properties/${listing.id}`);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-black/70 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 text-left"
                        >
                          <Search
                            size={12}
                            className="text-black/30 shrink-0"
                          />
                          <span className="flex-1 truncate">
                            {listing.title || listing.id}
                          </span>
                          <span className="text-xs text-black/30 shrink-0">
                            {listing.propertyType}
                          </span>
                        </button>
                      ))}
                      {filteredListings.length > 5 && (
                        <div className="px-3 py-2 text-xs text-emerald-600 text-center font-medium border-b border-gray-100">
                          +{filteredListings.length - 5} more — press Enter to
                          see all
                        </div>
                      )}
                    </>
                  )}

                  {/* Recent searches */}
                  {!search.trim() && recentSearches.length > 0 && (
                    <>
                      <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-black/40 bg-gray-50 border-b border-gray-100">
                        Recent
                      </div>
                      {recentSearches.map((query) => (
                        <button
                          key={query}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            applyRecentSearch(query);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-black/70 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <Clock size={14} className="text-black/30 shrink-0" />
                          <span className="flex-1 text-left truncate">
                            {query}
                          </span>
                          <span
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeRecentSearch(query, e as any);
                            }}
                            className="p-1 text-black/20 hover:text-red-500 transition-colors shrink-0 hover:bg-red-50 rounded"
                            role="button"
                            tabIndex={0}
                            aria-label="Remove search"
                          >
                            <X size={14} />
                          </span>
                        </button>
                      ))}
                    </>
                  )}

                  {/* Saved searches */}
                  {!search.trim() && savedSearches.length > 0 && (
                    <>
                      <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-black/40 bg-gray-50 border-b border-gray-100">
                        Saved Searches
                      </div>
                      {savedSearches.map((savedSearch: any) => (
                        <button
                          key={savedSearch.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            applySavedSearch(savedSearch);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-black/70 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 text-left"
                        >
                          <Search
                            size={14}
                            className="text-emerald-500 shrink-0"
                          />
                          <span className="flex-1 truncate">
                            {savedSearch.name}
                          </span>
                          <span
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteSavedSearch(savedSearch.id, e as any);
                            }}
                            className="p-1 text-black/20 hover:text-red-500 transition-colors shrink-0 hover:bg-red-50 rounded"
                            role="button"
                            tabIndex={0}
                            aria-label="Delete search"
                          >
                            <X size={14} />
                          </span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
        </div>
        <button
          type="button"
          onClick={handleSaveCurrentSearch}
          disabled={savingSearch}
          className="inline-flex items-center gap-1.5 h-11 px-4 rounded-2xl text-xs font-medium transition-colors border border-gray-200 bg-white text-black/60 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <BookmarkPlus size={14} />
          {savingSearch ? "Saving…" : "Save search"}
        </button>
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1.5 h-11 px-4 rounded-2xl text-xs font-medium transition-colors",
            showFilters
              ? "bg-emerald-50 border border-emerald-300 text-emerald-600"
              : "border border-gray-200 bg-white text-black/60 hover:border-gray-300",
          )}
        >
          <SlidersHorizontal size={13} /> Filters
        </button>
        <button
          type="button"
          onClick={() => setShowMap((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1.5 h-11 px-4 rounded-2xl text-xs font-medium transition-colors",
            showMap
              ? "bg-emerald-50 border border-emerald-300 text-emerald-600"
              : "border border-gray-200 bg-white text-black/60 hover:border-gray-300",
          )}
        >
          <Map size={13} /> Map
        </button>
      </form>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-1.5 block">
              Rent or Sale
            </label>
            <select
              value={filters.listingType ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  listingType:
                    (e.target.value as ListingFilters["listingType"]) ||
                    undefined,
                  page: 1,
                }))
              }
              className="w-full h-11 rounded-2xl border border-gray-200 px-3 text-sm text-black/70 bg-white focus:outline-none focus:border-emerald-400"
            >
              <option value="">Any</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-1.5 block">
              Property type
            </label>
            <select
              value={filters.propertyType ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  propertyType: (e.target.value as PropertyType) || undefined,
                  page: 1,
                }))
              }
              className="w-full h-11 rounded-2xl border border-gray-200 px-3 text-sm text-black/70 bg-white focus:outline-none focus:border-emerald-400"
            >
              <option value="">Any</option>
              {[
                "apartment",
                "house",
                "villa",
                "condominium",
                "land",
                "office",
                "warehouse",
                "shop",
                "mixed_use",
              ].map((type) => (
                <option key={type} value={type}>
                  {type
                    .replace("_", " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-1.5 block">
              Max price
            </label>
            <input
              type="number"
              value={filters.maxPrice ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  maxPrice: e.target.value ? Number(e.target.value) : undefined,
                  page: 1,
                }))
              }
              placeholder="Any"
              className="w-full h-11 rounded-2xl border border-gray-200 px-3 text-sm text-black/70 bg-white focus:outline-none focus:border-emerald-400"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-1.5 block">
              Min price
            </label>
            <input
              type="number"
              value={filters.minPrice ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  minPrice: e.target.value ? Number(e.target.value) : undefined,
                  page: 1,
                }))
              }
              placeholder="Any"
              className="w-full h-11 rounded-2xl border border-gray-200 px-3 text-sm text-black/70 bg-white focus:outline-none focus:border-emerald-400"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-1.5 block">
              Verified only
            </label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={filters.verifiedOnly ?? false}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    verifiedOnly: e.target.checked || undefined,
                    page: 1,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-black/70">
                Show verified listings only
              </span>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-1.5 block">
              Sort
            </label>
            <select
              value={filters.sort ?? "newest"}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  sort: e.target.value as ListingFilters["sort"],
                  page: 1,
                }))
              }
              className="w-full h-11 rounded-2xl border border-gray-200 px-3 text-sm text-black/70 bg-white focus:outline-none focus:border-emerald-400"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setFilters({ limit: 20, page: 1, sort: "newest" });
                setSearch("");
              }}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors"
            >
              <X size={12} /> Clear filters
            </button>
          </div>
        </div>
      )}

      {/* Map panel */}
      {showMap && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">Map Search</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMapMode('viewport')}
                className={cn('text-[10px] font-mono uppercase px-3 py-1.5 rounded-lg transition-colors',
                  mapMode === 'viewport' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-black/50 hover:bg-gray-200')}
              >
                Viewport
              </button>
              <button
                type="button"
                onClick={() => setMapMode('radius')}
                className={cn('text-[10px] font-mono uppercase px-3 py-1.5 rounded-lg transition-colors',
                  mapMode === 'radius' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-black/50 hover:bg-gray-200')}
              >
                Radius
              </button>
              <button
                type="button"
                onClick={() => setMapMode('polygon')}
                className={cn('text-[10px] font-mono uppercase px-3 py-1.5 rounded-lg transition-colors',
                  mapMode === 'polygon' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-black/50 hover:bg-gray-200')}
              >
                Polygon
              </button>
            </div>
          </div>
          {mapMode === 'radius' && (
            <div className="mb-4">
              <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-1.5 block">
                Search Radius (meters)
              </label>
              <input
                type="number"
                value={mapRadius}
                onChange={(e) => setMapRadius(Number(e.target.value))}
                className="w-full h-11 rounded-2xl border border-gray-200 px-3 text-sm text-black/70 bg-white focus:outline-none focus:border-emerald-400"
              />
            </div>
          )}
          <div className="h-[400px] rounded-xl overflow-hidden">
            <PropertyMap
              center={mapCenter}
              mode={mapMode}
              radius={mapRadius}
              polygon={mapPolygon}
              onViewportChange={handleViewportChange}
              onRadiusChange={handleRadiusChange}
              onPolygonChange={handlePolygonChange}
              listings={listings.map(l => ({
                id: l.id,
                lat: l.location.coordinates[1] ?? 0,
                lng: l.location.coordinates[0] ?? 0,
                title: l.title,
                price: l.price || l.monthlyRent || 0,
              }))}
              onListingClick={(id) => router.push(`/properties/${id}`)}
            />
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <Building2 className="w-10 h-10 text-black/15" />
          <p className="text-black/40 text-sm font-light">
            No properties found matching your search.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setFilters({ limit: 20, page: 1, sort: "newest" });
              setShowFilters(false);
            }}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold underline underline-offset-2"
          >
            Clear search and show all properties
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs text-black/35 font-mono mb-4">
            {normalizedSearch
              ? filteredListings.length
              : (listingsData?.total ?? listings.length)}{" "}
            properties found
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listingToSummary(listing)}
                href={`/properties/${listing.id}`}
                favoriteSlot={<FavoriteButton listingId={listing.id} />}
              />
            ))}
          </div>
          {/* Pagination */}
          {listingsData &&
            listingsData.total > listingsData.limit &&
            !normalizedSearch && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() =>
                    setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))
                  }
                  disabled={(filters.page ?? 1) <= 1}
                  className="text-xs font-medium px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <span className="text-xs text-black/40 font-mono">
                  Page {filters.page ?? 1} of{" "}
                  {Math.ceil(listingsData.total / listingsData.limit)}
                </span>
                <button
                  onClick={() =>
                    setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))
                  }
                  disabled={
                    (filters.page ?? 1) >=
                    Math.ceil(listingsData.total / listingsData.limit)
                  }
                  className="text-xs font-medium px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
        </>
      )}
      {/* Save search modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <BookmarkPlus className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  Save this search
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Active filters summary */}
            <div className="mb-4 flex flex-wrap gap-1.5">
              {(
                [
                  filters.listingType &&
                    (filters.listingType === "sale" ? "For Sale" : "For Rent"),
                  filters.category &&
                    (filters.category === "residential"
                      ? "Residential"
                      : "Commercial"),
                  filters.minBedrooms != null && `${filters.minBedrooms}+ beds`,
                  filters.minPrice != null &&
                    `From $${filters.minPrice.toLocaleString()}`,
                  filters.maxPrice != null &&
                    `Up to $${filters.maxPrice.toLocaleString()}`,
                  search.trim() && `"${search.trim()}"`,
                ].filter(Boolean) as string[]
              ).map((pill) => (
                <span
                  key={pill}
                  className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full"
                >
                  {pill}
                </span>
              ))}
              {!filters.listingType &&
                !filters.category &&
                !filters.minBedrooms &&
                !filters.minPrice &&
                !filters.maxPrice &&
                !search.trim() && (
                  <span className="text-[10px] text-gray-400 font-mono">
                    No filters — matches all listings
                  </span>
                )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1 block">
                  Search name
                </label>
                <input
                  type="text"
                  value={saveModalName}
                  onChange={(e) => setSaveModalName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && confirmSave()}
                  placeholder="e.g. 2-bed in Geneva"
                  autoFocus
                  className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-400 bg-gray-50 transition-colors"
                />
              </div>

              <button
                type="button"
                onClick={() => setSaveModalAlert((v) => !v)}
                className={cn(
                  "flex items-center gap-2 w-full px-4 py-2.5 rounded-xl border text-xs font-medium transition-colors",
                  saveModalAlert
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-gray-50 border-gray-200 text-gray-500",
                )}
              >
                {saveModalAlert ? (
                  <Bell className="w-3.5 h-3.5" />
                ) : (
                  <BellOff className="w-3.5 h-3.5" />
                )}
                {saveModalAlert
                  ? "Email alerts ON — notify me of new matches"
                  : "Email alerts OFF"}
              </button>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={confirmSave}
                  disabled={savingSearch || !saveModalName.trim()}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
                >
                  {savingSearch ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  Save search
                </button>
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Owner: My Listings ────────────────────────────────────────────────────────

function OwnerView() {
  const { currentUser } = useAuthStore();
  const { data: listings = [], isLoading } = useMyListings();
  const { mutate: deleteListing, isPending: deleting } = useDeleteListing();

  const canSubmit =
    currentUser?.status === "ACTIVE" && currentUser?.kycStatus === "verified";

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-purple-500 shrink-0" />
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">
              Property Owner
            </p>
            <h1 className="text-2xl font-light text-[#0f172a] tracking-tight">
              My Listings
            </h1>
          </div>
        </div>
        <Link
          href="/properties/create"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={14} /> New Listing
        </Link>
      </div>

      {!canSubmit && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            Your account or KYC is not fully verified. You can create drafts but
            cannot submit for review until your KYC is approved.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <Building2 className="w-10 h-10 text-black/15 mx-auto mb-3" />
          <p className="text-sm text-black/40 font-light mb-4">
            You have not created any listings yet.
          </p>
          <Link
            href="/properties/create"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={14} /> Create First Listing
          </Link>
        </div>
      ) : (
        <OwnerListingsTable
          listings={listings}
          onDelete={(id) => deleteListing(id)}
          isDeleting={deleting}
        />
      )}
    </div>
  );
}

// ─── Owner listings table ─────────────────────────────────────────────────────

function OwnerListingsTable({
  listings,
  onDelete,
  isDeleting,
}: {
  listings: Listing[];
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const STATUS_COLORS: Record<string, string> = {
    draft: "bg-gray-100 text-gray-500",
    submitted: "bg-amber-50 text-amber-600",
    under_review: "bg-emerald-50 text-emerald-600",
    approved: "bg-emerald-50 text-emerald-600",
    published: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-50 text-red-600",
    suspended: "bg-orange-50 text-orange-600",
    rented: "bg-sky-50 text-sky-600",
    sold: "bg-purple-50 text-purple-600",
    archived: "bg-gray-100 text-gray-400",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Title", "Type", "Price", "Status", "Verification", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-black/40"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr
                key={l.id}
                className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-black/80 truncate max-w-xs">
                    {l.title}
                  </p>
                  <p className="text-[10px] text-black/35 font-mono">
                    {l.address.city}, {l.address.country}
                  </p>
                </td>
                <td className="px-4 py-3 text-xs text-black/60 capitalize">
                  {l.listingType}
                </td>
                <td className="px-4 py-3 text-xs font-semibold text-black/80">
                  {l.listingType === "rent"
                    ? `$${l.monthlyRent?.toLocaleString()}/mo`
                    : `$${l.price?.toLocaleString()}`}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "text-[10px] font-mono uppercase px-2 py-0.5 rounded",
                      STATUS_COLORS[l.status] ?? "bg-gray-100 text-gray-500",
                    )}
                  >
                    {l.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('text-[10px] font-mono uppercase px-2 py-0.5 rounded',
                    l.verificationStatus === 'verified' ? 'bg-emerald-50 text-emerald-600' :
                    l.verificationStatus === 'pending'  ? 'bg-amber-50 text-amber-600' :
                    l.verificationStatus === 'requires_more_info' ? 'bg-blue-50 text-blue-600' :
                    l.verificationStatus === 'rejected' ? 'bg-red-50 text-red-500' :
                    'bg-gray-100 text-gray-400')}>
                    {l.verificationStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <Link
                      href={`/properties/${l.id}`}
                      className="text-[10px] font-mono text-black/40 hover:text-black/70 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                    >
                      View
                    </Link>
                    {(l.status === "draft" || l.status === "rejected") && (
                      <Link
                        href={`/properties/${l.id}/edit`}
                        className="text-[10px] font-mono text-emerald-500 hover:text-emerald-600 px-2 py-1 rounded hover:bg-emerald-50 transition-colors"
                      >
                        Edit
                      </Link>
                    )}
                    {(l.status === "draft" || l.status === "rejected") && (
                      <button
                        type="button"
                        onClick={() => onDelete(l.id)}
                        disabled={isDeleting}
                        className="text-[10px] font-mono text-red-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-40"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Admin: Review queue ──────────────────────────────────────────────────────

function AdminView() {
  const [statusFilter, setStatusFilter] = useState("submitted");
  const { data, isLoading } = useAdminListings({
    status: statusFilter,
    limit: 20,
  });
  const { data: stats } = useAdminListingsStats();
  const listings = data?.items ?? [];

  const STATUS_TABS = [
    "submitted",
    "under_review",
    "approved",
    "published",
    "rejected",
    "suspended",
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-6 h-6 text-emerald-500 shrink-0" />
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">
            Admin
          </p>
          <h1 className="text-2xl font-light text-[#0f172a] tracking-tight">
            Listing Review Queue
          </h1>
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-[10px] font-mono uppercase text-black/35 mb-1">Total Listings</p>
            <p className="text-2xl font-semibold text-black/80">{String(stats.total ?? 0)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-[10px] font-mono uppercase text-black/35 mb-1">Pending Review</p>
            <p className="text-2xl font-semibold text-amber-600">{String(stats.pendingReview ?? 0)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-[10px] font-mono uppercase text-black/35 mb-1">Published</p>
            <p className="text-2xl font-semibold text-emerald-600">{String((stats.byStatus as any)?.published ?? 0)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-[10px] font-mono uppercase text-black/35 mb-1">Verified</p>
            <p className="text-2xl font-semibold text-emerald-600">{String((stats.byVerification as any)?.verified ?? 0)}</p>
          </div>
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-1 flex-wrap mb-5">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={cn(
              "text-[10px] font-mono uppercase tracking-wide px-3 py-1.5 rounded-lg transition-colors",
              statusFilter === s
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-black/50 hover:bg-gray-200",
            )}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <p className="text-sm text-black/40 font-light">
            No listings with status {statusFilter}.
          </p>
        </div>
      ) : (
        <AdminListingsTable listings={listings} />
      )}
    </div>
  );
}

// ─── Admin listings table ─────────────────────────────────────────────────────

function AdminListingsTable({ listings }: { listings: Listing[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Title", "Owner", "Type", "Verification", "Status", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-black/40"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr
                key={l.id}
                className="border-b border-gray-100 hover:bg-gray-50/50"
              >
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-black/80 truncate max-w-xs">
                    {l.title}
                  </p>
                  <p className="text-[10px] text-black/35 font-mono">
                    {l.address.city}
                  </p>
                </td>
                <td className="px-4 py-3 text-[10px] text-black/50 font-mono">
                  {l.createdBy}
                </td>
                <td className="px-4 py-3 text-xs text-black/60 capitalize">
                  {l.listingType} / {l.propertyType}
                </td>
                <td className="px-4 py-3">
                  <span className={cn('text-[10px] font-mono uppercase px-2 py-0.5 rounded',
                    l.verificationStatus === 'verified' ? 'bg-emerald-50 text-emerald-600' :
                    l.verificationStatus === 'pending'  ? 'bg-amber-50 text-amber-600' :
                    l.verificationStatus === 'requires_more_info' ? 'bg-blue-50 text-blue-600' :
                    l.verificationStatus === 'rejected' ? 'bg-red-50 text-red-500' :
                    'bg-gray-100 text-gray-400')}>
                    {l.verificationStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded">
                    {l.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/properties/${l.id}`}
                    className="text-[10px] font-mono text-emerald-500 hover:text-emerald-600 px-2 py-1 rounded hover:bg-emerald-50 transition-colors"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
