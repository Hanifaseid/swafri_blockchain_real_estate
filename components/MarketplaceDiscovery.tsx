'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  Building2,
  CheckCircle2,
  ChevronDown,
  List,
  LocateFixed,
  MapIcon,
  MapPin,
  MousePointer2,
  PenLine,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ListingCard } from '@/components/listing/ListingCard';
import { cn } from '@/lib/utils';
import {
  useGeocode,
  useListingClusters,
  useListings,
  useNeighborhoodAnalytics,
  useNeighborhoods,
  useReverseGeocode,
  useSaveSearch,
} from '@/features/listings/queries/listing.queries';
import type {
  GeocodeResult,
  ListingFilters,
  ListingType,
} from '@/features/listings/types/listing.types';
import { listingToSummary } from '@/features/listings/types/listing.types';
import type { MapSearchMode } from '@/components/map/PropertyMap';

// Map is client-only (Leaflet touches window). Isolated in its own pane below.
const PropertyMap = dynamic(
  () => import('@/components/map/PropertyMap').then((mod) => mod.PropertyMap),
  { ssr: false },
);

type SearchMode = 'viewport' | 'radius' | 'polygon';
const DEFAULT_CENTER: [number, number] = [38.7578, 8.9806];

const MODES: { value: SearchMode; label: string; icon: typeof MousePointer2 }[] = [
  { value: 'viewport', label: 'Area', icon: MousePointer2 },
  { value: 'radius', label: 'Radius', icon: LocateFixed },
  { value: 'polygon', label: 'Draw', icon: PenLine },
];

function money(value?: number) {
  if (!value) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

// ─── Shared control styles ─────────────────────────────────────────────────────
const fieldCls =
  'h-10 rounded-lg border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-amber-300/70';
const selectCls = 'h-10 rounded-lg border border-white/10 bg-[#171511] px-3 text-sm text-white outline-none focus:border-amber-300/70';

export function MarketplaceDiscovery() {
  const [query, setQuery] = useState('');
  const [geocodeQuery, setGeocodeQuery] = useState('');
  const [selectedGeocode, setSelectedGeocode] = useState<GeocodeResult | null>(null);
  const [mode, setMode] = useState<SearchMode>('viewport');
  const [listingType, setListingType] = useState<ListingType | ''>('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [radiusKm, setRadiusKm] = useState(5);
  const [viewport, setViewport] = useState<Pick<ListingFilters, 'swLng' | 'swLat' | 'neLng' | 'neLat'>>({});
  const [radiusCenter, setRadiusCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [autoZoom, setAutoZoom] = useState(11);
  const locatedRef = useRef(false);
  const [polygon, setPolygon] = useState<[number, number][]>([]);
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<string | undefined>();
  const [reversePoint, setReversePoint] = useState<[number, number] | null>(null);

  // Advanced filters
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState<'' | 'residential' | 'commercial'>('');
  const [propertyType, setPropertyType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minBeds, setMinBeds] = useState('');
  const [minBaths, setMinBaths] = useState('');
  const [sort, setSort] = useState<NonNullable<ListingFilters['sort']>>('newest');

  // Mobile: which pane is visible (map never covers the list)
  const [view, setView] = useState<'list' | 'map'>('list');

  // On first load, center the map on the user's current location (falls back
  // to the default center if permission is denied or geolocation is unavailable).
  useEffect(() => {
    if (locatedRef.current || typeof navigator === 'undefined' || !navigator.geolocation) return;
    locatedRef.current = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setRadiusCenter([pos.coords.longitude, pos.coords.latitude]);
        setAutoZoom(13);
      },
      () => {
        /* denied / unavailable — keep the default center */
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  }, []);

  const resetFilters = () => {
    setCategory('');
    setPropertyType('');
    setMinPrice('');
    setMaxPrice('');
    setMinBeds('');
    setMinBaths('');
    setSort('newest');
    setListingType('');
    setVerifiedOnly(false);
  };

  const activeFilterCount =
    (category ? 1 : 0) +
    (propertyType ? 1 : 0) +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (minBeds ? 1 : 0) +
    (minBaths ? 1 : 0);

  const filters = useMemo<ListingFilters>(() => {
    const next: ListingFilters = {
      q: query || undefined,
      listingType: listingType || undefined,
      verifiedOnly,
      availabilityStatus: 'available',
      sort,
      limit: 24,
    };
    if (category) next.category = category;
    if (propertyType) next.propertyType = propertyType as ListingFilters['propertyType'];
    if (minPrice) next.minPrice = Number(minPrice);
    if (maxPrice) next.maxPrice = Number(maxPrice);
    if (minBeds) next.minBedrooms = Number(minBeds);
    if (minBaths) next.minBathrooms = Number(minBaths);
    if (mode === 'viewport') Object.assign(next, viewport);
    if (mode === 'radius') {
      next.lng = radiusCenter[0];
      next.lat = radiusCenter[1];
      next.radius = radiusKm * 1000;
    }
    if (mode === 'polygon' && polygon.length >= 3) next.polygon = polygon;
    return next;
  }, [
    category, listingType, maxPrice, minBaths, minBeds, minPrice, mode,
    polygon, propertyType, query, radiusCenter, radiusKm, sort, verifiedOnly, viewport,
  ]);

  const listings = useListings(filters);
  const clusters = useListingClusters({ ...filters, zoom: mode === 'viewport' ? 11 : 13 });
  const geocodeResults = useGeocode(geocodeQuery);
  const neighborhoods = useNeighborhoods({ limit: 12 });
  const neighborhoodAnalytics = useNeighborhoodAnalytics(selectedNeighborhoodId);
  const reverse = useReverseGeocode(reversePoint?.[1], reversePoint?.[0]);
  const saveSearch = useSaveSearch();

  const items = listings.data?.items ?? [];
  const total = listings.data?.total ?? 0;

  const mapListings = useMemo(
    () =>
      items.map((listing) => ({
        id: listing.id,
        title: listing.title,
        price: listing.price ?? listing.monthlyRent ?? 0,
        lng: listing.location.coordinates[0],
        lat: listing.location.coordinates[1],
      })),
    [items],
  );

  const handleGeocodePick = (result: GeocodeResult) => {
    const nextCenter: [number, number] = [result.lng, result.lat];
    setSelectedGeocode(result);
    setRadiusCenter(nextCenter);
    setReversePoint(nextCenter);
    setMode('radius');
    setGeocodeQuery('');
  };

  const handleSaveSearch = () =>
    saveSearch.mutate({
      name: query || selectedGeocode?.label || 'Property search',
      alertEnabled: true,
      query: filters,
    });

  const summary = neighborhoodAnalytics.data;

  return (
    <div className="flex h-[calc(100vh-72px)] flex-col bg-[#0d0c0a] text-white">
      {/* ═══ Filter bar ═══ */}
      <div className="z-30 shrink-0 border-b border-white/10 bg-[#11100d]">
        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
          {/* Listing search */}
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search listings by title, address, or feature"
              className={cn(fieldCls, 'h-10 w-full pl-9')}
            />
          </div>

          {/* Geocode (recenter map) */}
          <div className="relative w-full sm:w-56">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-300/70" />
            <input
              value={geocodeQuery}
              onChange={(e) => setGeocodeQuery(e.target.value)}
              placeholder="Jump to a place"
              className={cn(fieldCls, 'h-10 w-full pl-9')}
            />
            {geocodeResults.data && geocodeResults.data.length > 0 && (
              <div className="absolute z-40 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-white/10 bg-[#171511] shadow-2xl">
                {geocodeResults.data.map((r) => (
                  <button
                    key={`${r.lat}-${r.lng}-${r.label}`}
                    onClick={() => handleGeocodePick(r)}
                    className="flex w-full items-start gap-2 border-b border-white/5 px-3 py-2 text-left text-sm text-white/80 last:border-b-0 hover:bg-white/[0.06]"
                  >
                    <LocateFixed className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <select
            value={listingType}
            onChange={(e) => setListingType(e.target.value as ListingType | '')}
            className={selectCls}
          >
            <option value="">Sale &amp; rent</option>
            <option value="sale">For sale</option>
            <option value="rent">For rent</option>
          </select>

          <button
            onClick={() => setVerifiedOnly((v) => !v)}
            className={cn(
              'flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium',
              verifiedOnly
                ? 'border-amber-300/70 bg-amber-400 text-emerald-950'
                : 'border-white/10 bg-white/[0.06] text-white/75 hover:bg-white/10',
            )}
          >
            <CheckCircle2 size={15} />
            Verified
          </button>

          <button
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              'relative flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium',
              showFilters || activeFilterCount > 0
                ? 'border-amber-300/70 bg-amber-400 text-emerald-950'
                : 'border-white/10 bg-white/[0.06] text-white/75 hover:bg-white/10',
            )}
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-800 text-[9px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as NonNullable<ListingFilters['sort']>)}
              className={cn(selectCls, 'appearance-none pr-8')}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          </div>

          <Button onClick={handleSaveSearch} loading={saveSearch.isPending} variant="outline" size="sm" className="h-10">
            <Bell size={15} />
            <span className="hidden sm:inline">Save alert</span>
          </Button>
        </div>

        {/* Advanced filters (collapsible) */}
        {showFilters && (
          <div className="border-t border-white/5 px-4 py-3">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
              <select value={category} onChange={(e) => setCategory(e.target.value as typeof category)} className={selectCls}>
                <option value="">Any category</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
              <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className={selectCls}>
                <option value="">Any type</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="condominium">Condominium</option>
                <option value="land">Land</option>
                <option value="commercial_space">Commercial space</option>
                <option value="office">Office</option>
                <option value="warehouse">Warehouse</option>
                <option value="shop">Shop</option>
                <option value="mixed_use">Mixed use</option>
              </select>
              <input type="number" min={0} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min price" className={fieldCls} />
              <input type="number" min={0} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max price" className={fieldCls} />
              <select value={minBeds} onChange={(e) => setMinBeds(e.target.value)} className={selectCls}>
                <option value="">Any beds</option>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+ beds</option>)}
              </select>
              <select value={minBaths} onChange={(e) => setMinBaths(e.target.value)} className={selectCls}>
                <option value="">Any baths</option>
                {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+ baths</option>)}
              </select>
            </div>
            {activeFilterCount > 0 && (
              <button onClick={resetFilters} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-300 hover:text-amber-200">
                <X size={12} /> Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Result count + neighborhood chips + mobile toggle */}
        <div className="flex items-center gap-3 border-t border-white/5 px-4 py-2">
          <span className="shrink-0 text-sm text-white/55">
            <span className="font-semibold text-white">{total.toLocaleString()}</span> properties
          </span>
          <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto scrollbar-none">
            {(neighborhoods.data ?? []).map((n) => (
              <button
                key={n.id}
                onClick={() => setSelectedNeighborhoodId((cur) => (cur === n.id ? undefined : n.id))}
                className={cn(
                  'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  selectedNeighborhoodId === n.id
                    ? 'border-amber-300/70 bg-amber-400 text-emerald-950'
                    : 'border-white/10 bg-white/[0.06] text-white/65 hover:bg-white/10',
                )}
              >
                {n.name}
              </button>
            ))}
          </div>
          {/* Mobile pane toggle */}
          <div className="ml-auto flex shrink-0 overflow-hidden rounded-lg border border-white/10 lg:hidden">
            <button
              onClick={() => setView('list')}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold', view === 'list' ? 'bg-amber-400 text-emerald-950' : 'text-white/70')}
            >
              <List size={14} /> List
            </button>
            <button
              onClick={() => setView('map')}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold', view === 'map' ? 'bg-amber-400 text-emerald-950' : 'text-white/70')}
            >
              <MapIcon size={14} /> Map
            </button>
          </div>
        </div>
      </div>

      {/* ═══ Body: results + map ═══ */}
      <div className="flex min-h-0 flex-1">
        {/* Results column — flexes to fill the space left of the fixed map panel */}
        <div
          className={cn(
            'flex min-h-0 w-full flex-1 flex-col lg:min-w-0',
            view === 'map' && 'hidden lg:flex',
          )}
        >
          {/* Neighborhood analytics (when selected) */}
          {summary && (
            <div className="shrink-0 border-b border-white/10 bg-[#11100d] px-4 py-3">
              <div className="grid grid-cols-3 gap-2 rounded-lg border border-amber-300/20 bg-amber-400/[0.06] p-3 text-xs">
                <div>
                  <p className="text-white/45">Listings</p>
                  <p className="font-display text-base font-semibold text-white">{summary.listingCount ?? 0}</p>
                </div>
                <div>
                  <p className="text-white/45">Avg price</p>
                  <p className="font-display text-base font-semibold text-white">{money(summary.averagePrice)}</p>
                </div>
                <div>
                  <p className="text-white/45">Avg rent</p>
                  <p className="font-display text-base font-semibold text-white">{money(summary.averageRent)}</p>
                </div>
              </div>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin p-4">
            {listings.isLoading ? (
              <div className="grid gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-24 animate-pulse rounded-xl border border-white/5 bg-white/[0.04]" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-8 text-center">
                <Building2 className="mx-auto h-8 w-8 text-amber-300" />
                <p className="mt-3 text-sm font-medium">No properties in this search</p>
                <p className="mt-1 text-xs text-white/50">Pan the map, widen the radius, or clear a filter.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {items.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listingToSummary(listing)}
                    href={`/properties/${listing.id}`}
                    variant="compact"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map pane — FIXED-WIDTH side panel on desktop (can't dominate the page);
            isolated stacking context so Leaflet can't escape over the nav */}
        <div
          className={cn(
            'relative isolate min-h-0 w-full overflow-hidden border-l border-white/10 bg-[#ded6c9] lg:w-[440px] lg:shrink-0 xl:w-[560px] 2xl:w-[640px]',
            view === 'list' && 'hidden lg:block',
          )}
        >
          <PropertyMap
            center={radiusCenter}
            zoom={selectedGeocode ? 14 : autoZoom}
            mode={mode as MapSearchMode}
            radius={radiusKm * 1000}
            polygon={polygon}
            listings={mapListings}
            clusters={clusters.data ?? []}
            onViewportChange={setViewport}
            onRadiusChange={(c) => {
              setRadiusCenter(c);
              setReversePoint(c);
            }}
            onPolygonChange={setPolygon}
            onListingClick={(id) => {
              window.location.href = `/properties/${id}`;
            }}
          />

          {/* Search-mode switcher (floats over the map, contained by `isolate`) */}
          <div className="absolute left-3 top-3 z-[500] flex gap-1 rounded-xl border border-white/10 bg-[#11100d]/92 p-1 shadow-xl backdrop-blur">
            {MODES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setMode(value)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors',
                  mode === value ? 'bg-amber-400 text-emerald-950' : 'text-white/70 hover:text-white',
                )}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {/* Radius control (only in radius mode) */}
          {mode === 'radius' && (
            <div className="absolute bottom-4 left-3 z-[500] w-60 rounded-xl border border-white/10 bg-[#11100d]/92 p-3 shadow-xl backdrop-blur">
              <div className="flex items-center justify-between text-xs text-white/80">
                <span className="font-semibold">Search radius</span>
                <span className="font-mono text-amber-300">{radiusKm} km</span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="mt-2 w-full accent-amber-400"
              />
              <p className="mt-1.5 truncate text-[11px] text-white/45">
                {reverse.data?.label ?? selectedGeocode?.label ?? 'Click the map to set a center.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
