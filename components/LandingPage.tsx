'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { BadgeCheck, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import Reveal from './Reveal';

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

import { FEATURED_PROPERTIES, Property, generateVerificationReceipt } from './landing/data';

interface Receipt {
  hash: string;
  action: string;
  titleId: string;
  block: number;
  registrar: string;
  status: 'mining' | 'success';
}

const TRUST_POINTS = [
  'Ownership documents reviewed before any listing goes live',
  'Deposits & purchase funds held in audited on-chain escrow',
  'KYC identity verification for every counterparty',
  'Every mint, release, and dispute written to an auditable record',
];

export default function LandingPage() {
  const [properties] = useState<Property[]>(FEATURED_PROPERTIES);
  const [heroImgLoaded, setHeroImgLoaded] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  // Preload hero image
  useEffect(() => {
    const img = new Image();
    img.src =
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1920&q=75';
    img.onload = () => setHeroImgLoaded(true);
  }, []);

  // Background-load the hero video, only show once buffered
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const onReady = () => setVideoReady(true);
    vid.addEventListener('canplaythrough', onReady, { once: true });
    vid.load();
    return () => vid.removeEventListener('canplaythrough', onReady);
  }, []);

  useEffect(() => {
    if (videoReady && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [videoReady]);

  const handleVerify = (prop: Property) => {
    setReceipt({ ...generateVerificationReceipt(prop.titleId, `Title — ${prop.name}`), status: 'mining' });
    setTimeout(
      () => setReceipt((prev) => (prev ? { ...prev, status: 'success' } : null)),
      1700,
    );
  };

  return (
    <div className="relative min-h-screen font-sans text-white selection:bg-amber-300 selection:text-emerald-950">
      <HeroBackground videoReady={videoReady} heroImgLoaded={heroImgLoaded} videoRef={videoRef} />

      <LandingNavbar />
      <HeroSection />
      <PartnerMarquee />
      <FeaturedProperties properties={properties} onVerify={handleVerify} />
      <PlatformFeatures />
      <HowItWorks />

      {/* ── TRUST SPOTLIGHT ───────────────────────────────────────────────── */}
      <section className="relative z-20 overflow-hidden border-y border-white/10 py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <Reveal>
              <div className="mb-5 flex items-center gap-3">
                <span className="font-mono text-[11px] tracking-[0.28em] text-amber-300/85">✦</span>
                <span className="h-px w-8 rule-gold" />
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">
                  The Trust Layer
                </span>
              </div>
              <h2 className="font-display text-3xl font-medium leading-[1.06] tracking-tight text-white md:text-5xl">
                Proof first.<br className="hidden md:block" /> Then the keys.
              </h2>
              <div className="mt-6 max-w-xl space-y-4 text-sm font-light leading-relaxed text-white/60">
                <p>
                  Most platforms ask you to trust a listing. VEX asks you to verify it. Each property
                  is identity-checked and its ownership document is hashed and minted as a certificate
                  of title you can inspect on-chain.
                </p>
                <p>
                  Money never moves blindly: deposits and purchase funds sit in audited escrow and are
                  released only when both sides hit the agreed milestone.
                </p>
              </div>
              <ul className="mt-8 space-y-3">
                {TRUST_POINTS.map((point, i) => (
                  <Reveal as="li" key={point} delay={i * 80} className="flex items-start gap-3 text-sm text-white/75">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{point}</span>
                  </Reveal>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={150}>
              <div className="relative">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-white/15 shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=70"
                    alt="Verified property"
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-surface-base/70 to-transparent" />
                </div>

                {/* Floating: title minted */}
                <div className="absolute -bottom-5 -left-5 rounded-xl border border-emerald-400/30 bg-[#1d1812]/90 p-4 shadow-2xl backdrop-blur">
                  <div className="mb-1 font-mono text-[9px] uppercase tracking-widest text-white/40">
                    On-Chain Event
                  </div>
                  <div className="font-mono text-sm font-bold text-emerald-300">Title Minted</div>
                  <div className="font-mono text-[10px] text-white/50">VEX-2026-0481 · 2 min ago</div>
                </div>

                {/* Floating: verified */}
                <div className="absolute -right-4 -top-4 flex items-center gap-2 rounded-xl border border-amber-400/30 bg-[#1d1812]/90 p-3 shadow-xl backdrop-blur">
                  <ShieldCheck className="h-4 w-4 text-amber-300" />
                  <div>
                    <div className="font-mono text-[9px] uppercase text-white/40">Deed Verified</div>
                    <div className="font-mono text-[10px] font-bold text-white">Certificate of Title</div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Testimonials />
      <LandingCTA />

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-12 lg:px-16">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-[7px] bg-gradient-to-br from-amber-300 to-amber-600 font-display text-lg font-semibold leading-none text-emerald-950">
                  V
                </span>
                <span className="font-display text-xl font-semibold tracking-tight text-white">VEX</span>
              </div>
              <p className="mt-4 max-w-xs text-sm font-light leading-relaxed text-white/50">
                The property register — verified listings, on-chain titles, and escrow-protected
                rent and sale, in one place.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-medium text-emerald-200">
                <BadgeCheck className="h-3.5 w-3.5" /> Every listing title-verified
              </div>
            </div>

            <FooterCol
              title="Explore"
              links={[
                ['Properties', '#listings-section'],
                ['The Register', '#features-section'],
                ['How It Works', '#how-it-works-section'],
                ['Reviews', '#testimonials-section'],
              ]}
            />
            <FooterCol
              title="Company"
              links={[
                ['About', '/about'],
                ['Contact', '/contact'],
                ['Get Started', '/auth'],
              ]}
            />
            <FooterCol
              title="Legal"
              links={[
                ['Terms', '#'],
                ['Privacy', '#'],
                ['Compliance', '#'],
              ]}
            />
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 md:flex-row">
            <span className="font-mono text-[11px] uppercase tracking-widest text-white/30">
              © 2026 VEX Property Register
            </span>
            <div className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-wider text-white/30">
              <span>ERC-721 Titles</span>
              <span>On-Chain Escrow</span>
              <span>KYC Verified</span>
            </div>
          </div>
        </div>
      </footer>

      <AiChat />

      {/* ── VERIFICATION RECEIPT ──────────────────────────────────────────── */}
      {receipt && (
        <div className="fixed bottom-6 left-6 z-50 max-w-xs rounded-xl border border-amber-400/20 bg-[#14110c]/95 p-4 font-mono text-xs shadow-2xl backdrop-blur animate-fade-in">
          <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2">
            <span className="flex items-center gap-1.5 text-white/50">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  receipt.status === 'success' ? 'bg-emerald-400' : 'animate-pulse bg-amber-400'
                }`}
              />
              TITLE REGISTRY
            </span>
            <button onClick={() => setReceipt(null)} className="text-white/30 hover:text-white" aria-label="Dismiss">
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-1.5">
            <Row label="REF" value={receipt.action} truncate />
            <Row label="HASH" value={receipt.hash} valueClass="text-amber-300" truncate />
            <Row label="BLOCK" value={`#${receipt.block.toLocaleString()}`} />
            <Row label="REGISTRAR" value={receipt.registrar} truncate />
            <Row
              label="STATUS"
              value={receipt.status === 'success' ? 'VERIFIED ✓' : 'VERIFYING…'}
              valueClass={
                receipt.status === 'success'
                  ? 'text-emerald-400 font-bold'
                  : 'text-amber-400 animate-pulse'
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-amber-300/70">
        {title}
      </div>
      <ul className="space-y-2.5">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link
              href={href}
              className="text-sm text-white/55 transition-colors hover:text-white"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass = 'text-white',
  truncate,
}: {
  label: string;
  value: string;
  valueClass?: string;
  truncate?: boolean;
}) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-white/40">{label}</span>
      <span className={`${valueClass} ${truncate ? 'max-w-[160px] truncate text-right' : ''}`}>
        {value}
      </span>
    </div>
  );
}
