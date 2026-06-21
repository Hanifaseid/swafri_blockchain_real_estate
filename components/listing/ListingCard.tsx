import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bath,
  Bed,
  Crosshair,
  FileText,
  HandCoins,
  MapPin,
  Maximize2,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn, formatCurrency } from "@/lib/utils";
import type { PropertySummary } from "./types";

/**
 * ListingCard — dark-theme property card.
 *
 * Variants:
 *  - "grid"    (default) — image top, content bottom, for grid layouts
 *  - "compact" — horizontal, image left, for sidebar / map panel lists
 */

interface ListingCardProps {
  listing: PropertySummary;
  variant?: "grid" | "compact";
  href?: string;
  /** Slot for FavoriteButton — rendered top-right over the image */
  favoriteSlot?: React.ReactNode;
  /** Called when the user clicks "Focus on map" — passes [lat, lng] */
  onLocate?: (coords: [number, number]) => void;
  className?: string;
  priority?: boolean;
}

export function ListingCard({
  listing,
  variant = "grid",
  href,
  favoriteSlot,
  onLocate,
  className,
  priority = false,
}: ListingCardProps) {
  const listingHref = href ?? `/discovery/${listing.id}`;
  const price = formatCurrency(listing.price, listing.currency ?? "USD");
  const priceLabel = listing.listingType === "rent" ? `${price}/mo` : price;

  const isRent = listing.listingType === "rent";
  const ctaHref = isRent ? `${listingHref}#apply` : `${listingHref}#offer`;

  // ── Compact variant (sidebar / map panel) ──────────────────────────────────
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "group relative flex rounded-xl border border-white/[0.07] bg-white/[0.04] transition-all duration-250",
          "hover:border-amber-400/30 hover:bg-white/[0.07] hover:shadow-[0_6px_28px_-6px_rgba(0,0,0,0.55)]",
          className,
        )}
      >
        {/* ── Left: Thumbnail + Info (clickable, navigates to detail) ── */}
        <Link href={listingHref} className="flex min-w-0 flex-1 gap-3 p-3">
          {/* Thumbnail */}
          <div className="relative h-[84px] w-[100px] shrink-0 overflow-hidden rounded-lg bg-white/[0.06]">
            {listing.image ? (
              <Image
                src={listing.image}
                alt={listing.title}
                fill
                sizes="100px"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.06]"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white/[0.04]">
                <Maximize2 size={14} className="text-white/15" />
                <span className="text-[8px] font-medium uppercase tracking-widest text-white/15">No photo</span>
              </div>
            )}
            {/* Gradient scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            {/* Type badge */}
            <span
              className={cn(
                "absolute left-1.5 top-1.5 rounded-[4px] px-1.5 py-[2px] text-[8px] font-bold uppercase tracking-[0.08em] backdrop-blur-md shadow-sm",
                isRent
                  ? "bg-sky-500/85 text-white"
                  : "bg-amber-400/90 text-amber-950",
              )}
            >
              {isRent ? "Rent" : "Sale"}
            </span>
            {/* Featured badge */}
            {listing.tier === "featured" && (
              <span className="absolute bottom-1.5 right-1.5 grid h-[18px] w-[18px] place-items-center rounded-full bg-amber-400 shadow-[0_2px_8px_rgba(245,158,11,0.4)]">
                <Star size={8} className="fill-amber-950 text-amber-950" />
              </span>
            )}
          </div>

          {/* Info block */}
          <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
            {/* Title */}
            <p className="line-clamp-1 text-[13px] font-semibold leading-tight text-white/90 group-hover:text-white transition-colors">
              {listing.title}
            </p>

            {/* Location */}
            <div className="flex items-center gap-1 text-[10px] text-white/35">
              <MapPin size={9} className="shrink-0 text-white/25" />
              <span className="truncate">
                {listing.address ? `${listing.address}, ` : ""}
                {listing.city}
              </span>
            </div>

            {/* Stats */}
            {(listing.beds !== undefined || listing.baths !== undefined || listing.sqft !== undefined) && (
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0 text-[10px] text-white/40">
                {listing.beds !== undefined && (
                  <span className="flex items-center gap-0.5">
                    <Bed size={9} className="text-white/30" />
                    {listing.beds}bd
                  </span>
                )}
                {listing.baths !== undefined && (
                  <span className="flex items-center gap-0.5">
                    <Bath size={9} className="text-white/30" />
                    {listing.baths}ba
                  </span>
                )}
                {listing.sqft !== undefined && (
                  <span className="flex items-center gap-0.5">
                    <Maximize2 size={9} className="text-white/30" />
                    {listing.sqft.toLocaleString()}ft²
                  </span>
                )}
              </div>
            )}

            {/* Price */}
            <p className="font-display text-[14px] font-bold leading-none text-amber-300/90 group-hover:text-amber-300 transition-colors">
              {priceLabel}
            </p>
          </div>
        </Link>

        {/* ── Right: Action buttons column ── */}
        <div className="flex shrink-0 flex-col justify-between border-l border-white/[0.06] py-2 px-1.5 gap-1.5">
          {/* Focus on map */}
          {listing.lat != null && listing.lng != null && onLocate ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onLocate([listing.lat!, listing.lng!]);
              }}
              className={cn(
                "group/btn flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150",
                "bg-white/[0.05] text-white/40 ring-1 ring-white/[0.08]",
                "hover:bg-emerald-500/15 hover:text-emerald-400 hover:ring-emerald-500/25",
                "active:scale-95",
              )}
              aria-label="Focus on map"
              title="Show on map"
            >
              <Crosshair size={14} />
            </button>
          ) : (
            <div className="h-8 w-8" />
          )}

          {/* CTA — Apply / Offer */}
          <a
            href={ctaHref}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "group/btn flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150",
              "ring-1 active:scale-95",
              isRent
                ? "bg-sky-500/10 text-sky-400/70 ring-sky-500/15 hover:bg-sky-500/20 hover:text-sky-300 hover:ring-sky-400/30"
                : "bg-amber-400/10 text-amber-400/70 ring-amber-400/15 hover:bg-amber-400/20 hover:text-amber-300 hover:ring-amber-400/30",
            )}
            aria-label={isRent ? "Apply for rental" : "Make an offer"}
            title={isRent ? "Apply Now" : "Make Offer"}
          >
            {isRent ? <FileText size={14} /> : <HandCoins size={14} />}
          </a>
        </div>
      </div>
    );
  }

  // ── Grid variant ────────────────────────────────────────────────────────────
  return (
    <Link
      href={listingHref}
      className={cn(
        "group relative flex flex-col rounded-xl border border-white/8 bg-white/[0.05] overflow-hidden transition-all duration-200 hover:border-amber-400/40 hover:bg-white/[0.08] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.6)]",
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
            status={listing.listingType === "sale" ? "active" : "rented"}
            label={listing.listingType === "sale" ? "For Sale" : "For Rent"}
            hideDot
          />
          {listing.tier === "featured" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2 py-0.5 text-[11px] font-semibold text-emerald-950">
              <Star size={9} className="fill-emerald-950" aria-hidden="true" />
              Featured
            </span>
          )}
          {listing.tier === "premium" && (
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
          <span className="truncate">
            {listing.address}, {listing.city}
          </span>
        </div>

        {(listing.beds || listing.baths || listing.sqft) && (
          <div className="flex items-center gap-3 text-xs text-white/50">
            {listing.beds !== undefined && (
              <span className="flex items-center gap-1">
                <Bed size={12} aria-hidden="true" />
                {listing.beds} {listing.beds === 1 ? "bed" : "beds"}
              </span>
            )}
            {listing.baths !== undefined && (
              <span className="flex items-center gap-1">
                <Bath size={12} aria-hidden="true" />
                {listing.baths} {listing.baths === 1 ? "bath" : "baths"}
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

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/8 pt-2.5">
          <div className="flex flex-col gap-0.5">
            <p className="font-display text-base font-semibold text-amber-300 leading-none">{priceLabel}</p>
            <Badge status={listing.status} />
          </div>
          <a
            href={ctaHref}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 shrink-0 active:scale-95",
              isRent
                ? "bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/25 hover:bg-sky-500/25 hover:text-sky-200"
                : "bg-amber-400/12 text-amber-300 ring-1 ring-amber-400/25 hover:bg-amber-400/22 hover:text-amber-200",
            )}
          >
            {isRent ? <FileText size={12} /> : <HandCoins size={12} />}
            {isRent ? "Apply Now" : "Make Offer"}
          </a>
        </div>
      </div>
    </Link>
  );
}
