'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Coins,
  ShieldCheck,
  Building2,
  Wallet,
  Activity,
  Sparkles,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
  Bot,
  Minimize2,
  RotateCcw,
  MapPin,
  Lock,
  FileCheck,
  TrendingUp,
  Users,
  ArrowRight,
  CheckCircle2,
  Home,
  Key,
} from 'lucide-react';
import AnimatedHeading from './AnimatedHeading';
import FadeIn from './FadeIn';

// ─── HERO IMAGE: high-quality real estate, preloaded via <link rel="preload"> in layout ───
const HERO_IMAGE = 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1920&q=75';

// ─── PROPERTY LISTINGS ───
interface Property {
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

const FEATURED_PROPERTIES: Property[] = [
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
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=70',
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
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=70',
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
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=70',
  },
];

// ─── PARTNERS ───
const PARTNERS = [
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
const FEATURES = [
  {
    icon: <FileCheck className="w-6 h-6 text-emerald-400" />,
    title: 'Digital Property Ledger',
    desc: 'Every deed is hashed and anchored as an immutable ERC-1155 certificate. Ownership is transparent, tamper-proof, and legally enforceable across multiple jurisdictions.',
  },
  {
    icon: <Lock className="w-6 h-6 text-white" />,
    title: 'Smart Contract Rentals',
    desc: 'Tenant payments flow through multisig escrow wallets and stream automatically to token holders on Layer-2 — no banks, no delays, fully auditable on-chain.',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
    title: 'Verified Ownership',
    desc: 'Properties are cross-referenced with physical land registries before listing. Admin-approved KYC ensures every participant is identity-verified.',
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-white" />,
    title: 'Transparent Transactions',
    desc: 'Every buy, rent, and escrow release is recorded on-chain. Investors can audit yield history, occupancy rates, and property performance in real time.',
  },
];

// ─── TESTIMONIALS ───
const TESTIMONIALS = [
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

// ─── MOCK TXN GENERATOR ───
function generateMockTxnData(actionText: string) {
  const randomHash = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
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

// ─── STAT TICKER ───
const STATS = [
  { value: '$1.4B+', label: 'Real Estate On-Chain' },
  { value: '14,200+', label: 'Token Holders' },
  { value: '100%', label: 'Deed-Verified' },
  { value: '30+', label: 'Countries' },
];

const VIDEO_SRC = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4';

export default function LandingPage() {
  const [properties, setProperties] = useState<Property[]>(FEATURED_PROPERTIES);
  const [heroImgLoaded, setHeroImgLoaded] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Testimonials
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : true
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Preload hero image so it shows instantly
  useEffect(() => {
    const img = new Image();
    img.src = HERO_IMAGE;
    img.onload = () => setHeroImgLoaded(true);
  }, []);

  // Start loading the video in the background as soon as component mounts.
  // We do NOT autoplay until canplaythrough fires so there is zero flicker.
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const onReady = () => setVideoReady(true);
    vid.addEventListener('canplaythrough', onReady, { once: true });
    vid.load();
    return () => vid.removeEventListener('canplaythrough', onReady);
  }, []);

  // Once video is ready, start playing it (muted, so browser always allows it)
  useEffect(() => {
    if (videoReady && videoRef.current) {
      videoRef.current.play().catch(() => {/* silently ignore autoplay policy errors */});
    }
  }, [videoReady]);

  const handlePrevTestimonial = () => {
    setCurrentTestimonialIndex((prev) => {
      const limit = isMobile ? TESTIMONIALS.length - 1 : TESTIMONIALS.length - 3;
      return prev === 0 ? limit : prev - 1;
    });
  };
  const handleNextTestimonial = () => {
    setCurrentTestimonialIndex((prev) => {
      const limit = isMobile ? TESTIMONIALS.length - 1 : TESTIMONIALS.length - 3;
      return prev >= limit ? 0 : prev + 1;
    });
  };

  // Txn receipt
  const [txnReceipt, setTxnReceipt] = useState<{
    hash: string; action: string; gas: string; block: number; proof: string; status: 'success' | 'mining';
  } | null>(null);

  const triggerMockTxn = (actionText: string) => {
    const data = generateMockTxnData(actionText);
    setTxnReceipt({ ...data, status: 'mining' });
    setTimeout(() => setTxnReceipt((prev) => (prev ? { ...prev, status: 'success' } : null)), 1800);
  };

  // Buy tokens
  const handleBuyTokens = (propId: string, qty: number) => {
    const target = properties.find((p) => p.id === propId);
    if (!target || target.tokensAvailable < qty) return;
    setProperties((cur) =>
      cur.map((p) => (p.id === propId ? { ...p, tokensAvailable: p.tokensAvailable - qty } : p))
    );
    triggerMockTxn(`fractional buy of ${qty} token(s) — ${target.name}`);
  };

  // AI Chat
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content:
        'Welcome to VEX. I am your blockchain real estate advisor. Ask me about fractional ownership, rental yields, smart contracts, or verified property listings.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatOpen) chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatOpen]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || chatInput;
    if (!textToSend.trim() || isSendingMsg) return;
    const newMessages = [...chatMessages, { role: 'user' as const, content: textToSend }];
    setChatMessages(newMessages);
    if (!customPrompt) setChatInput('');
    setIsSendingMsg(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await response.json();
      setChatMessages((prev) => [...prev, { role: 'assistant' as const, content: data.text || data.error }]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant' as const, content: 'Network timeout. Please check your API configuration.' },
      ]);
    } finally {
      setIsSendingMsg(false);
    }
  };

  return (
    <div className="min-h-screen text-white relative font-sans selection:bg-white selection:text-black">

      {/* ── HERO BACKGROUND: image shows instantly → video crossfades in once ready ── */}
      <div className="fixed inset-0 -z-10 overflow-hidden">

        {/* Layer 1: tiny LQIP placeholder — shows in the first ~100ms */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=400&q=10')`,
          }}
        />

        {/* Layer 2: full-quality hero image fades over the LQIP once loaded */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
          style={{
            backgroundImage: `url('${HERO_IMAGE}')`,
            opacity: heroImgLoaded ? 1 : 0,
          }}
        />

        {/* Layer 3: video — preloaded silently, fades in over the image once canplaythrough fires */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          style={{ opacity: videoReady ? 1 : 0 }}
          src={VIDEO_SRC}
          loop
          muted
          playsInline
          preload="auto"
        />

        {/* Persistent gradient overlay — sits above all layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/85" />

        {/* Ambient glow accents */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-emerald-900/15 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />
      </div>

      {/* ── NAVBAR ── */}
      <header className="px-6 md:px-12 lg:px-16 pt-6 sticky top-0 z-50">
        <div className="liquid-glass rounded-xl px-4 py-2.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 select-none">
            <div className="w-7 h-7 rounded bg-white flex items-center justify-center text-black font-extrabold text-sm">V</div>
            <span className="text-xl font-semibold tracking-tight text-white">VEX</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm">
            {[
              { label: 'Properties', id: 'listings-section' },
              { label: 'Platform', id: 'features-section' },
              { label: 'How It Works', id: 'how-it-works-section' },
              { label: 'Reviews', id: 'testimonials-section' },
            ].map(({ label, id }) => (
              <button
                key={id}
                onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
                className="text-white/80 hover:text-white transition-colors cursor-pointer font-medium"
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/auth"
              className="bg-white text-black text-sm font-semibold px-5 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="min-h-[90vh] flex flex-col justify-end px-6 md:px-12 lg:px-16 pb-16 pt-12 relative z-10">
        <div className="max-w-7xl mx-auto w-full">
          <FadeIn delay={0} duration={600}>
            <span className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Blockchain-Powered Real Estate Platform
            </span>
          </FadeIn>

          <AnimatedHeading
            text={"Own Real Estate\non the Blockchain."}
            className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light mb-6 text-white leading-tight"
            style={{ letterSpacing: '-0.04em' }}
          />

          <FadeIn delay={600} duration={800}>
            <p className="text-base md:text-xl text-white/70 mb-8 max-w-2xl leading-relaxed font-light">
              Secure, transparent property ownership through smart contracts. Buy fractional shares in verified real estate — from Zurich penthouses to Singapore commercial towers — starting at $85 USDC.
            </p>
          </FadeIn>

          <FadeIn delay={900} duration={800}>
            <div className="flex flex-wrap gap-4 mb-14">
              <Link
                href="/auth"
                className="bg-white text-black px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2 shadow-lg"
              >
                <Home className="w-4 h-4" />
                Explore Properties
              </Link>
              <Link
                href="/auth"
                className="liquid-glass border border-white/20 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-colors inline-flex items-center gap-2"
              >
                <Key className="w-4 h-4 text-emerald-400" />
                Start Listing Property
              </Link>
            </div>
          </FadeIn>

          {/* Stats row */}
          <FadeIn delay={1100} duration={800}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
              {STATS.map((s) => (
                <div key={s.label} className="liquid-glass border border-white/10 rounded-xl px-4 py-4">
                  <div className="text-2xl md:text-3xl font-light text-white font-mono">{s.value}</div>
                  <div className="text-[11px] text-white/45 tracking-wider uppercase mt-1 font-mono">{s.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── PARTNER MARQUEE ── */}
      <section className="py-8 overflow-hidden border-y border-white/10 relative z-20">
        <div className="relative w-full flex items-center">
          <div className="animate-marquee flex gap-10 text-sm text-white font-mono uppercase tracking-widest">
            {[...PARTNERS, ...PARTNERS].map((partner, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2 rounded-full whitespace-nowrap"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-white text-xs">{partner.name}</span>
                <span className="text-white/35 text-[10px]">// {partner.type}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PROPERTIES ── */}
      <section id="listings-section" className="py-24 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto z-10 relative">
        <FadeIn delay={0} duration={600}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 mb-2 block">
                Live Token Marketplace
              </span>
              <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight">
                Verified Properties, Ready to Own
              </h2>
              <p className="text-sm text-white/50 mt-2 max-w-lg font-light">
                Every listing is deed-verified, admin-approved, and backed by a blockchain title certificate.
              </p>
            </div>
            <Link
              href="/auth"
              className="mt-6 md:mt-0 flex items-center gap-2 text-sm text-emerald-400 font-mono hover:text-white transition-colors"
            >
              View All Properties <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6">
          {properties.map((prop, i) => (
            <FadeIn key={prop.id} delay={i * 120} duration={600}>
              <div className="liquid-glass border border-white/15 rounded-2xl overflow-hidden group shadow-xl flex flex-col">
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={prop.image}
                    alt={prop.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur text-[10px] font-mono font-bold text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-900/40 uppercase">
                    {prop.type}
                  </div>
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur text-xs font-mono font-semibold text-white px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-emerald-400" />
                    ${prop.tokenPrice} USDC
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white/80 text-[11px] font-mono">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    {prop.location}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col gap-4 flex-1">
                  <div>
                    <h3 className="text-base font-semibold text-white leading-tight">{prop.name}</h3>
                    <p className="text-sm text-white/50 mt-1 font-mono">
                      ${prop.monthlyRent.toLocaleString()}/mo rental income
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                    <div className="bg-white/5 border border-white/10 rounded-lg py-2">
                      <div className="text-white/40 text-[9px] uppercase mb-0.5">APY Yield</div>
                      <div className="text-emerald-400 font-bold">+{prop.apy}%</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg py-2">
                      <div className="text-white/40 text-[9px] uppercase mb-0.5">Available</div>
                      <div className="text-white font-bold">{prop.tokensAvailable.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Token sale progress */}
                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-white/40 mb-1.5">
                      <span>Token Distribution</span>
                      <span>{Math.round(((prop.totalTokens - prop.tokensAvailable) / prop.totalTokens) * 100)}% Sold</span>
                    </div>
                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${((prop.totalTokens - prop.tokensAvailable) / prop.totalTokens) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => handleBuyTokens(prop.id, 1)}
                      className="flex-1 bg-white hover:bg-gray-100 text-black text-xs font-bold py-2.5 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      Buy Token
                    </button>
                    <Link
                      href="/auth"
                      className="liquid-glass border border-white/20 hover:bg-white/10 transition-colors text-xs font-semibold py-2.5 px-4 rounded-lg flex items-center gap-1"
                    >
                      Details <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── PLATFORM FEATURES ── */}
      <section id="features-section" className="py-24 border-y border-white/10 relative z-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
          <FadeIn delay={0} duration={600}>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-900/30">
                Platform Capabilities
              </span>
              <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight mt-4">
                Built for Real Estate. Secured by Blockchain.
              </h2>
              <p className="text-sm text-white/50 mt-3 font-light leading-relaxed">
                From fractional deed tokenization to smart lease automation — every feature is engineered around verified, on-chain property ownership.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <FadeIn key={i} delay={i * 100} duration={600}>
                <div className="liquid-glass border border-white/10 rounded-2xl p-6 hover:border-white/25 transition-all group h-full">
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                    {f.icon}
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-xs text-white/50 leading-relaxed font-light">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works-section" className="py-24 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto z-10 relative">
        <FadeIn delay={0} duration={600}>
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 mb-3 block">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight">
              For Tenants & Property Owners
            </h2>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Tenant side */}
          <FadeIn delay={0} duration={600}>
            <div className="liquid-glass border border-white/15 rounded-2xl p-8 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-900/40 border border-emerald-800/40 flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">For Tenants</div>
                  <h3 className="text-lg font-semibold text-white">Rent or Invest in Property</h3>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { step: '01', title: 'Browse Verified Listings', desc: 'Find deed-verified apartments, villas, offices and studios with full ownership history on-chain.' },
                  { step: '02', title: 'Transparent Rental Agreements', desc: 'Sign smart contract leases directly. All terms are immutable, visible, and enforceable on-chain.' },
                  { step: '03', title: 'Secure Payments via Escrow', desc: 'Pay rent through multisig escrow. Funds release automatically at contract milestones — no disputes.' },
                  { step: '04', title: 'Buy Fractional Ownership', desc: 'Own a share of any property starting from $85 USDC. Earn proportional rental yield every month.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="text-[11px] font-mono text-emerald-400 font-bold w-6 shrink-0 pt-0.5">{item.step}</div>
                    <div>
                      <div className="text-sm font-semibold text-white">{item.title}</div>
                      <div className="text-xs text-white/50 font-light mt-0.5 leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/auth"
                className="mt-8 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
              >
                Find a Property <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeIn>

          {/* Owner side */}
          <FadeIn delay={150} duration={600}>
            <div className="liquid-glass border border-white/15 rounded-2xl p-8 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-900/40 border border-blue-800/40 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">For Property Owners</div>
                  <h3 className="text-lg font-semibold text-white">List, Verify & Manage</h3>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { step: '01', title: 'Submit Your Property', desc: 'Upload deed documents, photos, and ownership certificates. Our admin team verifies every listing.' },
                  { step: '02', title: 'Verify Ownership On-Chain', desc: 'Once approved, your deed is hashed and anchored as an ERC-1155 digital title certificate.' },
                  { step: '03', title: 'Tokenize & Raise Capital', desc: 'Divide your property into fractional tokens. Raise capital from global investors in under 24 hours.' },
                  { step: '04', title: 'Connect with Trusted Tenants', desc: 'Manage tenant inquiries, track occupancy, and receive rent automatically through smart escrow.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="text-[11px] font-mono text-blue-400 font-bold w-6 shrink-0 pt-0.5">{item.step}</div>
                    <div>
                      <div className="text-sm font-semibold text-white">{item.title}</div>
                      <div className="text-xs text-white/50 font-light mt-0.5 leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/auth"
                className="mt-8 w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
              >
                List Your Property <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── TRUST SECTION WITH REAL ESTATE IMAGE ── */}
      <section className="py-24 border-y border-white/10 relative z-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeIn delay={0} duration={600}>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 mb-3 block">
                  Why VEX
                </span>
                <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight mb-6">
                  The Trust Layer for Global Real Estate
                </h2>
                <div className="space-y-4 text-white/60 font-light leading-relaxed text-sm">
                  <p>
                    VEX tokenizes premium real estate into ERC-1155 fractional assets, allowing anyone to own a slice of a Zurich penthouse, a Singapore tower, or a Tokyo loft — no brokers, no borders, no minimums.
                  </p>
                  <p>
                    Every property is cross-referenced with physical land registries. Deed hashes are anchored on-chain and smart escrow contracts distribute rental yields to token holders every 30 days — verified, auditable, unstoppable.
                  </p>
                </div>
                <div className="mt-8 space-y-3">
                  {[
                    'Deed documents verified before any listing goes live',
                    'Smart contract escrow — no manual payment processing',
                    'KYC & AML compliance built into every transaction',
                    'Rental yields stream directly to your wallet monthly',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm text-white/70">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={200} duration={600}>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden border border-white/15 shadow-2xl aspect-[4/3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=70"
                    alt="Luxury real estate property"
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                {/* Floating stats card */}
                <div className="absolute -bottom-5 -left-5 liquid-glass border border-white/20 rounded-xl p-4 shadow-2xl">
                  <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1">Live Blockchain Tx</div>
                  <div className="text-sm font-mono text-emerald-400 font-bold">+$22,400 USDC</div>
                  <div className="text-[10px] text-white/50 font-mono">Rental yield distributed · 2 min ago</div>
                </div>
                {/* Top right verified badge */}
                <div className="absolute -top-4 -right-4 liquid-glass border border-emerald-800/40 rounded-xl p-3 shadow-xl flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-[9px] font-mono text-white/40 uppercase">Deed Verified</div>
                    <div className="text-[10px] font-mono text-white font-bold">ERC-1155 Certified</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials-section" className="py-24 relative z-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
          <FadeIn delay={0} duration={600}>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 mb-2 block">
                  Verified Investor Reviews
                </span>
                <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight">
                  Trusted by Property Investors Worldwide
                </h2>
              </div>
              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10">
                <button
                  onClick={handlePrevTestimonial}
                  className="w-9 h-9 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 flex items-center justify-center transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 text-emerald-400" />
                </button>
                <button
                  onClick={handleNextTestimonial}
                  className="w-9 h-9 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 flex items-center justify-center transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>
          </FadeIn>

          <div className="overflow-hidden">
            <div
              className="flex gap-5 transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentTestimonialIndex * (isMobile ? 100 : 33.3333)}%)` }}
            >
              {TESTIMONIALS.map((t, idx) => (
                <div
                  key={idx}
                  className="liquid-glass border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between shrink-0 w-full md:w-[calc(33.3333%-14px)]"
                >
                  <div>
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(t.rating)].map((_, i) => (
                        <Sparkles key={i} className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                      ))}
                    </div>
                    <p className="text-sm text-white/75 leading-relaxed font-light mb-5">&quot;{t.text}&quot;</p>
                  </div>
                  <div className="flex items-center gap-3 border-t border-white/10 pt-4">
                    <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center font-bold text-white text-xs shrink-0">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{t.author}</div>
                      <div className="text-[10px] text-white/40 font-mono uppercase">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="py-20 px-6 md:px-12 lg:px-16 max-w-5xl mx-auto z-10 relative">
        <div className="liquid-glass border border-white/20 rounded-3xl p-10 md:p-14 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/8 rounded-full blur-[100px] -z-10 pointer-events-none" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/50 border border-emerald-900/40 px-3 py-1.5 rounded-full">
            Start Today — No Minimum Investment
          </span>
          <h3 className="text-2xl md:text-4xl font-light text-white mt-6 mb-4 tracking-tight">
            Secure the Future of Real Estate<br />with Blockchain Ownership
          </h3>
          <p className="text-sm text-white/55 max-w-xl mx-auto mb-8 font-light leading-relaxed">
            Get instant access to deed-verified fractional properties, on-chain rental yields, smart lease contracts, and a fully auditable blockchain ownership registry — all from one platform.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth"
              className="bg-white hover:bg-gray-100 text-black px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg active:scale-95 inline-flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Explore Properties
            </Link>
            <Link
              href="/auth"
              className="liquid-glass border border-white/20 hover:bg-white/10 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg active:scale-95 inline-flex items-center gap-2"
            >
              <Key className="w-4 h-4 text-emerald-400" />
              List Your Property
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-white flex items-center justify-center text-black font-extrabold text-xs">V</div>
              <span className="font-mono text-xs text-white/40 uppercase tracking-widest">VEX Real Estate Ledger Inc.</span>
            </div>
            <div className="flex items-center gap-6 font-mono text-[11px] text-white/35">
              <span>ERC-1155 Tokenization</span>
              <span>zkSync Layer-2</span>
              <span>Smart Escrow</span>
            </div>
            <div className="font-mono text-[11px] text-white/30">© 2026 VEX // Blockchain Real Estate Platform</div>
          </div>
        </div>
      </footer>

      {/* ── AI CHAT FAB ── */}
      <button
        onClick={() => setIsChatOpen((v) => !v)}
        aria-label="VEX AI Assistant"
        className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-emerald-600 shadow-2xl flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform group"
        style={{ boxShadow: '0 12px 30px rgba(16,185,129,0.25)' }}
      >
        {isChatOpen ? (
          <Minimize2 className="w-5 h-5 text-white" />
        ) : (
          <>
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-black animate-pulse" />
          </>
        )}
      </button>

      {/* ── AI CHAT POPUP ── */}
      {isChatOpen && (
        <div
          className="fixed bottom-28 right-8 z-50 w-[360px] max-w-[calc(100vw-2rem)] flex flex-col"
          style={{
            height: '520px',
            borderRadius: '20px',
            overflow: 'hidden',
            background: 'rgba(5,10,15,0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          }}
        >
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-900/50 border border-emerald-700/40 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-none">VEX AI Advisor</p>
                <p className="text-[10px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Real Estate Intelligence
                </p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => setChatMessages([{ role: 'assistant', content: 'Welcome to VEX. I am your blockchain real estate advisor. Ask me about fractional ownership, rental yields, smart contracts, or verified property listings.' }])}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3 text-white/50" />
              </button>
              <button
                onClick={() => setIsChatOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 cursor-pointer transition-colors"
              >
                <X className="w-3 h-3 text-white/50" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg bg-emerald-900/50 border border-emerald-700/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'assistant'
                      ? 'bg-white/6 border border-white/10 text-white/80 rounded-tl-sm'
                      : 'bg-white text-black rounded-tr-sm'
                  }`}
                  style={msg.role === 'assistant' ? { background: 'rgba(255,255,255,0.06)' } : {}}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isSendingMsg && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-lg bg-emerald-900/50 border border-emerald-700/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                </div>
                <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm text-xs border border-white/10 flex items-center gap-1.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatMessagesEndRef} />
          </div>

          <div className="px-4 pb-2 shrink-0">
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                'How do fractional tokens work?',
                'What APY can I expect?',
                'How is rent paid on-chain?',
              ].map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s)}
                  className="whitespace-nowrap text-[10px] font-mono px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all cursor-pointer shrink-0"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 pb-4 shrink-0">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <input
                type="text"
                placeholder="Ask about blockchain real estate..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                className="flex-1 bg-transparent text-xs text-white placeholder-white/30 focus:outline-none"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isSendingMsg || !chatInput.trim()}
                className="w-7 h-7 rounded-lg bg-white disabled:bg-white/20 flex items-center justify-center shrink-0 cursor-pointer transition-colors hover:bg-gray-100 disabled:cursor-not-allowed"
              >
                <Send className="w-3 h-3 text-black" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TXN RECEIPT ── */}
      {txnReceipt && (
        <div className="fixed bottom-6 left-6 z-50 max-w-xs bg-black/95 border border-white/15 rounded-xl p-4 shadow-2xl font-mono text-xs backdrop-blur">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
            <span className="text-white/50 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${txnReceipt.status === 'success' ? 'bg-emerald-400' : 'bg-yellow-400 animate-pulse'}`} />
              BLOCKCHAIN TX
            </span>
            <button onClick={() => setTxnReceipt(null)} className="text-white/30 hover:text-white">
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between gap-2"><span className="text-white/40">ACTION</span><span className="text-white truncate max-w-[160px] text-right">{txnReceipt.action}</span></div>
            <div className="flex justify-between gap-2"><span className="text-white/40">HASH</span><span className="text-emerald-400 truncate max-w-[160px]">{txnReceipt.hash}</span></div>
            <div className="flex justify-between gap-2"><span className="text-white/40">BLOCK</span><span className="text-white">#{txnReceipt.block}</span></div>
            <div className="flex justify-between gap-2"><span className="text-white/40">STATUS</span>
              <span className={txnReceipt.status === 'success' ? 'text-emerald-400 font-bold' : 'text-yellow-400 animate-pulse'}>
                {txnReceipt.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
