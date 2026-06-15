// ─── Site Config ──────────────────────────────────────────────────────────────
// Static metadata used by Next.js layout, SEO, and public pages.

export const siteConfig = {
  title: "VEX Real Estate",
  description:
    'A blockchain-powered real estate marketplace for property owners, tenants, and investors. Verify ownership, complete KYC, and transact with confidence.',

  // Used in <meta name="keywords">
  keywords: [
    'real estate',
    'blockchain',
    'property marketplace',
    'web3 real estate',
    'fractional ownership',
    'property investment',
    'KYC verification',
    'escrow',
  ],

  // Open Graph / Social
  og: {
    title: 'Swafir — Blockchain Real Estate Marketplace',
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
  copyright: `© ${new Date().getFullYear()} Swafir Real Estate Platform. All rights reserved.`,
} as const;
