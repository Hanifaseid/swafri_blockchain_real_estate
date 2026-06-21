import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site.config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/about', '/contact', '/discovery', '/listings'],
        disallow: ['/account', '/admin', '/auth'],
      },
    ],
    sitemap: `${siteConfig.url.replace(/\/$/, '')}/sitemap.xml`,
  };
}
