'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, X } from 'lucide-react';
import FadeIn from './FadeIn';

import HeroBackground from './landing/HeroBackground';
import LandingNavbar from './landing/LandingNavbar';
import HeroSection from './landing/HeroSection';
import PartnerMarquee from './landing/PartnerMarquee';
import FeaturedProperties from './landing/FeaturedProperties';
import PlatformFeatures from './landing/PlatformFeatures';
import HowItWorks from './landing/HowItWorks';
import Testimonials from './landing/Testimonials';
import LandingCTA from './landing/LandingCTA';
import AiChat from './landing/AiChat';

import { FEATURED_PROPERTIES, Property, generateMockTxnData } from './landing/data';

export default function LandingPage() {
  const [properties, setProperties] = useState<Property[]>(FEATURED_PROPERTIES);
  const [heroImgLoaded, setHeroImgLoaded] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Txn receipt
  const [txnReceipt, setTxnReceipt] = useState<{
    hash: string;
    action: string;
    gas: string;
    block: number;
    proof: string;
    status: 'success' | 'mining';
  } | null>(null);

  // Preload hero image so it shows instantly
  useEffect(() => {
    const img = new Image();
    img.src =
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1920&q=75';
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
      videoRef.current.play().catch(() => {
        /* silently ignore autoplay policy errors */
      });
    }
  }, [videoReady]);

  const triggerMockTxn = (actionText: string) => {
    const data = generateMockTxnData(actionText);
    setTxnReceipt({ ...data, status: 'mining' });
    setTimeout(
      () => setTxnReceipt((prev) => (prev ? { ...prev, status: 'success' } : null)),
      1800,
    );
  };

  const handleBuyTokens = (propId: string, qty: number) => {
    const target = properties.find((p) => p.id === propId);
    if (!target || target.tokensAvailable < qty) return;
    setProperties((cur) =>
      cur.map((p) => (p.id === propId ? { ...p, tokensAvailable: p.tokensAvailable - qty } : p)),
    );
    triggerMockTxn(`fractional buy of ${qty} token(s) — ${target.name}`);
  };

  return (
    <div className="min-h-screen text-white relative font-sans selection:bg-white selection:text-black">

      {/* ── HERO BACKGROUND ── */}
      <HeroBackground
        videoReady={videoReady}
        heroImgLoaded={heroImgLoaded}
        videoRef={videoRef}
      />

      {/* ── NAVBAR ── */}
      <LandingNavbar />

      {/* ── HERO SECTION ── */}
      <HeroSection />

      {/* ── PARTNER MARQUEE ── */}
      <PartnerMarquee />

      {/* ── FEATURED PROPERTIES ── */}
      <FeaturedProperties properties={properties} onBuyTokens={handleBuyTokens} />

      {/* ── PLATFORM FEATURES ── */}
      <PlatformFeatures />

      {/* ── HOW IT WORKS ── */}
      <HowItWorks />

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
                    VEX tokenizes premium real estate into ERC-1155 fractional assets, allowing
                    anyone to own a slice of a Zurich penthouse, a Singapore tower, or a Tokyo loft
                    — no brokers, no borders, no minimums.
                  </p>
                  <p>
                    Every property is cross-referenced with physical land registries. Deed hashes are
                    anchored on-chain and smart escrow contracts distribute rental yields to token
                    holders every 30 days — verified, auditable, unstoppable.
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
                  <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1">
                    Live Blockchain Tx
                  </div>
                  <div className="text-sm font-mono text-emerald-400 font-bold">+$22,400 USDC</div>
                  <div className="text-[10px] text-white/50 font-mono">
                    Rental yield distributed · 2 min ago
                  </div>
                </div>
                {/* Top right verified badge */}
                <div className="absolute -top-4 -right-4 liquid-glass border border-emerald-800/40 rounded-xl p-3 shadow-xl flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-[9px] font-mono text-white/40 uppercase">Deed Verified</div>
                    <div className="text-[10px] font-mono text-white font-bold">
                      ERC-1155 Certified
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <Testimonials />

      {/* ── CTA SECTION ── */}
      <LandingCTA />

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-white flex items-center justify-center text-black font-extrabold text-xs">
                V
              </div>
              <span className="font-mono text-xs text-white/40 uppercase tracking-widest">
                VEX Real Estate Ledger Inc.
              </span>
            </div>
            <div className="flex items-center gap-6 font-mono text-[11px] text-white/35">
              <span>ERC-1155 Tokenization</span>
              <span>zkSync Layer-2</span>
              <span>Smart Escrow</span>
            </div>
            <div className="font-mono text-[11px] text-white/30">
              © 2026 VEX // Blockchain Real Estate Platform
            </div>
          </div>
        </div>
      </footer>

      {/* ── AI CHAT ── */}
      <AiChat />

      {/* ── TXN RECEIPT ── */}
      {txnReceipt && (
        <div className="fixed bottom-6 left-6 z-50 max-w-xs bg-black/95 border border-white/15 rounded-xl p-4 shadow-2xl font-mono text-xs backdrop-blur">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
            <span className="text-white/50 flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  txnReceipt.status === 'success'
                    ? 'bg-emerald-400'
                    : 'bg-yellow-400 animate-pulse'
                }`}
              />
              BLOCKCHAIN TX
            </span>
            <button
              onClick={() => setTxnReceipt(null)}
              className="text-white/30 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between gap-2">
              <span className="text-white/40">ACTION</span>
              <span className="text-white truncate max-w-[160px] text-right">
                {txnReceipt.action}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-white/40">HASH</span>
              <span className="text-emerald-400 truncate max-w-[160px]">{txnReceipt.hash}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-white/40">BLOCK</span>
              <span className="text-white">#{txnReceipt.block}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-white/40">STATUS</span>
              <span
                className={
                  txnReceipt.status === 'success'
                    ? 'text-emerald-400 font-bold'
                    : 'text-yellow-400 animate-pulse'
                }
              >
                {txnReceipt.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
