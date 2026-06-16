import { FileCheck, Lock, ShieldCheck, TrendingUp } from 'lucide-react';
import React from 'react';

// ─── HERO IMAGE ───
export const HERO_IMAGE =
  'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1920&q=75';

export const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4';

// ─── PROPERTY LISTINGS ───
export interface Property {
  id: string;
  name: string;
  location: string;
  tokenPrice: number;
  tokensAvailable: number;
  totalTokens: number;
  apy: number;
  monthlyRent: number;
  type: string;
  image: string;
}

export const FEATURED_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    name: 'Parkview Residences — Unit 12A',
    location: 'Zurich, Switzerland',
    tokenPrice: 120,
    tokensAvailable: 1540,
    totalTokens: 2500,
    apy: 9.4,
    monthlyRent: 3800,
    type: 'Apartment',
    image:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=70',
  },
  {
    id: 'prop-2',
    name: 'Marina Bay Skyline Studio',
    location: 'Marina Bay, Singapore',
    tokenPrice: 85,
    tokensAvailable: 840,
    totalTokens: 1200,
    apy: 11.2,
    monthlyRent: 2900,
    type: 'Studio',
    image:
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=70',
  },
  {
    id: 'prop-3',
    name: "Côte d'Azur Beachfront Villa",
    location: 'Nice, France',
    tokenPrice: 180,
    tokensAvailable: 950,
    totalTokens: 1500,
    apy: 12.1,
    monthlyRent: 22000,
    type: 'Villa',
    image:
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=70',
  },
];

// ─── PARTNERS ───
export const PARTNERS = [
  { name: "Sotheby's Realty", type: 'Premium Real Estate' },
  { name: 'Solana Labs', type: 'L1 Blockchain Network' },
  { name: 'Ethereum Foundation', type: 'Smart Contracts Standards' },
  { name: 'Coinbase Prime', type: 'Liquidity & Custody' },
  { name: 'BlackRock Real Estate', type: 'Institutional Assets' },
  { name: 'Andreessen Horowitz', type: 'Venture Capital' },
  { name: 'ChainLink Oracles', type: 'On-Chain Price Feeds' },
  { name: 'Polygon zkEVM', type: 'Layer-2 Settlement' },
];

// ─── PLATFORM FEATURES ───
export const FEATURES = [
  {
    iconName: 'FileCheck' as const,
    title: 'Digital Property Ledger',
    desc: 'Every deed is hashed and anchored as an immutable ERC-1155 certificate. Ownership is transparent, tamper-proof, and legally enforceable across multiple jurisdictions.',
    color: 'emerald' as const,
  },
  {
    iconName: 'Lock' as const,
    title: 'Smart Contract Rentals',
    desc: 'Tenant payments flow through multisig escrow wallets and stream automatically to token holders on Layer-2 — no banks, no delays, fully auditable on-chain.',
    color: 'white' as const,
  },
  {
    iconName: 'ShieldCheck' as const,
    title: 'Verified Ownership',
    desc: 'Properties are cross-referenced with physical land registries before listing. Admin-approved KYC ensures every participant is identity-verified.',
    color: 'emerald' as const,
  },
  {
    iconName: 'TrendingUp' as const,
    title: 'Transparent Transactions',
    desc: 'Every buy, rent, and escrow release is recorded on-chain. Investors can audit yield history, occupancy rates, and property performance in real time.',
    color: 'white' as const,
  },
];

// ─── TESTIMONIALS ───
export const TESTIMONIALS = [
  {
    rating: 5,
    text: 'VEX transformed our family office. Switching from manual escrow to zkSync smart contracts means yields compile to the minute. We can diversify across Zurich, Singapore, and Tokyo from one dashboard.',
    author: 'Elena Rostova',
    role: 'Managing Director, AlpCapital',
    avatar: 'ER',
  },
  {
    rating: 5,
    text: 'Paying rent via MetaMask is seamless. VEX handles Layer-2 gas and my landlord approves maintenance tickets instantly because every action is logged as an immutable smart-lock status.',
    author: 'Kenji Gauthier',
    role: 'Tenant, Parkview Residences',
    avatar: 'KG',
  },
  {
    rating: 5,
    text: 'We audited the real deeds before investing. VEX holds legally integrated covenants that correspond directly to token values — fully enforceable in international courts.',
    author: 'Marcus Jenkins',
    role: 'Chief Legal, BlockTrust Real Estate',
    avatar: 'MJ',
  },
  {
    rating: 5,
    text: 'Listing our residential portfolio was seamless. Once certified, we raised $5M in fractional capital in under 24 hours — no traditional roadshow required.',
    author: 'Sarah Jenkinson',
    role: 'Development Lead, Apex Living',
    avatar: 'SJ',
  },
  {
    rating: 5,
    text: "As an asset consultant, the transparent on-chain IoT tracking is stellar. Clients view building performance and yield reports live — builds enormous trust instantly.",
    author: 'Amir Al-Dossari',
    role: 'Sovereign Asset Consultant',
    avatar: 'AA',
  },
  {
    rating: 5,
    text: 'Fractional buying let our investment club access prime Swiss real estate. Instant USDC distribution completely eliminates international banking fees.',
    author: 'Chloe Dubois',
    role: 'Head of Club, Nexus Capital',
    avatar: 'CD',
  },
];

// ─── STATS ───
export const STATS = [
  { value: '$1.4B+', label: 'Real Estate On-Chain' },
  { value: '14,200+', label: 'Token Holders' },
  { value: '100%', label: 'Deed-Verified' },
  { value: '30+', label: 'Countries' },
];

// ─── MOCK TXN GENERATOR ───
export function generateMockTxnData(actionText: string) {
  const randomHash =
    '0x' +
    Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const blockNum = Math.floor(8249000 + Math.random() * 50000);
  const gasLimit = Math.floor(21000 + Math.random() * 85000).toLocaleString();
  return {
    hash: randomHash,
    action: actionText,
    gas: `${gasLimit} Gwei`,
    block: blockNum,
    proof: `zk-SNARK-${Math.floor(100000 + Math.random() * 900000)}`,
    status: 'mining' as const,
  };
}
