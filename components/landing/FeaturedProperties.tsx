'use client';

import Link from 'next/link';
import { ArrowRight, Building2 } from 'lucide-react';
import { useListings } from '@/features/listings/queries/listing.queries';
import { PropertyListingCard } from '@/components/listing/PropertyListingCard';
import SectionHeading from './SectionHeading';

export default function FeaturedProperties() {
  const { data, isLoading } = useListings({
    availabilityStatus: 'available',
    sort: 'newest',
    limit: 6,
    page: 1,
  });

  const items = data?.items ?? [];

  return (
    <section id="listings-section" className="relative z-10 py-24">
      <SectionHeading
        index="01"
        kicker="The Register"
        title={<>Verified properties,<br className="hidden md:block" /> ready to view.</>}
        description="Every listing is identity-checked, document-reviewed, and anchored to a blockchain certificate of title. Verify any of them yourself."
        action={
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 text-sm font-mono text-amber-300 hover:text-amber-200 transition-colors"
          >
            View all listings <ArrowRight className="w-4 h-4" />
          </Link>
        }
      />

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/5] animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] py-20">
          <Building2 className="h-10 w-10 text-amber-300/40" />
          <p className="mt-4 text-sm font-semibold text-white/60">No listings available yet.</p>
          <Link
            href="/listings"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-emerald-950 hover:bg-amber-400 transition-colors"
          >
            Browse all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((listing, i) => (
            <PropertyListingCard
              key={listing.id}
              listing={listing}
              href={`/listings/${listing.id}`}
              priority={i < 3}
              animationDelay={i * 80}
            />
          ))}
        </div>
      )}
    </section>
  );
}
