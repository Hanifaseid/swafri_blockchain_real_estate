'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowLeft,
  Bath,
  Bed,
  Building2,
  Calendar,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  MapPin,
  Maximize2,
  Share2,
  ShieldCheck,
  ShieldX,
  Sofa,
  Star,
  Tag,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import type { Listing } from '@/features/listings/types/listing.types';
import { FavoriteSaveButton, InquiryCard, OfferCard } from './tenant-actions';
import { RentalApplicationCard } from './RentalApplicationCard';
import { TitleCertificatePanel } from './TitleCertificatePanel';

interface Props {
  listing: Listing;
}

const FURNISH: Record<string, string> = {
  furnished: 'Furnished',
  semi_furnished: 'Semi-furnished',
  unfurnished: 'Unfurnished',
};

function relativeTime(d: string) {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);
  if (days < 1) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  const m = Math.floor(days / 30);
  return m === 1 ? '1 month ago' : `${m} months ago`;
}

function areaStr(a?: Listing['area']) {
  if (!a) return null;
  const v = a.unit === 'sqft' ? a.value : Math.round(a.value * 10.764);
  return `${v.toLocaleString()} sqft`;
}

export function ListingDetailView({ listing }: Props) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const photos = listing.photos ?? [];
  const photo = photos[photoIdx];
  const price = listing.price ?? listing.monthlyRent ?? 0;
  const cur = listing.currency ?? 'USD';
  const priceLabel = listing.listingType === 'rent'
    ? `${formatCurrency(price, cur)}/mo`
    : formatCurrency(price, cur);
  const verified = listing.verificationStatus === 'verified';
  const area = areaStr(listing.area);
  const addr = [listing.address.street, listing.address.city, listing.address.region, listing.address.country].filter(Boolean).join(', ');

  const specs = [
    listing.bedrooms !== undefined && { icon: Bed, label: `${listing.bedrooms} ${listing.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}` },
    listing.bathrooms !== undefined && { icon: Bath, label: `${listing.bathrooms} ${listing.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}` },
    area && { icon: Maximize2, label: area },
    listing.parkingSpaces && { icon: Car, label: `${listing.parkingSpaces} Parking` },
    listing.yearBuilt && { icon: Calendar, label: `Built ${listing.yearBuilt}` },
    listing.floorNumber !== undefined && { icon: Layers, label: `Floor ${listing.floorNumber}${listing.totalFloors ? `/${listing.totalFloors}` : ''}` },
    listing.furnishingStatus && { icon: Sofa, label: FURNISH[listing.furnishingStatus] ?? listing.furnishingStatus },
  ].filter(Boolean) as { icon: typeof Bed; label: string }[];

  const handleShare = () => {
    if (navigator.share) navigator.share({ title: listing.title, url: window.location.href });
    else navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="min-h-screen bg-[#0d0c0a]">
      {/* ── Breadcrumb ─────────────────────────────────────────────── */}
      <div className="pt-6">
        <Link href="/listings" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent-400 transition-colors">
          <ArrowLeft size={14} /> Back to listings
        </Link>
      </div>

      <div className="pb-16 pt-4">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* ═══ LEFT COLUMN ═══ */}
          <div className="min-w-0 space-y-6">

            {/* ── Gallery ────────────────────────────────────────── */}
            <div className="overflow-hidden rounded-2xl border border-border-primary bg-surface-card">
              <div className="relative aspect-[16/10] w-full bg-black">
                {photo ? (
                  <Image src={photo.url} alt={listing.title} fill className="object-cover" sizes="(max-width:1024px)100vw,65vw" priority />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-text-muted"><Building2 size={48} /></div>
                )}
                {photos.length > 1 && (
                  <>
                    <button onClick={() => setPhotoIdx((i) => (i - 1 + photos.length) % photos.length)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white backdrop-blur-sm hover:bg-black/80 transition-colors"><ChevronLeft size={20} /></button>
                    <button onClick={() => setPhotoIdx((i) => (i + 1) % photos.length)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white backdrop-blur-sm hover:bg-black/80 transition-colors"><ChevronRight size={20} /></button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-sm">{photoIdx + 1} / {photos.length}</div>
                  </>
                )}
              </div>
              {/* Thumbnails */}
              {photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto p-3 scrollbar-thin">
                  {photos.map((p, i) => (
                    <button key={p.publicId} onClick={() => setPhotoIdx(i)} className={cn('relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors', i === photoIdx ? 'border-accent-400' : 'border-transparent opacity-60 hover:opacity-100')}>
                      <Image src={p.url} alt="" fill className="object-cover" sizes="80px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Title + badges ──────────────────────────────────── */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold', listing.listingType === 'sale' ? 'bg-emerald-600/90 text-white' : 'bg-accent-400/90 text-emerald-950')}>
                  <Tag size={10} />{listing.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                </span>
                <span className="rounded-full bg-surface-highlight px-2.5 py-1 text-xs text-text-secondary capitalize">{listing.propertyType?.replace('_', ' ')}</span>
                {listing.category === 'commercial' && <span className="rounded-full bg-surface-highlight px-2.5 py-1 text-xs text-text-secondary">Commercial</span>}
                {verified && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/15 px-2.5 py-1 text-xs font-medium text-emerald-400"><ShieldCheck size={12} />Verified</span>}
                {!verified && <span className="inline-flex items-center gap-1 rounded-full bg-surface-warning px-2.5 py-1 text-xs text-amber-400"><ShieldX size={12} />Unverified</span>}
              </div>
              <h1 className="mt-3 font-display text-3xl font-bold text-white lg:text-4xl">{listing.title}</h1>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-text-muted">
                <MapPin size={14} className="text-accent-400/70" />{addr}
              </div>
            </div>

            {/* ── Specs grid ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {specs.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5 rounded-xl border border-border-primary bg-surface-card px-4 py-3">
                  <Icon size={18} className="shrink-0 text-accent-400" />
                  <span className="text-sm text-text-secondary">{label}</span>
                </div>
              ))}
            </div>

            {/* ── Description ────────────────────────────────────── */}
            {listing.description && (
              <div className="rounded-2xl border border-border-primary bg-surface-card p-6">
                <h2 className="text-lg font-semibold text-white">Description</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-text-secondary">{listing.description}</p>
              </div>
            )}

            {/* ── Amenities ──────────────────────────────────────── */}
            {listing.amenities?.length > 0 && (
              <div className="rounded-2xl border border-border-primary bg-surface-card p-6">
                <h2 className="text-lg font-semibold text-white">Amenities</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {listing.amenities.map((a) => (
                    <span key={a} className="rounded-lg bg-surface-highlight px-3 py-1.5 text-sm text-text-secondary">{a}</span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Additional details ─────────────────────────────── */}
            {(listing.nearbyLandmarks?.length || listing.neighborhoodInfo || listing.utilityDetails || listing.rentalTerms || listing.saleTerms || listing.legalNotes) && (
              <div className="rounded-2xl border border-border-primary bg-surface-card p-6 space-y-4">
                <h2 className="text-lg font-semibold text-white">Additional Details</h2>
                {listing.neighborhoodInfo && <DetailBlock title="Neighborhood" text={listing.neighborhoodInfo} />}
                {listing.utilityDetails && <DetailBlock title="Utilities" text={listing.utilityDetails} />}
                {listing.rentalTerms && <DetailBlock title="Rental Terms" text={listing.rentalTerms} />}
                {listing.saleTerms && <DetailBlock title="Sale Terms" text={listing.saleTerms} />}
                {listing.legalNotes && <DetailBlock title="Legal Notes" text={listing.legalNotes} />}
                {listing.nearbyLandmarks && listing.nearbyLandmarks.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Nearby Landmarks</p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {listing.nearbyLandmarks.map((l) => (
                        <span key={l} className="rounded-md bg-surface-highlight px-2.5 py-1 text-xs text-text-secondary">{l}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ═══ RIGHT SIDEBAR ═══ */}
          <div className="space-y-5 lg:sticky lg:top-[88px] lg:self-start">

            {/* Price card */}
            <div className="rounded-2xl border border-border-primary bg-surface-card p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">{listing.listingType === 'rent' ? 'Monthly Rent' : 'Asking Price'}</p>
              <p className="mt-1 font-display text-3xl font-bold text-accent-400">{priceLabel}</p>
              {listing.maintenanceFee && (
                <p className="mt-1 text-xs text-text-muted">+ {formatCurrency(listing.maintenanceFee, cur)} maintenance fee</p>
              )}
              {listing.serviceCharge && (
                <p className="text-xs text-text-muted">+ {formatCurrency(listing.serviceCharge, cur)} service charge</p>
              )}
              <div className="mt-4 flex gap-2">
                <div className="flex-1">
                  <FavoriteSaveButton listingId={listing.id} />
                </div>
                <button onClick={handleShare} className="rounded-lg border border-border-primary bg-surface-input px-3 py-2.5 text-text-secondary hover:bg-surface-highlight transition-colors">
                  <Share2 size={16} />
                </button>
              </div>
            </div>

            {/* Tenant / buyer actions */}
            <InquiryCard listing={listing} />

            {listing.listingType === 'rent' && (
              <RentalApplicationCard
                listingId={listing.id}
                title={listing.title}
                monthlyRent={listing.monthlyRent}
                currency={listing.currency}
              />
            )}

            {listing.listingType === 'sale' && <OfferCard listing={listing} />}

            {/* On-chain certificate of title */}
            <TitleCertificatePanel listingId={listing.id} />

            {/* Status & meta */}
            <div className="rounded-2xl border border-border-primary bg-surface-card p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white">Listing Status</h3>
              <div className="space-y-2 text-sm">
                <MetaRow label="Status" value={<StatusPill status={listing.status} />} />
                <MetaRow label="Verification" value={<VerifPill status={listing.verificationStatus} />} />
                {listing.availabilityStatus && <MetaRow label="Availability" value={<span className="capitalize text-text-secondary">{listing.availabilityStatus.replace('_', ' ')}</span>} />}
                <MetaRow label="Listed" value={<span className="inline-flex items-center gap-1 text-text-secondary"><Clock size={12} />{relativeTime(listing.createdAt)}</span>} />
                {listing.tokenId && <MetaRow label="Blockchain" value={<span className="inline-flex items-center gap-1 text-accent-400"><Star size={11} className="fill-accent-400" />On-chain</span>} />}
              </div>
            </div>

            {/* Location summary */}
            <div className="rounded-2xl border border-border-primary bg-surface-card p-5 space-y-2">
              <h3 className="text-sm font-semibold text-white">Location</h3>
              <div className="space-y-1.5 text-sm text-text-secondary">
                {listing.address.street && <p>{listing.address.street}</p>}
                <p>{[listing.address.city, listing.address.region].filter(Boolean).join(', ')}</p>
                <p>{listing.address.country}{listing.address.postalCode ? ` · ${listing.address.postalCode}` : ''}</p>
              </div>
              <div className="mt-2 rounded-lg bg-surface-highlight p-3 text-xs text-text-muted">
                <p>Coordinates: {listing.location.coordinates[1].toFixed(4)}, {listing.location.coordinates[0].toFixed(4)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DetailBlock({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">{title}</p>
      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-text-secondary">{text}</p>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-muted">{label}</span>
      {value}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const cls = status === 'published' ? 'bg-surface-success text-emerald-400'
    : status === 'draft' ? 'bg-surface-warning text-amber-400'
    : 'bg-surface-highlight text-text-secondary';
  return <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold capitalize', cls)}>{status}</span>;
}

function VerifPill({ status }: { status: string }) {
  const cls = status === 'verified' ? 'bg-surface-success text-emerald-400'
    : status === 'pending' ? 'bg-surface-warning text-amber-400'
    : 'bg-surface-danger text-red-400';
  return <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold capitalize', cls)}>{status.replace('_', ' ')}</span>;
}
