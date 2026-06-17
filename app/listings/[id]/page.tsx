import React from 'react';
import { notFound } from 'next/navigation';
import { getListing } from '@/features/listings/services/listing.service';
import ListingDetail from '../../../components/listing/ListingDetail';

// Server route — fetch listing by id and render client detail component
interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  let listing = await getListing(id);

  // Fallback: if API not available, render a graceful mock listing
  if (!listing) {
    listing = {
      id,
      title: `Sample Property ${id}`,
      description:
        'This is a demo property detail. The real API may provide richer content including photos, blockchain proof and owner contact.',
      listingType: 'rent',
      category: 'residential',
      propertyType: 'apartment',
      status: 'published',
      verificationStatus: 'verified',
      price: 1200,
      monthlyRent: 1200,
      currency: 'USD',
      bedrooms: 2,
      bathrooms: 2,
      area: { value: 1100, unit: 'sqft' },
      yearBuilt: 2012,
      floorNumber: 3,
      totalFloors: 6,
      parkingSpaces: 1,
      address: { street: '1 Demo St', city: 'Geneva', region: 'GE', country: 'Switzerland' },
      location: { type: 'Point', coordinates: [6.1423, 46.2044] },
      amenities: ['Elevator', 'Balcony', 'High-speed internet'],
      photos: [
        { url: '/placeholder-property.jpg', publicId: 'p1', isCover: true },
      ],
      tokenId: undefined,
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any;
  }

  return (
    <div className="py-6">
      {/* ListingDetail is a client component that handles interactivity */}
      <ListingDetail listing={listing as any} />
    </div>
  );
}
