import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getListing } from "@/features/listings/services/listing.service";
import ListingDetail from "@/components/listing/ListingDetail";
import { createSeoMetadata, listingJsonLd, listingSeoMetadata } from "@/lib/seo";

// Property detail — canonical marketplace detail route (/properties/:id).
// ListingCard, MarketplaceDiscovery, and account pages all link here.
interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) {
    return createSeoMetadata({
      title: "Property Not Found",
      description: "This property listing may have been removed or is no longer available.",
      path: `/discovery/${id}`,
      noIndex: true,
    });
  }

  return listingSeoMetadata(listing, `/discovery/${id}`);
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) {
    notFound();
  }

  return (
    <div className="py-6">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(listingJsonLd(listing, `/discovery/${id}`)),
        }}
      />
      <ListingDetail listing={listing as any} />
    </div>
  );
}
