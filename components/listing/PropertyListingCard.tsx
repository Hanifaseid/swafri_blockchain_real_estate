'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Bath,
  Bed,
  Building2,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  Maximize2,
  ShieldCheck,
  Sofa,
  Star,
  Tag,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import type { Listing } from '@/features/listings/types/listing.types';

/**
 * PropertyListingCard — premium, data-dense listing card for the browse page.
 *
 * Accepts the full `Listing` shape from the backend and renders a visually
 * rich card showing image, price, specs, location, verification status,
 * amenities preview, and category/type metadata.
 *
 * Designed for the dark marketplace shell.
 */

interface PropertyListingCardProps {
  listing: Listing;
  href?: string;
  className?: string;
  priority?: boolean;
  /** Stagger delay for entrance animation (ms) */
  animationDelay?: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatArea(area?: Listing['area']): string | null {
  if (!area) return null;
  const val = area.unit === 'sqft' ? area.value : Math.round(area.value * 10.764);
  return `${val.toLocaleString()} sqft`;
}

function formatAddress(address: Listing['address']): string {
  return [address.street, address.city, address.region, address.country]
    .filter(Boolean)
    .join(', ');
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

const FURNISH_LABEL: Record<string, string> = {
  furnished: 'Furnished',
  semi_furnished: 'Semi-furnished',
  unfurnished: 'Unfurnished',
};

// ── Component ─────────────────────────────────────────────────────────────────

export function PropertyListingCard({
  listing,
  href,
  className,
  priority = false,
  animationDelay = 0,
}: PropertyListingCardProps) {
  const listingHref = href ?? `/properties/${listing.id}`;
  const coverPhoto = listing.photos?.find((p) => p.isCover) ?? listing.photos?.[0];
  const price = listing.price ?? listing.monthlyRent ?? 0;
  const currency = listing.currency ?? 'USD';
  const priceLabel =
    listing.listingType === 'rent'
      ? `${formatCurrency(price, currency)}/mo`
      : formatCurrency(price, currency);
  const area = formatArea(listing.area);
  const address = formatAddress(listing.address);
  const isVerified = listing.verificationStatus === 'verified';
  const isSale = listing.listingType === 'sale';

  return (
    <Link
      href={listingHref}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-border-primary bg-surface-card backdrop-blur-sm',
        'transition-all duration-500 ease-out',
        'hover:border-accent-400/40 hover:shadow-[0_8px_40px_rgba(189,139,39,0.08)] hover:-translate-y-1',
        'opacity-0 animate-[fadeSlideUp_0.5s_ease-out_forwards]',
        className,
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
      aria-label={`View ${listing.title}`}
    >
      {/* ── Image ──────────────────────────────────────────────────────── */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-card">
        {coverPhoto ? (
          <Image
            src={coverPhoto.url}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-highlight text-text-muted">
            <Building2 size={32} />
          </div>
        )}

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Top-left badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md',
              isSale
                ? 'bg-emerald-600/90 text-white'
                : 'bg-accent-400/90 text-emerald-950',
            )}
          >
            <Tag size={10} />
            {isSale ? 'For Sale' : 'For Rent'}
          </span>
          {listing.category === 'commercial' && (
            <span className="inline-flex items-center rounded-full bg-white/15 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-md">
              Commercial
            </span>
          )}
        </div>

        {/* Top-right verification seal */}
        {isVerified && (
          <div className="absolute right-3 top-3 rounded-full bg-emerald-600/90 p-1.5 backdrop-blur-md" title="Verified listing">
            <ShieldCheck size={14} className="text-white" />
          </div>
        )}

        {/* Bottom overlay: price */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
          <p className="font-display text-2xl font-bold tracking-tight text-white drop-shadow-lg">
            {priceLabel}
          </p>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Title + address */}
        <div>
          <h3 className="line-clamp-1 text-[15px] font-semibold text-white group-hover:text-accent-400 transition-colors duration-300">
            {listing.title}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-text-muted">
            <MapPin size={12} className="shrink-0 text-accent-400/70" />
            <span className="truncate">{address}</span>
          </div>
        </div>

        {/* Specs strip */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-text-secondary">
          {listing.bedrooms !== undefined && (
            <span className="inline-flex items-center gap-1">
              <Bed size={13} className="text-accent-400/70" />
              {listing.bedrooms} {listing.bedrooms === 1 ? 'Bed' : 'Beds'}
            </span>
          )}
          {listing.bathrooms !== undefined && (
            <span className="inline-flex items-center gap-1">
              <Bath size={13} className="text-accent-400/70" />
              {listing.bathrooms} {listing.bathrooms === 1 ? 'Bath' : 'Baths'}
            </span>
          )}
          {area && (
            <span className="inline-flex items-center gap-1">
              <Maximize2 size={13} className="text-accent-400/70" />
              {area}
            </span>
          )}
          {listing.parkingSpaces !== undefined && listing.parkingSpaces > 0 && (
            <span className="inline-flex items-center gap-1">
              <Car size={13} className="text-accent-400/70" />
              {listing.parkingSpaces} Parking
            </span>
          )}
        </div>

        {/* Secondary metadata row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-muted">
          {listing.propertyType && (
            <span className="inline-flex items-center gap-1 capitalize">
              <Building2 size={11} />
              {listing.propertyType.replace('_', ' ')}
            </span>
          )}
          {listing.yearBuilt && (
            <span className="inline-flex items-center gap-1">
              <Calendar size={11} />
              Built {listing.yearBuilt}
            </span>
          )}
          {listing.floorNumber !== undefined && (
            <span className="inline-flex items-center gap-1">
              <Layers size={11} />
              Floor {listing.floorNumber}{listing.totalFloors ? `/${listing.totalFloors}` : ''}
            </span>
          )}
          {listing.furnishingStatus && (
            <span className="inline-flex items-center gap-1">
              <Sofa size={11} />
              {FURNISH_LABEL[listing.furnishingStatus] ?? listing.furnishingStatus}
            </span>
          )}
        </div>

        {/* Amenities preview (first 3) */}
        {listing.amenities && listing.amenities.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {listing.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="rounded-md bg-surface-highlight px-2 py-0.5 text-[11px] text-text-secondary"
              >
                {amenity}
              </span>
            ))}
            {listing.amenities.length > 3 && (
              <span className="rounded-md bg-surface-highlight px-2 py-0.5 text-[11px] text-text-muted">
                +{listing.amenities.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Bottom strip: status + time + blockchain */}
        <div className="mt-auto flex items-center justify-between border-t border-border-secondary pt-3">
          <div className="flex items-center gap-2">
            {/* Status pill */}
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                listing.status === 'published'
                  ? 'bg-surface-success text-emerald-400'
                  : listing.status === 'draft'
                    ? 'bg-surface-warning text-amber-400'
                    : listing.status === 'rented' || listing.status === 'sold'
                      ? 'bg-white/5 text-text-muted'
                      : 'bg-surface-highlight text-text-secondary',
              )}
            >
              <CheckCircle2 size={10} />
              {listing.status}
            </span>
            {listing.tokenId && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-400/10 px-2 py-0.5 text-[10px] font-semibold text-accent-400">
                <Star size={9} className="fill-accent-400" />
                On-chain
              </span>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
            <Clock size={11} />
            {relativeTime(listing.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
