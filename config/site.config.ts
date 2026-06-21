export const siteConfig = {
  name: 'EstateLedger',
  shortName: 'EstateLedger',
  title: 'EstateLedger - Web3 Real Estate Marketplace',
  description:
    'A blockchain-enabled real estate marketplace for map-based property discovery, reviewed ownership records, KYC workflows, digital title data, lease escrow, and transparent property transactions.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  locale: 'en_US',
  keywords: [
    'web3 real estate',
    'blockchain real estate marketplace',
    'property listings',
    'map property search',
    'digital title verification',
    'ownership document review',
    'lease escrow',
    'purchase offers',
    'rental applications',
    'KYC real estate',
    'property owner listings',
  ],
  og: {
    title: 'EstateLedger - Blockchain-Enabled Property Listings',
    description:
      'Discover properties on a map-first marketplace with reviewed ownership evidence, digital title records, KYC review, and escrow-ready rental and purchase workflows.',
    image: '/og-image.png',
    type: 'website',
  },
  links: {
    support: 'support@swafir.com',
    operations: 'operations@swafir.com',
    owners: 'owners@swafir.com',
  },
  social: {
    twitter: '',
    linkedin: '',
    github: '',
  },
  copyright: `Copyright ${new Date().getFullYear()} EstateLedger. All rights reserved.`,
} as const;
