import type { Metadata } from 'next';
import { siteConfig } from '@/config/site.config';
import type { Listing } from '@/features/listings/types/listing.types';

type SeoInput = {
  title: string;
  description: string;
  path?: string;
  image?: string | null;
  keywords?: string[];
  noIndex?: boolean;
};

const absoluteUrl = (path = '/') => {
  const base = siteConfig.url.replace(/\/$/, '');
  const nextPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${nextPath}`;
};

export function createSeoMetadata({
  title,
  description,
  path = '/',
  image,
  keywords = [],
  noIndex = false,
}: SeoInput): Metadata {
  const url = absoluteUrl(path);
  const ogImage = image || siteConfig.og.image;

  return {
    title,
    description,
    keywords: [...siteConfig.keywords, ...keywords],
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
        },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: 'website',
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export const noIndexMetadata = (title: string, description: string): Metadata =>
  createSeoMetadata({ title, description, noIndex: true });

export function listingSeoMetadata(listing: Listing, path: string): Metadata {
  const location = [listing.address?.city, listing.address?.country]
    .filter(Boolean)
    .join(', ');
  const amount = listing.price ?? listing.monthlyRent;
  const price = amount ? `${listing.currency ?? 'USD'} ${amount.toLocaleString()}` : null;
  const listingType = listing.listingType === 'rent' ? 'for rent' : 'for sale';
  const title = `${listing.title} ${listingType}${location ? ` in ${location}` : ''} | ${siteConfig.shortName}`;
  const fallbackDescription = [
    `${listing.propertyType.replaceAll('_', ' ')} ${listingType}`,
    location ? `located in ${location}` : null,
    price ? `listed at ${price}${listing.listingType === 'rent' ? ' per month' : ''}` : null,
    'with map location, property details, ownership review status, and digital title context where available.',
  ]
    .filter(Boolean)
    .join(' ');
  const description = (listing.description || fallbackDescription).slice(0, 155);
  const cover = listing.photos?.find((photo) => photo.isCover) ?? listing.photos?.[0];

  return createSeoMetadata({
    title,
    description,
    path,
    image: cover?.url,
    keywords: [
      listing.propertyType.replaceAll('_', ' '),
      listing.listingType === 'rent' ? 'rental property' : 'property for sale',
      listing.address?.city,
      listing.address?.country,
    ].filter(Boolean) as string[],
  });
}

export function listingJsonLd(listing: Listing, path: string) {
  const cover = listing.photos?.find((photo) => photo.isCover) ?? listing.photos?.[0];
  const amount = listing.price ?? listing.monthlyRent;
  const availability =
    listing.availabilityStatus === 'sold' || listing.status === 'sold'
      ? 'https://schema.org/SoldOut'
      : listing.availabilityStatus === 'rented' || listing.status === 'rented'
        ? 'https://schema.org/LimitedAvailability'
        : 'https://schema.org/InStock';

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: listing.title,
    description: listing.description || siteConfig.description,
    url: absoluteUrl(path),
    image: cover?.url ? [cover.url] : undefined,
    datePosted: listing.createdAt,
    address: {
      '@type': 'PostalAddress',
      streetAddress: listing.address?.street,
      addressLocality: listing.address?.city,
      addressRegion: listing.address?.region,
      postalCode: listing.address?.postalCode,
      addressCountry: listing.address?.country,
    },
    geo: listing.location?.coordinates
      ? {
          '@type': 'GeoCoordinates',
          longitude: listing.location.coordinates[0],
          latitude: listing.location.coordinates[1],
        }
      : undefined,
    floorSize: listing.area
      ? {
          '@type': 'QuantitativeValue',
          value: listing.area.value,
          unitText: listing.area.unit,
        }
      : undefined,
    numberOfRooms: listing.bedrooms,
    numberOfBathroomsTotal: listing.bathrooms,
    offers: amount
      ? {
          '@type': 'Offer',
          price: amount,
          priceCurrency: listing.currency ?? 'USD',
          availability,
          businessFunction:
            listing.listingType === 'rent'
              ? 'https://schema.org/LeaseOut'
              : 'https://schema.org/Sell',
        }
      : undefined,
    provider: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}
