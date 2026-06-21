"use client";

import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import Reveal from "./Reveal";

import HeroBackground from "./landing/HeroBackground";
import HeroSection from "./landing/HeroSection";
import PartnerMarquee from "./landing/PartnerMarquee";
import FeaturedProperties from "./landing/FeaturedProperties";
import PlatformFeatures from "./landing/PlatformFeatures";
import HowItWorks from "./landing/HowItWorks";
import Testimonials from "./landing/Testimonials";
import LandingCTA from "./landing/LandingCTA";
import AiChat from "./landing/AiChat";

const TRUST_POINTS = [
  "Ownership documents and listing evidence routed through review before publishing",
  "Digital title records anchor approved listing data and document hashes on-chain",
  "Lease escrow activity is visible from funding through release or dispute",
  "KYC, title actions, escrow events, and admin decisions remain traceable",
];

export default function LandingPage() {
  const [heroImgLoaded, setHeroImgLoaded] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const img = new Image();
    img.src =
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1920&q=75";
    img.onload = () => setHeroImgLoaded(true);
  }, []);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const onReady = () => setVideoReady(true);
    vid.addEventListener("canplaythrough", onReady, { once: true });
    vid.load();
    return () => vid.removeEventListener("canplaythrough", onReady);
  }, []);

  useEffect(() => {
    if (videoReady && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [videoReady]);

  return (
    <div className="relative min-h-screen font-sans text-white selection:bg-amber-300 selection:text-emerald-950">
      <HeroBackground
        videoReady={videoReady}
        heroImgLoaded={heroImgLoaded}
        videoRef={videoRef}
      />

      <HeroSection />
      <PartnerMarquee />
      <FeaturedProperties />
      <PlatformFeatures />
      <HowItWorks />

      <section className="relative left-1/2 z-20 w-screen -translate-x-1/2 overflow-hidden border-y border-white/10 py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <Reveal>
              <div className="mb-5 flex items-center gap-3">
                <span className="font-mono text-[11px] tracking-[0.28em] text-amber-300/85">
                  *
                </span>
                <span className="h-px w-8 rule-gold" />
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">
                  Verification Layer
                </span>
              </div>
              <h2 className="font-display text-3xl font-medium leading-[1.06] tracking-tight text-white md:text-5xl">
                Verify the record.
                <br className="hidden md:block" /> Then the keys.
              </h2>
              <div className="mt-6 max-w-xl space-y-4 text-sm font-light leading-relaxed text-white/60">
                <p>
                  EstateLedger connects listing discovery with the operational evidence
                  behind the property: KYC status, ownership documents, review
                  decisions, title records, and escrow activity.
                </p>
                <p>
                  Buyers and renters can inspect the property context before
                  they apply or make an offer. Owners submit listings and
                  documents from account workflows while admins handle review,
                  compliance, and transaction oversight.
                </p>
              </div>
              <ul className="mt-8 space-y-3">
                {TRUST_POINTS.map((point, i) => (
                  <Reveal
                    as="li"
                    key={point}
                    delay={i * 80}
                    className="flex items-start gap-3 text-sm text-white/75"
                  >
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
                    alt="Reviewed property record"
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-surface-base/70 to-transparent" />
                </div>

                <div className="absolute -bottom-5 -left-5 rounded-xl border border-emerald-400/30 bg-[#1d1812]/90 p-4 shadow-2xl backdrop-blur">
                  <div className="mb-1 font-mono text-[9px] uppercase tracking-widest text-white/40">
                    Title Workflow
                  </div>
                  <div className="font-mono text-sm font-bold text-emerald-300">
                    Review Ready
                  </div>
                  <div className="font-mono text-[10px] text-white/50">
                    EL-2026-0481 / Sepolia testnet
                  </div>
                </div>

                <div className="absolute -right-4 -top-4 flex items-center gap-2 rounded-xl border border-amber-400/30 bg-[#1d1812]/90 p-3 shadow-xl backdrop-blur">
                  <ShieldCheck className="h-4 w-4 text-amber-300" />
                  <div>
                    <div className="font-mono text-[9px] uppercase text-white/40">
                      Evidence Reviewed
                    </div>
                    <div className="font-mono text-[10px] font-bold text-white">
                      Digital Title Data
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Testimonials />
      <LandingCTA />
      <AiChat />
    </div>
  );
}
