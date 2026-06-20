import * as React from 'react';
import {
  Bath,
  Bed,
  Building2,
  Calendar,
  Car,
  Layers,
  Maximize2,
  Tag,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn, formatCurrency } from '@/lib/utils';
import type { PropertyDetail } from './types';

/**
 * PropertyMetadata — structured facts panel for /listings/[id].
 * Renders price, specs, amenities, and property type in a consistent grid.
 * Server Component — no interactivity, no 'use client' needed.
 */

interface PropertyMetadataProps {
  listing: PropertyDetail;
  className?: string;
}

// ── Spec row atom ─────────────────────────────────────────────────────────────

function SpecItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border-primary bg-surface-highlight p-3">
      <div className="rounded-md bg-surface-card p-2 text-accent-400 shadow-sm">
        <Icon size={16} aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function PropertyMetadata({ listing, className }: PropertyMetadataProps) {
  const price = formatCurrency(listing.price, listing.currency ?? 'USD');
  const priceLabel =
    listing.listingType === 'rent' ? `${price} / month` : price;

  return (
    <div className={cn('flex flex-col gap-6', className)}>

      {/* Price + status ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-3xl font-bold text-accent-400">{priceLabel}</p>
        <Badge status={listing.status} />
        <Badge
          status={listing.listingType === 'sale' ? 'active' : 'rented'}
          label={listing.listingType === 'sale' ? 'For Sale' : 'For Rent'}
          hideDot
        />
        {listing.tier && listing.tier !== 'basic' && (
          <Badge
            status={listing.tier === 'featured' ? 'pending' : 'funds_held'}
            label={listing.tier.charAt(0).toUpperCase() + listing.tier.slice(1)}
            hideDot
          />
        )}
      </div>

      {/* Title + address ─────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-white">{listing.title}</h1>
        <p className="mt-1 text-sm text-text-muted">
          {listing.address}, {listing.city}, {listing.country}
        </p>
      </div>

      {/* Specs grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {listing.beds !== undefined && (
          <SpecItem
            icon={Bed}
            label="Bedrooms"
            value={listing.beds}
          />
        )}
        {listing.baths !== undefined && (
          <SpecItem
            icon={Bath}
            label="Bathrooms"
            value={listing.baths}
          />
        )}
        {listing.sqft !== undefined && (
          <SpecItem
            icon={Maximize2}
            label="Area"
            value={`${listing.sqft.toLocaleString()} sqft`}
          />
        )}
        {listing.parkingSpaces !== undefined && (
          <SpecItem
            icon={Car}
            label="Parking"
            value={listing.parkingSpaces}
          />
        )}
        {listing.yearBuilt !== undefined && (
          <SpecItem
            icon={Calendar}
            label="Year Built"
            value={listing.yearBuilt}
          />
        )}
        {listing.floorNumber !== undefined && (
          <SpecItem
            icon={Layers}
            label="Floor"
            value={
              listing.totalFloors
                ? `${listing.floorNumber} / ${listing.totalFloors}`
                : listing.floorNumber
            }
          />
        )}
        <SpecItem
          icon={Building2}
          label="Property Type"
          value={
            listing.type.charAt(0).toUpperCase() + listing.type.slice(1)
          }
        />
        <SpecItem
          icon={Tag}
          label="Listing Type"
          value={listing.listingType === 'sale' ? 'For Sale' : 'For Rent'}
        />
      </div>

      {/* Description ─────────────────────────────────────────────────────── */}
      {listing.description && (
        <div>
          <h2 className="mb-2 text-base font-semibold text-white">
            About this property
          </h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-text-secondary">
            {listing.description}
          </p>
        </div>
      )}

      {/* Amenities ───────────────────────────────────────────────────────── */}
      {listing.amenities.length > 0 && (
        <div>
          <h2 className="mb-3 text-base font-semibold text-white">
            Amenities
          </h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
            {listing.amenities.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-2 text-sm text-text-secondary"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full bg-accent-400"
                  aria-hidden="true"
                />
                {a.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
