"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { PropertyListingCard } from "@/components/listing/PropertyListingCard";
import { useListings } from "@/features/listings/queries/listing.queries";
import type {
  Listing,
  ListingFilters,
  ListingType,
} from "@/features/listings/types/listing.types";
import { cn } from "@/lib/utils";

const PROPERTY_TYPES = [
  { value: "", label: "All types" },
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "villa", label: "Villa" },
  { value: "condominium", label: "Condominium" },
  { value: "land", label: "Land" },
  { value: "commercial_space", label: "Commercial" },
  { value: "office", label: "Office" },
  { value: "warehouse", label: "Warehouse" },
  { value: "shop", label: "Shop" },
  { value: "mixed_use", label: "Mixed use" },
];

const PAGE_SIZE = 12;

const fieldCls =
  "h-10 rounded-lg border border-border-primary bg-surface-input px-3 text-sm text-white outline-none placeholder:text-text-placeholder focus:border-accent-400 transition-colors";
const selectCls =
  "h-10 rounded-lg border border-border-primary bg-[#171511] px-3 text-sm text-white outline-none focus:border-accent-400 transition-colors";

export default function ListingsPage() {
  const [query, setQuery] = useState("");
  const [listingType, setListingType] = useState<ListingType | "">("");
  const [category, setCategory] = useState<"" | "residential" | "commercial">(
    "",
  );
  const [propertyType, setPropertyType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minBeds, setMinBeds] = useState("");
  const [minBaths, setMinBaths] = useState("");
  const [sort, setSort] =
    useState<NonNullable<ListingFilters["sort"]>>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const activeFilterCount =
    (category ? 1 : 0) +
    (propertyType ? 1 : 0) +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (minBeds ? 1 : 0) +
    (minBaths ? 1 : 0);

  const resetFilters = () => {
    setCategory("");
    setPropertyType("");
    setMinPrice("");
    setMaxPrice("");
    setMinBeds("");
    setMinBaths("");
    setSort("newest");
    setListingType("");
    setPage(1);
  };

  const filters = useMemo<ListingFilters>(() => {
    const next: ListingFilters = {
      q: query || undefined,
      listingType: listingType || undefined,
      availabilityStatus: "available",
      sort,
      page,
      limit: PAGE_SIZE,
    };
    if (category) next.category = category;
    if (propertyType)
      next.propertyType = propertyType as ListingFilters["propertyType"];
    if (minPrice) next.minPrice = Number(minPrice);
    if (maxPrice) next.maxPrice = Number(maxPrice);
    if (minBeds) next.minBedrooms = Number(minBeds);
    if (minBaths) next.minBathrooms = Number(minBaths);
    return next;
  }, [
    category,
    listingType,
    maxPrice,
    minBaths,
    minBeds,
    minPrice,
    page,
    propertyType,
    query,
    sort,
  ]);

  const { data, isLoading } = useListings(filters);
  const items: Listing[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen">
      {/* ═══ Hero header ═══ */}
      <div className="relative overflow-hidden border-b border-border-primary ">
        {/* Subtle radial glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(189,139,39,0.08),transparent)]" />

        <div className="relative pb-6 pt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-400">
            Marketplace
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold text-white lg:text-5xl">
            Browse Properties
          </h1>
          <p className="mt-2 max-w-lg text-sm text-text-muted">
            Explore verified listings with blockchain-backed ownership
            certificates. Filter by location, type, and budget.
          </p>
        </div>
      </div>

      {/* ═══ Filter bar ═══ */}
      <div className="sticky top-[72px] z-30 border-b border-border-primary bg-[#0d0c0a]/95 backdrop-blur-lg">
        <div>
          <div className="flex flex-wrap items-center gap-2 py-3">
            {/* Search */}
            <div className="relative min-w-[180px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by title, address, or keyword…"
                className={cn(fieldCls, "w-full pl-9")}
              />
            </div>

            {/* Listing type */}
            <div className="relative">
              <select
                value={listingType}
                onChange={(e) => {
                  setListingType(e.target.value as ListingType | "");
                  setPage(1);
                }}
                className={cn(selectCls, "appearance-none pr-8")}
              >
                <option value="">Sale &amp; Rent</option>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => {
                  setSort(
                    e.target.value as NonNullable<ListingFilters["sort"]>,
                  );
                  setPage(1);
                }}
                className={cn(selectCls, "appearance-none pr-8")}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price_asc">Price ↑</option>
                <option value="price_desc">Price ↓</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            </div>

            {/* More filters toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={cn(
                "relative flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors",
                showFilters || activeFilterCount > 0
                  ? "border-accent-400/70 bg-accent-400 text-emerald-950"
                  : "border-border-primary bg-surface-input text-text-secondary hover:bg-surface-highlight",
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

            {/* Result count */}
            <span className="ml-auto text-sm text-text-muted">
              <span className="font-semibold text-white">
                {total.toLocaleString()}
              </span>{" "}
              properties
            </span>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="border-t border-border-secondary pb-3 pt-3">
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value as typeof category);
                      setPage(1);
                    }}
                    className={cn(selectCls, "w-full appearance-none pr-8")}
                  >
                    <option value="">Any category</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                </div>
                <div className="relative">
                  <select
                    value={propertyType}
                    onChange={(e) => {
                      setPropertyType(e.target.value);
                      setPage(1);
                    }}
                    className={cn(selectCls, "w-full appearance-none pr-8")}
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                </div>
                <input
                  type="number"
                  min={0}
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Min price"
                  className={fieldCls}
                />
                <input
                  type="number"
                  min={0}
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Max price"
                  className={fieldCls}
                />
                <div className="relative">
                  <select
                    value={minBeds}
                    onChange={(e) => {
                      setMinBeds(e.target.value);
                      setPage(1);
                    }}
                    className={cn(selectCls, "w-full appearance-none pr-8")}
                  >
                    <option value="">Any beds</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}+ beds
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                </div>
                <div className="relative">
                  <select
                    value={minBaths}
                    onChange={(e) => {
                      setMinBaths(e.target.value);
                      setPage(1);
                    }}
                    className={cn(selectCls, "w-full appearance-none pr-8")}
                  >
                    <option value="">Any baths</option>
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n}+ baths
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                </div>
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent-400 hover:text-accent-300 transition-colors"
                >
                  <X size={12} /> Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══ Grid ═══ */}
      <div className="py-8">
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] animate-pulse rounded-2xl border border-border-primary bg-surface-card"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border-primary bg-surface-card py-20">
            <Building2 className="h-12 w-12 text-accent-400" />
            <p className="mt-4 text-lg font-semibold text-white">
              No properties found
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Try widening your filters or searching with different keywords.
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="mt-4 rounded-lg bg-accent-400 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-accent-300 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((listing, i) => (
                <PropertyListingCard
                  key={listing.id}
                  listing={listing}
                  priority={i < 3}
                  animationDelay={i * 60}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-primary bg-surface-card text-text-secondary transition-colors hover:bg-surface-highlight disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (page <= 4) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = page - 3 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                        pageNum === page
                          ? "bg-accent-400 text-emerald-950"
                          : "border border-border-primary bg-surface-card text-text-secondary hover:bg-surface-highlight",
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-primary bg-surface-card text-text-secondary transition-colors hover:bg-surface-highlight disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
