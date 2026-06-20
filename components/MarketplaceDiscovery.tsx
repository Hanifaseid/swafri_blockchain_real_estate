'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Bell,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  LocateFixed,
  MapPin,
  MousePointer2,
  PenLine,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ListingCard } from '@/components/listing/ListingCard';
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
import { useAuthStore } from '@/stores/auth.store';

const PropertyMap = dynamic(
  () => import('@/components/map/PropertyMap').then((mod) => mod.PropertyMap),
  { ssr: false },
);

type SearchMode = 'viewport' | 'radius' | 'polygon';

const DEFAULT_CENTER: [number, number] = [38.7578, 8.9806];

function money(value?: number) {
  if (!value) return 'Market data pending';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function MarketplaceDiscovery() {
  const { currentUser } = useAuthStore();
  const [query, setQuery] = useState('');
  const [geocodeQuery, setGeocodeQuery] = useState('');
  const [selectedGeocode, setSelectedGeocode] = useState<GeocodeResult | null>(null);
  const [mode, setMode] = useState<SearchMode>('viewport');
  const [listingType, setListingType] = useState<ListingType | ''>('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [radiusKm, setRadiusKm] = useState(5);
  const [viewport, setViewport] = useState<Pick<ListingFilters, 'swLng' | 'swLat' | 'neLng' | 'neLat'>>({});
  const [radiusCenter, setRadiusCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [polygon, setPolygon] = useState<[number, number][]>([]);
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<string | undefined>();
  const [reversePoint, setReversePoint] = useState<[number, number] | null>(null);

  const filters = useMemo<ListingFilters>(() => {
    const next: ListingFilters = {
      q: query || undefined,
      listingType: listingType || undefined,
      verifiedOnly,
      availabilityStatus: 'available',
      sort: 'newest',
      limit: 24,
    };
    if (mode === 'viewport') Object.assign(next, viewport);
    if (mode === 'radius') {
      next.lng = radiusCenter[0];
      next.lat = radiusCenter[1];
      next.radius = radiusKm * 1000;
    }
    if (mode === 'polygon' && polygon.length >= 3) next.polygon = polygon;
    return next;
  }, [listingType, mode, polygon, query, radiusCenter, radiusKm, verifiedOnly, viewport]);

  const listings = useListings(filters);
  const clusters = useListingClusters({ ...filters, zoom: mode === 'viewport' ? 11 : 13 });
  const geocodeResults = useGeocode(geocodeQuery);
  const neighborhoods = useNeighborhoods({ limit: 8 });
  const neighborhoodAnalytics = useNeighborhoodAnalytics(selectedNeighborhoodId);
  const reverse = useReverseGeocode(reversePoint?.[1], reversePoint?.[0]);
  const saveSearch = useSaveSearch();

  const mapListings = useMemo(
    () =>
      (listings.data?.items ?? []).map((listing) => ({
        id: listing.id,
        title: listing.title,
        price: listing.price ?? listing.monthlyRent ?? 0,
        lng: listing.location.coordinates[0],
        lat: listing.location.coordinates[1],
      })),
    [listings.data?.items],
  );

  const handleGeocodePick = (result: GeocodeResult) => {
    const nextCenter: [number, number] = [result.lng, result.lat];
    setSelectedGeocode(result);
    setRadiusCenter(nextCenter);
    setReversePoint(nextCenter);
    setMode('radius');
  };

  const handleSaveSearch = () => {
    saveSearch.mutate({
      name: query || selectedGeocode?.label || `${mode} property search`,
      alertEnabled: true,
      query: filters,
    });
  };

  const summary = neighborhoodAnalytics.data;

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#17251d]">
      <header className="border-b border-[#d9cebb] bg-[#f9f6ef]/95 px-4 py-4 backdrop-blur md:px-6">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="font-display text-2xl font-semibold tracking-normal text-[#163c2c]">
            TerraChain
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/account/saved">Saved</Link>
            </Button>
            {currentUser?.role === 'PROPERTY_OWNER' && (
              <Button asChild variant="outline">
                <Link href="/account/listings">My listings</Link>
              </Button>
            )}
            {currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN' ? (
              <Button asChild>
                <Link href="/dashboard">Admin dashboard</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/account/profile">Account</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto grid h-[calc(100vh-73px)] max-w-[1800px] grid-cols-1 lg:grid-cols-[430px_minmax(0,1fr)]">
        <aside className="order-2 flex min-h-0 flex-col border-r border-[#d9cebb] bg-[#fbf8f1] lg:order-1">
          <div className="space-y-4 border-b border-[#d9cebb] p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6f3c]">
                Blockchain-enabled property listings
              </p>
              <h1 className="mt-2 font-display text-3xl font-semibold text-[#153828]">
                Map-based discovery with verified title context
              </h1>
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5f6b61]">
                Search
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d766d]" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="City, address, feature, or listing"
                    className="h-11 w-full rounded-lg border border-[#d5c8b3] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#1e5a3d]"
                  />
                </div>
                <Button variant="outline" size="icon" title="Filters">
                  <SlidersHorizontal size={16} />
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5f6b61]">
                Geocode location
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d766d]" />
                <input
                  value={geocodeQuery}
                  onChange={(event) => setGeocodeQuery(event.target.value)}
                  placeholder="Search an address or neighborhood"
                  className="h-11 w-full rounded-lg border border-[#d5c8b3] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#1e5a3d]"
                />
              </div>
              {geocodeResults.data && geocodeResults.data.length > 0 && (
                <div className="max-h-36 overflow-auto rounded-lg border border-[#d5c8b3] bg-white">
                  {geocodeResults.data.map((result) => (
                    <button
                      key={`${result.lat}-${result.lng}-${result.label}`}
                      onClick={() => handleGeocodePick(result)}
                      className="flex w-full items-start gap-2 border-b border-[#eee6d8] px-3 py-2 text-left text-sm last:border-b-0 hover:bg-[#f4f0e8]"
                    >
                      <LocateFixed className="mt-0.5 h-4 w-4 shrink-0 text-[#1e5a3d]" />
                      <span>{result.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'viewport', label: 'Viewport', icon: MousePointer2 },
                { value: 'radius', label: 'Radius', icon: LocateFixed },
                { value: 'polygon', label: 'Boundary', icon: PenLine },
              ].map((item) => {
                const Icon = item.icon;
                const active = mode === item.value;
                return (
                  <button
                    key={item.value}
                    onClick={() => setMode(item.value as SearchMode)}
                    className={`flex h-10 items-center justify-center gap-2 rounded-lg border text-xs font-semibold ${
                      active
                        ? 'border-[#1e5a3d] bg-[#163c2c] text-[#f4d38b]'
                        : 'border-[#d5c8b3] bg-white text-[#294034]'
                    }`}
                  >
                    <Icon size={14} />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {mode === 'radius' && (
              <div className="rounded-lg border border-[#d5c8b3] bg-white p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Radius</span>
                  <span>{radiusKm} km</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={radiusKm}
                  onChange={(event) => setRadiusKm(Number(event.target.value))}
                  className="mt-3 w-full accent-[#1e5a3d]"
                />
                <p className="mt-2 text-xs text-[#6d766d]">
                  {reverse.data?.label ?? selectedGeocode?.label ?? 'Click the map to set a search center.'}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <select
                value={listingType}
                onChange={(event) => setListingType(event.target.value as ListingType | '')}
                className="h-10 rounded-lg border border-[#d5c8b3] bg-white px-3 text-sm"
              >
                <option value="">Sale and rent</option>
                <option value="sale">For sale</option>
                <option value="rent">For rent</option>
              </select>
              <button
                onClick={() => setVerifiedOnly((value) => !value)}
                className={`flex h-10 items-center justify-center gap-2 rounded-lg border text-sm ${
                  verifiedOnly
                    ? 'border-[#1e5a3d] bg-[#e7f0e8] text-[#163c2c]'
                    : 'border-[#d5c8b3] bg-white text-[#294034]'
                }`}
              >
                <CheckCircle2 size={15} />
                Verified
              </button>
            </div>

            <Button onClick={handleSaveSearch} loading={saveSearch.isPending} className="w-full">
              <Bell size={16} />
              Save search alert
            </Button>
          </div>

          <div className="grid gap-3 border-b border-[#d9cebb] p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#5f6b61]">
                Neighborhoods
              </h2>
              <span className="text-xs text-[#6d766d]">{neighborhoods.data?.length ?? 0}</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {(neighborhoods.data ?? []).map((neighborhood) => (
                <button
                  key={neighborhood.id}
                  onClick={() => setSelectedNeighborhoodId(neighborhood.id)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${
                    selectedNeighborhoodId === neighborhood.id
                      ? 'border-[#1e5a3d] bg-[#163c2c] text-[#f4d38b]'
                      : 'border-[#d5c8b3] bg-white text-[#294034]'
                  }`}
                >
                  {neighborhood.name}
                </button>
              ))}
            </div>
            {summary && (
              <div className="grid grid-cols-3 gap-2 rounded-lg border border-[#d5c8b3] bg-white p-3 text-xs">
                <div>
                  <p className="text-[#6d766d]">Listings</p>
                  <p className="font-semibold">{summary.listingCount}</p>
                </div>
                <div>
                  <p className="text-[#6d766d]">Avg price</p>
                  <p className="font-semibold">{money(summary.averagePrice)}</p>
                </div>
                <div>
                  <p className="text-[#6d766d]">Avg rent</p>
                  <p className="font-semibold">{money(summary.averageRent)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-[#5f6b61]">
                {(listings.data?.total ?? 0).toLocaleString()} matching properties
              </p>
              <p className="text-xs text-[#8a6f3c]">
                {clusters.data?.length ?? 0} map clusters
              </p>
            </div>
            <div className="grid gap-3">
              {(listings.data?.items ?? []).map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listingToSummary(listing)}
                  href={`/properties/${listing.id}`}
                  variant="compact"
                />
              ))}
              {!listings.isLoading && (listings.data?.items ?? []).length === 0 && (
                <div className="rounded-lg border border-[#d5c8b3] bg-white p-6 text-center">
                  <Building2 className="mx-auto h-8 w-8 text-[#8a6f3c]" />
                  <p className="mt-3 text-sm font-medium">No listings in this search area</p>
                  <p className="mt-1 text-xs text-[#6d766d]">
                    Move the map, widen the radius, or clear a filter.
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        <section className="order-1 min-h-[52vh] bg-[#ded6c9] lg:order-2 lg:min-h-0">
          <div className="relative h-full">
            <PropertyMap
              center={radiusCenter}
              zoom={selectedGeocode ? 14 : 11}
              mode={mode as MapSearchMode}
              radius={radiusKm * 1000}
              polygon={polygon}
              listings={mapListings}
              clusters={clusters.data ?? []}
              onViewportChange={setViewport}
              onRadiusChange={(center) => {
                setRadiusCenter(center);
                setReversePoint(center);
              }}
              onPolygonChange={setPolygon}
              onListingClick={(id) => {
                window.location.href = `/properties/${id}`;
              }}
            />
            <div className="pointer-events-none absolute left-4 top-4 z-[1000] flex gap-2">
              <div className="rounded-lg border border-white/70 bg-[#163c2c]/95 px-3 py-2 text-xs font-semibold text-[#f4d38b] shadow-lg">
                Digital title verification
              </div>
              <div className="hidden rounded-lg border border-white/70 bg-white/95 px-3 py-2 text-xs font-semibold text-[#163c2c] shadow-lg sm:flex sm:items-center sm:gap-1">
                <CircleDollarSign size={14} />
                Lease and purchase escrow
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
