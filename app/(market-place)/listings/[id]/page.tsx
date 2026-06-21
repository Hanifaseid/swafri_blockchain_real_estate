import type { Metadata } from "next";
import { getListing } from "@/features/listings/services/listing.service";
import { ListingDetailView } from "@/components/listing/ListingDetailView";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createSeoMetadata, listingJsonLd, listingSeoMetadata } from "@/lib/seo";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) {
    return createSeoMetadata({
      title: "Listing Not Found",
      description: "This property listing may have been removed or the URL is incorrect.",
      path: `/listings/${id}`,
      noIndex: true,
    });
  }

  return listingSeoMetadata(listing, `/listings/${id}`);
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-32">
        <p className="text-6xl font-display font-bold text-white/10">404</p>
        <p className="mt-4 text-lg font-semibold text-white">
          Listing not found
        </p>
        <p className="mt-1 text-sm text-text-muted">
          This listing may have been removed or the URL is incorrect.
        </p>
        <Link
          href="/listings"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent-400 px-4 py-2.5 text-sm font-semibold text-emerald-950 hover:bg-accent-300 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to listings
        </Link>
      </div>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(listingJsonLd(listing, `/listings/${id}`)),
        }}
      />
      <ListingDetailView listing={listing} />
    </>
  );
}
