export const HERO_IMAGE =
  'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1920&q=75';

export const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4';

export interface Property {
  id: string;
  name: string;
  location: string;
  listingType: 'sale' | 'rent';
  price: number;
  type: string;
  beds: number;
  baths: number;
  area: number;
  image: string;
  titleId: string;
  hash: string;
}

export const FEATURED_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    name: 'Parkview Residences - Unit 12A',
    location: 'Zurich, Switzerland',
    listingType: 'rent',
    price: 3800,
    type: 'Apartment',
    beds: 2,
    baths: 2,
    area: 96,
    image:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=70',
    titleId: 'VEX-2026-0312',
    hash: '0x7b41...e9c2',
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
    hash: '0x3da8...1f70',
  },
  {
    id: 'prop-3',
    name: 'Azure Coast Verified Villa',
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
    hash: '0x9f2c...a7e1',
  },
];

export const PARTNERS = [
  { name: 'Property Owners', type: 'Verified Listings' },
  { name: 'Tenants & Buyers', type: 'Applications / Offers' },
  { name: 'Admin Review', type: 'KYC & Compliance' },
  { name: 'Digital Title Registry', type: 'ERC-721 Anchoring' },
  { name: 'Lease Escrow', type: 'Deposit Protection' },
  { name: 'Map Discovery', type: 'Geo Search' },
  { name: 'Audit Ledger', type: 'Operational Oversight' },
  { name: 'Wallet Linking', type: 'On-Chain Identity' },
];

export const FEATURES = [
  {
    iconName: 'FileCheck' as const,
    title: 'Map-First Discovery',
    desc: 'Search by viewport, radius, polygon boundary, structured metadata, price, availability, amenities, and verified-title status from one spatial marketplace.',
    color: 'gold' as const,
  },
  {
    iconName: 'Lock' as const,
    title: 'Digital Title Records',
    desc: 'Approved ownership documents can be anchored to an ERC-721 certificate so tenants, buyers, owners, and admins can compare listing proof against chain data.',
    color: 'green' as const,
  },
  {
    iconName: 'ShieldCheck' as const,
    title: 'Escrow-Ready Leases',
    desc: 'Rental workflows connect applications, lease status, linked wallets, KYC checks, and escrow transaction tracking before deposits move.',
    color: 'gold' as const,
  },
  {
    iconName: 'ScrollText' as const,
    title: 'Compliance Oversight',
    desc: 'Admins and super admins can review KYC, listings, chain transactions, audit activity, and compliance signals without creating extra marketplace roles.',
    color: 'green' as const,
  },
];

export const TESTIMONIALS = [
  {
    rating: 5,
    text: 'The map made shortlisting simple, but the title panel is what changed the conversation. I could see what was verified before I sent an inquiry.',
    author: 'Sara Bekele',
    role: 'Tenant',
    avatar: 'SB',
  },
  {
    rating: 5,
    text: 'Every offer, document review, and title action is visible as a workflow instead of a mystery. That kind of traceability is exactly what property sales need.',
    author: 'Mateo Alvarez',
    role: 'Buyer',
    avatar: 'MA',
  },
  {
    rating: 5,
    text: 'Uploading a listing feels like preparing a real transaction, not posting an ad. Photos, documents, KYC, review status, and title readiness all live together.',
    author: 'Lemlem Tesfaye',
    role: 'Property Owner',
    avatar: 'LT',
  },
  {
    rating: 5,
    text: 'The admin view gives the operational picture: users, KYC, listings, chain transactions, leases, and audit logs in one place.',
    author: 'Hanna Muller',
    role: 'Compliance Admin',
    avatar: 'HM',
  },
  {
    rating: 5,
    text: 'Tenants ask better questions when the listing has structured metadata and review history. It filters out noise before we ever schedule a viewing.',
    author: 'Daniel Okoro',
    role: 'Property Owner',
    avatar: 'DO',
  },
  {
    rating: 5,
    text: 'I saved searches, compared neighborhoods, and checked title status from the same flow. It finally feels like property discovery caught up with modern finance.',
    author: 'Chloe Dubois',
    role: 'Tenant',
    avatar: 'CD',
  },
];

export const STATS = [
  { value: '4', label: 'Core Roles' },
  { value: 'Map', label: 'Discovery First' },
  { value: 'ERC-721', label: 'Title Records' },
  { value: 'Escrow', label: 'Lease Flow' },
];

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
