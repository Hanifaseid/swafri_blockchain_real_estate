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
  MessageSquare,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import AnimatedHeading from './AnimatedHeading';
import FadeIn from './FadeIn';

// Define static real estate blockchain listings
interface Property {
  id: string;
  name: string;
  location: string;
  tokenPrice: number;
  tokensAvailable: number;
  totalTokens: number;
  apy: number;
  category: 'Investing' | 'Building' | 'Advisory';
  image: string;
}

const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    name: 'VEX Obsidian Tower',
    location: 'Zurich, Switzerland',
    tokenPrice: 120,
    tokensAvailable: 1540,
    totalTokens: 2500,
    apy: 9.4,
    category: 'Building',
    image: 'https://picsum.photos/seed/obsidian/800/500',
  },
  {
    id: 'prop-2',
    name: 'VEX Sapphire Pavilion',
    location: 'Marina Bay, Singapore',
    tokenPrice: 85,
    tokensAvailable: 840,
    totalTokens: 1200,
    apy: 11.2,
    category: 'Investing',
    image: 'https://picsum.photos/seed/sapphire/800/500',
  },
  {
    id: 'prop-3',
    name: 'VEX Emerald Plaza',
    location: 'California, USA',
    tokenPrice: 250,
    tokensAvailable: 410,
    totalTokens: 800,
    apy: 8.7,
    category: 'Advisory',
    image: 'https://picsum.photos/seed/emerald/800/500',
  },
];

// Partner organizations for the infinite marquee
const PARTNERS = [
  { name: 'Sotheby\'s Realty', type: 'Premium Real Estate' },
  { name: 'Solana Labs', type: 'L1 Blockchain Network' },
  { name: 'Ethereum Foundation', type: 'Smart Contracts Standards' },
  { name: 'Coinbase Prime', type: 'Liquidity & Custody' },
  { name: 'BlackRock Real Estate', type: 'Institutional Assets' },
  { name: 'Andreessen Horowitz', type: 'Venture Capital' },
];

// Helper generators defined outside the React component to satisfy strict purity standards
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

const TESTIMONIALS = [
  {
    rating: 5,
    text: "VEX has completely revolutionized our family office investments. By switching from manual escrow processes to real-time zkSync smart contract transactions, our yields are compiled to the minute, letting us diversify without overhead.",
    author: "Elena Rostova",
    role: "Managing Director, AlpCapital",
    avatar: "ER"
  },
  {
    rating: 5,
    text: "Paying rent via MetaMask is incredibly fast. VEX Smart Rental takes care of the L2 transaction gas, and my landlord approves request tickets immediately because every maintenance action is transparently logged as an immutable smart lock status.",
    author: "Kenji Gauthier",
    role: "Tenant, Obsidian Suite 402",
    avatar: "KG"
  },
  {
    rating: 5,
    text: "We were skeptical of tokenization until we audited the real deeds. VEX holds legally integrated covenants corresponding directly to token values, meaning our blockchain holdings represent physical ownership fully enforceable by international courts.",
    author: "Marcus Jenkins",
    role: "Chief Legal, BlockTrust Real Estate",
    avatar: "MJ"
  },
  {
    rating: 5,
    text: "Listing our residential portfolio was seamless. The verification process is rigorous but highly professional. Once certified, we were able to raise $5M in fractional capital in under 24 hours.",
    author: "Sarah Jenkinson",
    role: "Development Lead, Apex Living",
    avatar: "SJ"
  },
  {
    rating: 5,
    text: "As an advisory advisor, the transparent on-chain energy and IoT tracking are stellar. Our international clients can view building performance stats and yield reports live in real-time.",
    author: "Amir Al-Dossari",
    role: "Sovereign Asset Consultant",
    avatar: "AA"
  },
  {
    rating: 5,
    text: "Fractional buying on VEX has allowed our investment club to access prime Swiss real estate. The legal transparency and instant USDC distribution completely eliminate international banking fees.",
    author: "Chloe Dubois",
    role: "Head of Club, Nexus Capital",
    avatar: "CD"
  }
];

export default function LandingPage() {
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);

  // Testimonials Carousel States
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

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

  // Property marketplace list states (buying)
  const [txnReceipt, setTxnReceipt] = useState<{
    hash: string;
    action: string;
    gas: string;
    block: number;
    proof: string;
    status: 'success' | 'mining';
  } | null>(null);

  // Buyer State
  const [buyerTokens, setBuyerTokens] = useState<{ [propId: string]: number }>({
    'prop-1': 10,
    'prop-2': 25,
  });

  // AI Assistant Drawer State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: 'Greetings. I am your VEX AI blockchain real estate advisor. Click a query helper or type yours to explore our zero-knowledge secured, high-yield fractional ecosystem.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  // Anchor refs for scrolling
  const listingsRef = useRef<HTMLDivElement>(null);

  // Handle generic transaction simulator popups
  const triggerMockTxn = (actionText: string) => {
    const data = generateMockTxnData(actionText);
    setTxnReceipt((prev) => ({ ...data, status: 'mining' }));

    setTimeout(() => {
      setTxnReceipt((prev) => (prev ? { ...prev, status: 'success' as const } : null));
    }, 1800);
  };

  // Chat message submit
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
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant' as const, content: 'Network connectivity timeout. Please verify API configuration.' },
      ]);
    } finally {
      setIsSendingMsg(false);
    }
  };

  // Buy fractional tokens
  const handleBuyTokens = (propId: string, qty: number) => {
    const target = properties.find((p) => p.id === propId);
    if (!target) return;

    if (target.tokensAvailable < qty) {
      alert('Insufficient fractional token supply left.');
      return;
    }

    // Deduct available on marketplace
    setProperties((current) =>
      current.map((p) => (p.id === propId ? { ...p, tokensAvailable: p.tokensAvailable - qty } : p))
    );

    // Add to buyer's portfolio
    setBuyerTokens((current) => ({
      ...current,
      [propId]: (current[propId] || 0) + qty,
    }));

    triggerMockTxn(`fractional buy of ${qty} tokens inside ${target.name}`);
  };

  return (
    <div className="min-h-screen text-white relative font-sans selection:bg-white selection:text-black">
            {/* 
        Full-Screen Video Background - Using iframe embed for better reliability
      */}
      <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        {/* YouTube embed as fallback - plays automatically without controls */}
        <iframe
          className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover transform -translate-x-1/2 -translate-y-1/2"
          src="https://www.youtube.com/embed/ZgZRDX9kU2Q?autoplay=1&loop=1&playlist=ZgZRDX9kU2Q&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&playsinline=1&enablejsapi=1"
          title="Background Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
        
        {/* Subtle overlay for text readability (optional, very light) */}
        <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
      </div>

      {/* NAVBAR */}
      <header className="px-6 md:px-12 lg:px-16 pt-6 relative z-50">
        <div className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-semibold tracking-tight text-white select-none">
              VEX
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm">
            <button
              onClick={() => document.getElementById('story-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-white hover:text-gray-300 transition-colors cursor-pointer"
            >
              Story
            </button>
            <button
              onClick={() => document.getElementById('listings-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-white hover:text-gray-300 transition-colors cursor-pointer"
            >
              Investing
            </button>
            <button
              onClick={() => document.getElementById('building-features-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-white hover:text-gray-300 transition-colors cursor-pointer"
            >
              Building
            </button>
            <button
              onClick={() => document.getElementById('testimonials-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-white hover:text-gray-300 transition-colors cursor-pointer"
            >
              Advisory
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/auth"
              className="text-white hover:text-gray-300 text-sm transition-colors cursor-pointer font-medium"
            >
              Portal
            </Link>
            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-white text-black hover:bg-gray-100 transition-colors px-6 py-2 rounded-lg text-sm font-medium cursor-pointer"
            >
              Start a Chat
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="flex-1 flex flex-col justify-end px-6 md:px-12 lg:px-16 pb-12 lg:pb-16 pt-12 relative z-10 hero-height-adjustment min-h-[85vh]">
        <div className="lg:grid lg:grid-cols-2 lg:items-end w-full gap-8">
          {/* Left Column: Heading, Subheading, Controls */}
          <div>
            <AnimatedHeading
              text={"Shaping tomorrow\nwith vision and action."}
              className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-normal mb-4 text-white"
              style={{ letterSpacing: '-0.04em' }}
            />

            <FadeIn delay={800} duration={1000}>
              <p className="text-base md:text-lg text-gray-300 mb-5 max-w-xl">
                We back visionaries and craft ventures that define what comes next.
              </p>
            </FadeIn>

            <FadeIn delay={1200} duration={1000}>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Start a Chat
                </button>

                <button
                  onClick={() => document.getElementById('listings-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition-colors cursor-pointer"
                >
                  Explore Now
                </button>
              </div>
            </FadeIn>
          </div>

          {/* Right Column: Custom Glass Tag */}
          <div className="flex items-end justify-start lg:justify-end mt-8 lg:mt-0">
            <FadeIn delay={1400} duration={1000}>
              <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl">
                <span className="text-lg md:text-xl lg:text-2xl font-light text-white select-none">
                  Investing. Building. Advisory.
                </span>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* INFINITE MARQUEE TICKER OF WORKED ORGANIZATIONS */}
      <section className="py-10 bg-transparent overflow-hidden border-y border-white/10 z-20 relative">
        <div className="relative w-full flex items-center">
          <div className="animate-marquee flex gap-12 text-sm text-white font-mono uppercase tracking-widest">
            {/* Render Twice to allow infinite seamless marquee scroll */}
            {[...PARTNERS, ...PARTNERS].map((partner, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2.5 rounded-full whitespace-nowrap">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="font-semibold text-white">{partner.name}</span>
                <span className="text-white/40 text-xs">{"//"} {partner.type}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ARCHITECTURE STORY (ABOUT US) */}
      <section id="story-section" className="py-24 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto z-10 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-white mb-2 block bg-white/10 px-3 py-1 rounded-full w-fit">
              Story: Pure Transparency
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal text-white uppercase tracking-tight mb-6">
              Our Visionary Blueprint
            </h2>
            <div className="space-y-4 text-gray-300 font-light leading-relaxed text-base md:text-lg">
              <p>
                Traditional real-estate is bottlenecked by gatekeepers, paper contracts, and high capital thresholds. VEX was structured to forge an uncompromising path. We build zero-compromise architectural structures, underwritten by auditable Rust and Solidity protocols.
              </p>
              <p>
                By dividing legendary real estate assets into fractional, secure, high-yield ERC-1155 smart tokens, our network allows anyone to immediately invest, secure payouts quarterly, or exit with a single click. No banks. No high broker commissions.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
              <div>
                <div className="text-2xl md:text-3xl font-extralight text-white font-mono">$1.4B+</div>
                <div className="text-xs text-white/50 tracking-wider">LOCKED IN SMART CONTRACTS</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-extralight text-white font-mono">0.05s</div>
                <div className="text-xs text-white/50 tracking-wider">BLOCK SETTLEMENT TIMER</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-extralight text-white font-mono">100%</div>
                <div className="text-xs text-white/50 tracking-wider">AUDITED ETHEREUM & SOL REGISTER</div>
              </div>
            </div>
          </div>

          <div className="space-y-4 relative">
            <div className="liquid-glass border border-white/20 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Coins className="w-8 h-8 text-emerald-400" />
                <span className="font-mono text-sm tracking-widest text-emerald-300">BLOCKCHAIN GATEWAYS</span>
              </div>
              <h3 className="text-xl font-normal text-white mb-2">Automated Token Yield Distributed</h3>
              <p className="text-sm text-gray-300 font-light">
                Secure multisig smart wallets directly escrow monthly rental pool deposits. Rent collected is algorithmically distributed straight to tokenized buyers on zkSync and Polygon Mainnets, giving instant verifiable yield.
              </p>
            </div>

            <div className="liquid-glass border border-white/20 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-8 h-8 text-white" />
                <span className="font-mono text-sm tracking-widest text-gray-300">TRUSTLESS REGISTRIES</span>
              </div>
              <h3 className="text-xl font-normal text-white mb-2">Immutable Real Estate Title</h3>
              <p className="text-sm text-gray-300 font-light">
                Property deeds are cross-referenced with local land registries, digitizing raw metadata on an immutable, auditable decentralized node ledger. Never verify ownership of premium assets manually again.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SPECIFICATIONS */}
      <section id="building-features-section" className="py-24 bg-transparent relative border-y border-white/10 z-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-300 bg-emerald-950/40 px-3 py-1 rounded-full">
              Platform Features
            </span>
            <h2 className="text-3xl md:text-4xl font-normal text-white uppercase tracking-tight mt-3">
              Designed for Speed. Built for Integrity.
            </h2>
            <p className="text-sm text-gray-400 mt-3 font-light">
              Experience the supreme luxury real estate tech stack with instant yield, real-time IoT controls, and auditable ledger actions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="liquid-glass border border-white/10 rounded-xl p-6 hover:border-white/30 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-105 transition-all">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Solidity smart contracts</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                Fully open-source property custody. Automated payouts with zero human intervention.
              </p>
            </div>

            <div className="liquid-glass border border-white/10 rounded-xl p-6 hover:border-white/30 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-105 transition-all">
                <Building2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Verified Real Deed Pools</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                Contracts are legally tied directly to physical deeds with real-world custody entities.
              </p>
            </div>

            <div className="liquid-glass border border-white/10 rounded-xl p-6 hover:border-white/30 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-105 transition-all">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Zero Gas Cost Rent Pools</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                Payments processed on highly optimized Layer-2 chains, keeping gas fees completely negligible.
              </p>
            </div>

            <div className="liquid-glass border border-white/10 rounded-xl p-6 hover:border-white/30 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-105 transition-all">
                <Coins className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Realtime Energy IoT</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                Every VEX building updates power and utility consumption dynamically to our oracle registry feed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FRACTIONAL PROPERTIES MARKETPLACE */}
      <section id="listings-section" ref={listingsRef} className="py-24 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto z-10 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-300">
              Active Marketplace
            </span>
            <h2 className="text-3xl md:text-4xl font-normal text-white uppercase tracking-tight mt-1">
              Tokenized Elite Properties
            </h2>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0 font-mono text-xs overflow-x-auto pb-2">
            {['All Assets', 'Investing', 'Building', 'Advisory'].map((cat, i) => (
              <button
                key={i}
                className="bg-white/5 border border-white/10 hover:border-white/30 transition-all px-4 py-2 rounded-lg cursor-pointer text-white"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {properties.map((prop) => (
            <div
              key={prop.id}
              className="liquid-glass border border-white/15 rounded-2xl overflow-hidden group shadow-xl flex flex-col justify-between"
            >
              {/* Image & Price Tag */}
              <div className="relative h-60 w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={prop.image}
                  alt={prop.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute top-4 right-4 bg-black/80 px-4 py-2 rounded-xl text-sm font-semibold tracking-tight border border-white/10 flex items-center gap-1.5 backdrop-blur">
                  <Coins className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>${prop.tokenPrice} USDC</span>
                </div>
                <div className="absolute bottom-4 left-4 bg-zinc-950/90 text-emerald-300 font-mono text-xs px-3 py-1.5 rounded-lg border border-emerald-900/40 backdrop-blur">
                  APY {prop.apy}% Yield
                </div>
              </div>

              {/* Information Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-normal text-white mb-1">{prop.name}</h3>
                  <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-white" />
                    <span>{prop.location}</span>
                  </p>

                  <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl mb-6">
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                      <span>Fractional Tokens Sold</span>
                      <span>{prop.totalTokens - prop.tokensAvailable} / {prop.totalTokens}</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${((prop.totalTokens - prop.tokensAvailable) / prop.totalTokens) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleBuyTokens(prop.id, 1)}
                    className="flex-1 bg-white hover:bg-white/95 text-black text-xs font-semibold py-3 px-4 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Buy 1 Token</span>
                  </button>
                  <button
                    onClick={() => handleBuyTokens(prop.id, 10)}
                    className="liquid-glass border border-white/20 hover:bg-white hover:text-black transition-all text-xs font-semibold py-3 px-4 rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Buy 10</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* REVOLVING TRUST MATRIX (TESTIMONIALS LOOP) */}
      <section id="testimonials-section" className="py-24 bg-transparent relative border-t border-white/15 z-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                Global Endorsements
              </span>
              <h2 className="text-3xl md:text-4xl font-normal text-white uppercase tracking-tight mt-2">
                The Real Estate Ledger Vanguard
              </h2>
            </div>
            
            {/* Slider controls */}
            <div className="flex items-center gap-3 bg-zinc-950/35 p-1 rounded-full border border-white/10">
              <button
                onClick={handlePrevTestimonial}
                className="w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 z-20"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5 text-emerald-400" />
              </button>
              <button
                onClick={handleNextTestimonial}
                className="w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 z-20"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5 text-emerald-400" />
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden w-full">
            <div
              className="flex gap-6 transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentTestimonialIndex * (isMobile ? 100 : 33.3333)}%)`
              }}
            >
              {TESTIMONIALS.map((t, idx) => (
                <div
                  key={idx}
                  className="liquid-glass border border-white/10 rounded-2xl p-6.5 shadow-xl flex flex-col justify-between shrink-0 w-full md:w-[calc(33.3333%-16px)]"
                >
                  <div>
                    <div className="flex items-center gap-1 mb-4 text-emerald-400">
                      {[...Array(t.rating)].map((_, i) => (
                        <Sparkles key={i} className="w-4 h-4 fill-emerald-400 animate-pulse" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-200 leading-relaxed font-light mb-6">
                      &quot;{t.text}&quot;
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-sm shrink-0">
                      {t.avatar}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">{t.author}</h4>
                      <p className="text-[11px] text-gray-400 uppercase font-mono truncate">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 px-6 md:px-12 lg:px-16 max-w-5xl mx-auto z-10 relative">
        <div className="liquid-glass border border-white/20 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -z-10" />
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/50 border border-emerald-900/40 px-3 py-1.5 rounded-full select-none">
            DEPLOY PORTAL SECURE NODE
          </span>
          <h3 className="text-2xl md:text-3xl font-light uppercase tracking-tight text-white mt-6 mb-4">
            Ready to Enter the Sovereign Ledger?
          </h3>
          <p className="text-xs md:text-sm text-gray-300 max-w-xl mx-auto mb-8 font-light leading-relaxed">
            Unlock instant tenant services, real-time energy IoT controls, fractionized estate tokens, and fully auditable secure compliance registers today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth"
              className="bg-white hover:bg-neutral-100 text-black px-8 py-4 rounded-xl text-xs font-bold font-mono tracking-widest uppercase transition-all shadow-lg active:scale-95"
            >
              Enter Sovereign Portal
            </Link>
            <button
              onClick={() => setIsChatOpen(true)}
              className="liquid-glass border border-white/20 hover:bg-white hover:text-black hover:border-white text-white px-8 py-4 rounded-xl text-xs font-bold font-mono tracking-widest uppercase transition-all shadow-lg active:scale-95"
            >
              Consult AI Advisor
            </button>
          </div>
        </div>
      </section>

      {/* RETAINING EXTRA ACCENTS (No unsolicited footer margins) */}
      <footer className="border-t border-white/10 bg-transparent py-12 relative z-10 font-mono text-xs text-white/40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white flex items-center justify-center text-black font-extrabold text-xs">
              V
            </div>
            <span>VEX REAL ESTATE LEDGER INC.</span>
          </div>
          <div className="flex items-center gap-8">
            <span className="hover:text-white cursor-pointer transition-colors">ZK-SCHEMAS v1.19</span>
            <span className="hover:text-white cursor-pointer transition-colors">SECURITY ENVELOPE</span>
            <span className="hover:text-white cursor-pointer transition-colors">SOLANA LABS SYNC</span>
          </div>
          <div>
            <span>© 2026 VEX // TRIPLE-SECURED SYSTEM</span>
          </div>
        </div>
      </footer>

      {/* IMMERSIVE AI ASSISTANT DRAWER PANEL */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsChatOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
          />

          {/* Drawer Inner Content */}
          <div className="w-full max-w-md bg-zinc-950 border-l border-white/20 h-full relative z-10 flex flex-col justify-between shadow-2xl">
            {/* Drawer Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                <div>
                  <h3 className="text-base font-normal tracking-tight">VEX Real Estate AI Assistant</h3>
                  <p className="text-[10px] font-mono text-emerald-300 uppercase">Solidity & Rust Expert</p>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 cursor-pointer"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Chat message loops */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border leading-relaxed ${
                    msg.role === 'assistant'
                      ? 'bg-white/5 border-white/15 text-white'
                      : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                  }`}
                >
                  <span className="block text-[9px] uppercase font-bold tracking-widest text-white/50 mb-1">
                    {msg.role === 'assistant' ? '✦ VEX INTELIGENCE PROTOCOL' : '✦ USER ACCREDITATION AUTHOR'}
                  </span>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              ))}

              {isSendingMsg && (
                <div className="p-4 rounded-xl border bg-white/5 border-white/15 text-white animate-pulse flex items-center gap-2">
                  <Activity className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>DECRYPTING CRYPTO FEEDBACK...</span>
                </div>
              )}
            </div>

            {/* Prompt Helper Buttons */}
            <div className="px-6 py-2 border-t border-white/10 bg-black/40">
              <span className="block text-[9px] font-mono uppercase tracking-widest text-white/40 mb-2">Query Helpers:</span>
              <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                {[
                  'Explain token price and APY stability',
                  'How do renters pay rent on Solana?',
                  'Define zk-SNARK deeds',
                ].map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(s)}
                    className="bg-white/5 hover:bg-white/15 text-white/80 border border-white/10 px-2.5 py-1.5 rounded-lg text-left cursor-pointer transition-all truncate max-w-[240px]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Message input space */}
            <div className="p-6 border-t border-white/10 bg-black/70 flex gap-2">
              <input
                type="text"
                placeholder="Ask about smart rental structures..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                className="bg-zinc-950 text-xs border border-white/20 rounded-lg px-4 py-3 flex-1 focus:outline-none focus:border-white text-white font-mono"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isSendingMsg}
                className="bg-white text-black hover:bg-gray-100 transition-colors px-4 rounded-lg cursor-pointer flex items-center justify-center shadow"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Secure transaction simulation receipts */}
      {txnReceipt && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-neutral-950/95 border border-white/15 rounded-xl p-4 shadow-2xl font-mono text-xs backdrop-blur">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
            <span className="text-white/60">✦ BLOCKCHAIN REGISTER</span>
            <button onClick={() => setTxnReceipt(null)} className="text-white/40 hover:text-white">
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-white/50">ACTION:</span>
              <span className="text-white font-bold">{txnReceipt.action}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">HASH:</span>
              <span className="text-emerald-400 text-right truncate w-40">{txnReceipt.hash}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">BLOCK:</span>
              <span className="text-white">{txnReceipt.block}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">GAS:</span>
              <span className="text-white">{txnReceipt.gas}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">PROOF:</span>
              <span className="text-white text-right truncate w-40">{txnReceipt.proof}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">STATUS:</span>
              <span className={`${txnReceipt.status === 'success' ? 'text-emerald-400' : 'text-yellow-400 animate-pulse'}`}>
                {txnReceipt.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
