import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site.config';
import { getListings } from '@/features/listings/services/listing.service';

const publicRoutes = ['/', '/about', '/contact', '/discovery', '/listings'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, '');
  const now = new Date();
  const staticEntries = publicRoutes.map((route) => ({
    url: `${base}${route}`,
    lastModified: now,
    changeFrequency: route === '/' ? 'daily' : 'weekly',
    priority: route === '/' ? 1 : route === '/discovery' || route === '/listings' ? 0.9 : 0.6,
  })) satisfies MetadataRoute.Sitemap;

  const listings = await getListings({ limit: 100, sort: 'newest' }).catch(() => ({
    items: [],
  }));

  const listingEntries = listings.items.map((listing) => ({
    url: `${base}/listings/${listing.id}`,
    lastModified: new Date(listing.updatedAt || listing.createdAt || now),
    changeFrequency: 'daily',
    priority: 0.8,
  })) satisfies MetadataRoute.Sitemap;

  return [...staticEntries, ...listingEntries];
}
