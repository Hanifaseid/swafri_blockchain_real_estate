'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Key } from 'lucide-react';
import AnimatedHeading from '@/components/AnimatedHeading';
import FadeIn from '@/components/FadeIn';
import { STATS } from './data';

export default function HeroSection() {
  return (
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
            Secure, transparent property ownership through smart contracts. Buy fractional shares in
            verified real estate — from Zurich penthouses to Singapore commercial towers — starting
            at $85 USDC.
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
                <div className="text-[11px] text-white/45 tracking-wider uppercase mt-1 font-mono">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
