import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bath, Bed, MapPin, Maximize2, Star } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn, formatCurrency } from '@/lib/utils';
import type { PropertySummary } from './types';

/**
 * ListingCard — dark-theme property card.
 *
 * Variants:
 *  - "grid"    (default) — image top, content bottom, for grid layouts
 *  - "compact" — horizontal, image left, for sidebar / map panel lists
 */

interface ListingCardProps {
  listing: PropertySummary;
  variant?: 'grid' | 'compact';
  href?: string;
  /** Slot for FavoriteButton — rendered top-right over the image */
  favoriteSlot?: React.ReactNode;
  className?: string;
  priority?: boolean;
}

export function ListingCard({
  listing,
  variant = 'grid',
  href,
  favoriteSlot,
  className,
  priority = false,
}: ListingCardProps) {
  const listingHref = href ?? `/discovery/${listing.id}`;
  const price = formatCurrency(listing.price, listing.currency ?? 'USD');
  const priceLabel = listing.listingType === 'rent' ? `${price}/mo` : price;

  // ── Compact variant (sidebar / map panel) ──────────────────────────────────
  if (variant === 'compact') {
    return (
      <Link
        href={listingHref}
        className={cn(
          'group flex gap-3 rounded-xl border border-white/8 bg-white/[0.05] p-3 transition-all duration-200 hover:border-amber-400/40 hover:bg-white/[0.09]',
          className,
        )}
      >
        {/* Thumbnail */}
        <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-white/10">
          {listing.image ? (
            <Image
              src={listing.image}
              alt={listing.title}
              fill
              sizes="96px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-white/5 text-[10px] text-white/30">
              No image
            </div>
          )}
          <span className="absolute left-1.5 top-1.5 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-black/55 text-amber-300 backdrop-blur-sm">
            {listing.listingType === 'rent' ? 'Rent' : 'Sale'}
          </span>
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-col justify-between py-0.5">
          <p className="line-clamp-1 text-sm font-medium text-white/90 group-hover:text-white">
            {listing.title}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-white/40">
            <MapPin size={10} />
            <span className="truncate">{listing.city}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="font-display text-sm font-semibold text-amber-300">{priceLabel}</p>
            {(listing.beds !== undefined || listing.baths !== undefined) && (
              <span className="flex items-center gap-1.5 text-[10px] text-white/35">
                {listing.beds !== undefined && (
                  <span className="flex items-center gap-0.5"><Bed size={9} />{listing.beds}bd</span>
                )}
                {listing.baths !== undefined && (
                  <span className="flex items-center gap-0.5"><Bath size={9} />{listing.baths}ba</span>
                )}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // ── Grid variant ────────────────────────────────────────────────────────────
  return (
    <Link
      href={listingHref}
      className={cn(
        'group relative flex flex-col rounded-xl border border-white/8 bg-white/[0.05] overflow-hidden transition-all duration-200 hover:border-amber-400/40 hover:bg-white/[0.08] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.6)]',
        className,
      )}
      aria-label={`View ${listing.title}`}
    >
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden bg-white/5">
        {listing.image ? (
          <Image
            src={listing.image}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-white/5 text-white/20">
            <span className="text-xs">No image</span>
          </div>
        )}
        {/* gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Badges — top left */}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <Badge
            status={listing.listingType === 'sale' ? 'active' : 'rented'}
            label={listing.listingType === 'sale' ? 'For Sale' : 'For Rent'}
            hideDot
          />
          {listing.tier === 'featured' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2 py-0.5 text-[11px] font-semibold text-emerald-950">
              <Star size={9} className="fill-emerald-950" aria-hidden="true" />
              Featured
            </span>
          )}
          {listing.tier === 'premium' && (
            <span className="inline-flex items-center rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-amber-300 ring-1 ring-amber-400/40 backdrop-blur">
              Premium
            </span>
          )}
        </div>

        {/* Favorite slot — top right */}
        {favoriteSlot && (
          <div className="absolute right-3 top-3">{favoriteSlot}</div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 text-sm font-semibold text-white/90 group-hover:text-white">
          {listing.title}
        </h3>

        <div className="flex items-center gap-1 text-xs text-white/40">
          <MapPin size={11} aria-hidden="true" />
          <span className="truncate">{listing.address}, {listing.city}</span>
        </div>

        {(listing.beds || listing.baths || listing.sqft) && (
          <div className="flex items-center gap-3 text-xs text-white/50">
            {listing.beds !== undefined && (
              <span className="flex items-center gap-1">
                <Bed size={12} aria-hidden="true" />
                {listing.beds} {listing.beds === 1 ? 'bed' : 'beds'}
              </span>
            )}
            {listing.baths !== undefined && (
              <span className="flex items-center gap-1">
                <Bath size={12} aria-hidden="true" />
                {listing.baths} {listing.baths === 1 ? 'bath' : 'baths'}
              </span>
            )}
            {listing.sqft !== undefined && (
              <span className="flex items-center gap-1">
                <Maximize2 size={12} aria-hidden="true" />
                {listing.sqft.toLocaleString()} sqft
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between border-t border-white/8 pt-2">
          <p className="font-display text-base font-semibold text-amber-300">{priceLabel}</p>
          <Badge status={listing.status} />
        </div>
      </div>
    </Link>
  );
}
