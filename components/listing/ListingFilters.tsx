'use client';

import * as React from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { SearchInput } from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { PropertyFilters } from './types';
import {
  LISTING_TYPE_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  BED_OPTIONS,
  TIER_OPTIONS,
} from './types';

/**
 * ListingFilters — filter bar for the search page and listings manager.
 *
 * variant="search"  → shown on /listings (public search page, horizontal)
 * variant="manage"  → shown on /dashboard/listings (owner, compact row)
 *
 * All state lives in the parent — this is a pure controlled component.
 * URL sync (for shareable search URLs) is handled by the page component.
 */

interface ListingFiltersProps {
  filters: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
  onReset?: () => void;
  variant?: 'search' | 'manage';
  className?: string;
}

// ── Pill button (filter chip) ─────────────────────────────────────────────────

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors',
        active
          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
      )}
    >
      {label}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ListingFilters({
  filters,
  onChange,
  onReset,
  variant = 'search',
  className,
}: ListingFiltersProps) {
  const set = <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) =>
    onChange({ ...filters, [key]: value, page: 1 });

  const toggle = <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) =>
    onChange({ ...filters, [key]: filters[key] === value ? undefined : value, page: 1 });

  const hasActiveFilters = Boolean(
    filters.query ||
    filters.listingType ||
    filters.type ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.beds ||
    filters.tier
  );

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Row 1: search + reset */}
      <div className="flex items-center gap-3">
        <SearchInput
          value={filters.query ?? ''}
          onChange={(v) => set('query', v || undefined)}
          placeholder="Search by address, city, title…"
          className="flex-1"
        />
        {hasActiveFilters && onReset && (
          <Button variant="ghost" size="sm" onClick={onReset} aria-label="Clear filters">
            <X size={14} />
            Clear
          </Button>
        )}
        {variant === 'manage' && (
          <Button variant="outline" size="sm">
            <SlidersHorizontal size={14} />
            Filters
          </Button>
        )}
      </div>

      {/* Row 2: filter chips */}
      <div className="flex flex-wrap gap-2">
        {/* Listing type */}
        {LISTING_TYPE_OPTIONS.map((opt) => (
          <FilterChip
            key={opt.value}
            label={opt.label}
            active={filters.listingType === opt.value}
            onClick={() => toggle('listingType', opt.value)}
          />
        ))}

        <span className="border-r border-gray-200" aria-hidden="true" />

        {/* Property type */}
        {PROPERTY_TYPE_OPTIONS.map((opt) => (
          <FilterChip
            key={opt.value}
            label={opt.label}
            active={filters.type === opt.value}
            onClick={() => toggle('type', opt.value)}
          />
        ))}

        <span className="border-r border-gray-200" aria-hidden="true" />

        {/* Beds */}
        {BED_OPTIONS.map((opt) => (
          <FilterChip
            key={opt.value}
            label={`${opt.label} beds`}
            active={filters.beds === Number(opt.value)}
            onClick={() => toggle('beds', Number(opt.value) as PropertyFilters['beds'])}
          />
        ))}

        {/* Price range — inputs */}
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            placeholder="Min $"
            value={filters.minPrice ?? ''}
            onChange={(e) => set('minPrice', e.target.value ? Number(e.target.value) : undefined)}
            aria-label="Minimum price"
            className="h-8 w-24 rounded-full border border-gray-200 px-3 text-xs text-gray-700 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <span className="text-xs text-gray-400">–</span>
          <input
            type="number"
            placeholder="Max $"
            value={filters.maxPrice ?? ''}
            onChange={(e) => set('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
            aria-label="Maximum price"
            className="h-8 w-24 rounded-full border border-gray-200 px-3 text-xs text-gray-700 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Tier — only shown in search variant */}
        {variant === 'search' && (
          <>
            <span className="border-r border-gray-200" aria-hidden="true" />
            {TIER_OPTIONS.map((opt) => (
              <FilterChip
                key={opt.value}
                label={opt.label}
                active={filters.tier === opt.value}
                onClick={() => toggle('tier', opt.value)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
