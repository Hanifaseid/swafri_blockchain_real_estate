"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";

import { PhotoGallery } from "./PhotoGallery";
import { PropertyMetadata } from "./PropertyMetadata";
import { RentalApplicationCard } from "./RentalApplicationCard";
import { FavoriteSaveButton, InquiryCard, OfferCard } from "./tenant-actions";
import type { PropertyPhoto } from "./types";
import { TitleCertificatePanel } from "./TitleCertificatePanel";
import type { Listing } from "@/features/listings/types/listing.types";

const PLACEHOLDER_IMAGE = "/placeholder-property.jpg";

function formatAreaSqft(listing: Listing): number | undefined {
  if (!listing.area) return undefined;
  if (listing.area.unit === "sqft") return listing.area.value;
  return Math.round(listing.area.value * 10.764);
}

// ─── ListingDetail ────────────────────────────────────────────────────────────

export default function ListingDetail({ listing }: { listing: Listing }) {
  const photos: PropertyPhoto[] =
    listing.photos && listing.photos.length > 0
      ? listing.photos.map((photo, index) => ({
          id: String(photo.publicId ?? index),
          url: photo.url ?? PLACEHOLDER_IMAGE,
          alt: listing.title,
          isPrimary: Boolean(photo.isCover) || index === 0,
        }))
      : [{ id: "cover", url: PLACEHOLDER_IMAGE, alt: listing.title, isPrimary: true }];

  const normalizedAddress = [
    listing.address?.street,
    listing.address?.city,
    listing.address?.region,
    listing.address?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const city = listing.address?.city ?? "";
  const country = listing.address?.country ?? "";

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="mb-4">
        <Link
          href="/discovery"
          aria-label="Browse properties"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-card border border-border-primary text-sm font-medium text-text-secondary hover:bg-surface-highlight hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse properties</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <PhotoGallery photos={photos} title={listing.title} />

          <div className="bg-surface-card p-6 rounded-2xl border border-border-primary">
            <PropertyMetadata
              listing={
                {
                  title: listing.title ?? "",
                  description: listing.description ?? "",
                  price: listing.price ?? listing.monthlyRent ?? 0,
                  currency: listing.currency ?? "USD",
                  listingType: listing.listingType,
                  status: "active",
                  tier: "basic",
                  address: normalizedAddress,
                  city,
                  country,
                  beds: listing.bedrooms,
                  baths: listing.bathrooms,
                  sqft: formatAreaSqft(listing),
                  parkingSpaces: listing.parkingSpaces,
                  yearBuilt: listing.yearBuilt,
                  floorNumber: listing.floorNumber,
                  totalFloors: listing.totalFloors,
                  type: listing.category,
                  amenities: listing.amenities?.map((a, i) => ({ id: `${i}-${a}`, label: a })) ?? [],
                } as any
              }
            />
          </div>

          <div className="bg-surface-card p-6 rounded-2xl border border-border-primary">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-text-muted" /> Location
            </h3>
            <iframe
              width="100%"
              height="360"
              style={{ border: 0, borderRadius: "12px" }}
              loading="lazy"
              allowFullScreen
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                normalizedAddress || listing.title,
              )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
            />
          </div>
        </div>

        <aside className="space-y-4">
          {/* ── Owner card ─────────────────────────────────────────────── */}
          <div className="bg-surface-card rounded-2xl border border-border-primary p-5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-0.5">
              Listed by
            </p>
            <p className="text-sm font-semibold text-white mb-3">
              {(listing as any).ownerName ?? "Platform"}
            </p>
            <div className="flex items-center justify-between mb-3">
              <VerificationBadge verificationStatus={listing.verificationStatus} />
            </div>
            <FavoriteSaveButton listingId={listing.id} />
          </div>

          <InquiryCard listing={listing} />

          {listing.listingType === "rent" && (
            <RentalApplicationCard
              listingId={listing.id}
              title={listing.title}
              monthlyRent={listing.monthlyRent}
              currency={listing.currency}
            />
          )}

          {listing.listingType === "sale" && <OfferCard listing={listing} />}

          {/* ── On-chain Certificate of Title ──────────────────────────── */}
          <TitleCertificatePanel listingId={listing.id} />
        </aside>
      </div>
    </div>
  );
}

// ─── VerificationBadge ────────────────────────────────────────────────────────

function VerificationBadge({
  verificationStatus,
}: {
  verificationStatus?: string;
}) {
  return verificationStatus === "verified" ? (
    <span className="text-xs text-emerald-400 font-medium">Verified</span>
  ) : (
    <span className="text-xs text-text-muted">Unverified</span>
  );
}
