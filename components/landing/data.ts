// ─── HERO MEDIA ───
export const HERO_IMAGE =
  'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1920&q=75';

export const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4';

// ─── FEATURED LISTINGS (verified whole-property, rent or sale) ───
export interface Property {
  id: string;
  name: string;
  location: string;
  listingType: 'sale' | 'rent';
  price: number; // sale price, or monthly rent
  type: string; // Apartment, Villa, Studio, ...
  beds: number;
  baths: number;
  area: number; // sqm
  image: string;
  titleId: string; // on-chain certificate id
  hash: string; // ownership-document hash (truncated for display)
}

export const FEATURED_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    name: 'Parkview Residences — Unit 12A',
    location: 'Zürich, Switzerland',
    listingType: 'rent',
    price: 3800,
    type: 'Apartment',
    beds: 2,
    baths: 2,
    area: 96,
    image:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=70',
    titleId: 'VEX-2026-0312',
    hash: '0x7b41…e9c2',
  },
  {
    id: 'prop-2',
    name: 'Marina Bay Skyline Studio',
    location: 'Marina Bay, Singapore',
    listingType: 'sale',
    price: 720000,
    type: 'Studio',
    beds: 1,
    baths: 1,
    area: 54,
    image:
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=70',
    titleId: 'VEX-2026-0427',
    hash: '0x3da8…1f70',
  },
  {
    id: 'prop-3',
    name: "Côte d'Azur Beachfront Villa",
    location: 'Nice, France',
    listingType: 'sale',
    price: 4250000,
    type: 'Villa',
    beds: 5,
    baths: 4,
    area: 410,
    image:
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=70',
    titleId: 'VEX-2026-0481',
    hash: '0x9f2c…a7e1',
  },
];

// ─── TRUST PARTNERS (registries, identity, custody, settlement) ───
export const PARTNERS = [
  { name: "Sotheby's International Realty", type: 'Listing Partner' },
  { name: 'HM Land Registry', type: 'Title Verification' },
  { name: 'Persona', type: 'Identity / KYC' },
  { name: 'Circle USDC', type: 'Settlement Stablecoin' },
  { name: 'Chainlink', type: 'On-Chain Proof' },
  { name: 'Fireblocks', type: 'Escrow Custody' },
  { name: 'Ethereum', type: 'Title Anchoring' },
  { name: 'Onfido', type: 'AML Screening' },
];

// ─── PLATFORM PILLARS ───
export const FEATURES = [
  {
    iconName: 'FileCheck' as const,
    title: 'Certificate of Title',
    desc: 'Every approved ownership document is hashed and minted as an ERC-721 title certificate. Anyone can verify a listing against the chain — no intermediary required.',
    color: 'gold' as const,
  },
  {
    iconName: 'Lock' as const,
    title: 'Escrow-Protected Money',
    desc: 'Rental deposits and purchase funds are held in audited on-chain escrow and released only at agreed milestones — release, refund, or settle, all on the record.',
    color: 'green' as const,
  },
  {
    iconName: 'ShieldCheck' as const,
    title: 'Verified Identities',
    desc: 'Owners and counterparties clear KYC review before a listing goes live or a deposit moves. Compliance is built into the flow, not bolted on.',
    color: 'gold' as const,
  },
  {
    iconName: 'ScrollText' as const,
    title: 'A Transparent Record',
    desc: 'Every mint, fund, release, dispute, and resolution is written to an auditable ledger — a single source of truth for owners, tenants, and regulators.',
    color: 'green' as const,
  },
];

// ─── TESTIMONIALS (renters, buyers, owners, registrar) ───
export const TESTIMONIALS = [
  {
    rating: 5,
    text: 'I could verify the title on-chain before I ever sent a deposit. The escrow refunded the moment the lease completed — no chasing the landlord, no awkward emails.',
    author: 'Sara Bekele',
    role: 'Renter · Zürich',
    avatar: 'SB',
  },
  {
    rating: 5,
    text: 'Buying across borders used to mean trusting a stack of PDFs. Here the deed hash matched the certificate exactly. The closing was the calmest paperwork of my life.',
    author: 'Mateo Alvarez',
    role: 'Buyer · Marina Bay',
    avatar: 'MA',
  },
  {
    rating: 5,
    text: 'Listing our portfolio was refreshingly strict — documents reviewed, identity checked, then the title minted. Serious buyers showed up because the proof was already there.',
    author: 'Lemlem Tesfaye',
    role: 'Property Owner · Addis Ababa',
    avatar: 'LT',
  },
  {
    rating: 5,
    text: 'The review queues and audit log make compliance legible. I can trace every status change and every on-chain action back to who did it and when.',
    author: 'Hanna Müller',
    role: 'Compliance Admin',
    avatar: 'HM',
  },
  {
    rating: 5,
    text: 'Deposits in escrow, released on completion, itemised on a ledger. Disputes are rare now because everyone can see the same record.',
    author: 'Daniel Okoro',
    role: 'Landlord · Lagos',
    avatar: 'DO',
  },
  {
    rating: 5,
    text: 'As a buyer I cared about one thing: is this real? The certificate of title answered it in seconds. That confidence closed the deal.',
    author: 'Chloé Dubois',
    role: 'Buyer · Nice',
    avatar: 'CD',
  },
];

// ─── HEADLINE FIGURES ───
export const STATS = [
  { value: '12,400+', label: 'Verified Listings' },
  { value: '100%', label: 'Title-Anchored' },
  { value: '24h', label: 'Avg. Verification' },
  { value: '30+', label: 'Countries' },
];

// ─── On-chain verification receipt (demo) ───
export function generateVerificationReceipt(titleId: string, action: string) {
  const randomHash =
    '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const blockNum = Math.floor(8_249_000 + Math.random() * 50_000);
  return {
    hash: randomHash,
    action,
    titleId,
    block: blockNum,
    registrar: 'VEX Property Register',
    status: 'mining' as const,
  };
}
