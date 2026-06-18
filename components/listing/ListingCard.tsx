import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Bath, Bed, MapPin, Maximize2, Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn, formatCurrency } from "@/lib/utils";
import type { PropertySummary } from "./types";

/**
 * ListingCard — property card used in grid and featured listings.
 *
 * Variants:
 *  - "grid"     (default) — image top, content bottom, full-width in a grid
 *  - "compact"  — horizontal layout, image left, used in sidebar / map panel
 */

interface ListingCardProps {
  listing: PropertySummary;
  variant?: "grid" | "compact";
  href?: string;
  /** Slot for FavoriteButton — rendered top-right over the image */
  favoriteSlot?: React.ReactNode;
  className?: string;
  priority?: boolean; // passed to next/image for LCP images
}

export function ListingCard({
  listing,
  variant = "grid",
  href,
  favoriteSlot,
  className,
  priority = false,
}: ListingCardProps) {
  const listingHref = href ?? `/listings/${listing.id}`;

  const price = formatCurrency(listing.price, listing.currency ?? "USD");
  const priceLabel = listing.listingType === "rent" ? `${price}/mo` : price;

  if (variant === "compact") {
    return (
      <Link
        href={listingHref}
        className={cn(
          "group flex gap-3 rounded-xl border border-gray-200 bg-white p-3 transition duration-300 ease-out transform hover:-translate-y-1 hover:shadow-xl hover:border-emerald-300",
          className,
        )}
      >
        {/* Thumbnail */}
        <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-200">
          {listing.image ? (
            <Image
              src={listing.image}
              alt={listing.title}
              fill
              sizes="96px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-300 text-xs text-gray-500">
              No img
            </div>
          )}
        </div>
        {/* Info */}
        <div className="flex min-w-0 flex-col justify-between py-0.5">
          <p className="truncate text-sm font-medium text-gray-900">
            {listing.title}
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={11} />
            <span className="truncate">{listing.city}</span>
          </div>
          <p className="text-sm font-semibold text-emerald-600">{priceLabel}</p>
        </div>
      </Link>
    );
  }

  // ── Grid variant ───────────────────────────────────────────────────────────
  return (
    <Link
      href={listingHref}
      className={cn(
        "group relative flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden transition duration-300 ease-out transform hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl hover:border-emerald-300",
        className,
      )}
      aria-label={`View ${listing.title}`}
    >
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        {listing.image ? (
          <Image
            src={listing.image}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400">
            <span>No image</span>
          </div>
        )}

        {/* Badges overlay — top left */}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <Badge
            status={listing.listingType === "sale" ? "active" : "rented"}
            label={listing.listingType === "sale" ? "For Sale" : "For Rent"}
            hideDot
          />
          {listing.tier === "featured" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">
              <Star size={10} className="fill-white" aria-hidden="true" />
              Featured
            </span>
          )}
          {listing.tier === "premium" && (
            <span className="inline-flex items-center rounded-full bg-violet-600 px-2 py-0.5 text-xs font-medium text-white">
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
        {/* Title */}
        <h3 className="line-clamp-1 text-sm font-semibold text-gray-900">
          {listing.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <MapPin size={12} aria-hidden="true" />
          <span className="truncate">
            {listing.address}, {listing.city}
          </span>
        </div>

        {/* Specs row */}
        {(listing.beds || listing.baths || listing.sqft) && (
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {listing.beds !== undefined && (
              <span className="flex items-center gap-1">
                <Bed size={13} aria-hidden="true" />
                {listing.beds} {listing.beds === 1 ? "bed" : "beds"}
              </span>
            )}
            {listing.baths !== undefined && (
              <span className="flex items-center gap-1">
                <Bath size={13} aria-hidden="true" />
                {listing.baths} {listing.baths === 1 ? "bath" : "baths"}
              </span>
            )}
            {listing.sqft !== undefined && (
              <span className="flex items-center gap-1">
                <Maximize2 size={13} aria-hidden="true" />
                {listing.sqft.toLocaleString()} sqft
              </span>
            )}
          </div>
        )}

        {/* Price — pushed to bottom */}
        <div className="mt-auto pt-2 flex items-end justify-between border-t border-gray-100">
          <p className="text-base font-bold text-emerald-600">{priceLabel}</p>
          <Badge status={listing.status} />
        </div>
      </div>
    </Link>
  );
}
