// ─── Site Config ──────────────────────────────────────────────────────────────
// Static metadata used by Next.js layout, SEO, and public pages.

export const siteConfig = {
  name: 'TerraChain Real Estate',
  shortName: 'TerraChain',
  title: "TerraChain - Blockchain Real Estate Marketplace",
  description:
    'A blockchain-enabled real estate marketplace for property owners and tenants. Discover listings, verify digital titles, complete KYC, and transact with escrow visibility.',

  // Used in <meta name="keywords">
  keywords: [
    'real estate',
    'blockchain',
    'property marketplace',
    'web3 real estate',
    'digital title verification',
    'map property search',
    'KYC verification',
    'escrow',
  ],

  // Open Graph / Social
  og: {
    title: 'TerraChain - Blockchain Real Estate Marketplace',
    description:
      'Verify ownership. Complete KYC. Transact with confidence on the blockchain.',
    image: '/og-image.png',
    type: 'website',
  },

  // Contact and support
  links: {
    support: 'support@swafir.com',
    operations: 'operations@swafir.com',
  },

  // Social — fill in when accounts are created
  social: {
    twitter: '',
    linkedin: '',
    github: '',
  },

  // Copyright
  copyright: `© ${new Date().getFullYear()} TerraChain Real Estate Platform. All rights reserved.`,
} as const;
