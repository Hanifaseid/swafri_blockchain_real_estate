'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Key } from 'lucide-react';

export default function LandingCTA() {
  return (
    <section className="py-20 px-6 md:px-12 lg:px-16 max-w-5xl mx-auto z-10 relative">
      <div className="liquid-glass border border-white/20 rounded-3xl p-10 md:p-14 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/8 rounded-full blur-[100px] -z-10 pointer-events-none" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/50 border border-emerald-900/40 px-3 py-1.5 rounded-full">
          Start Today — No Minimum Investment
        </span>
        <h3 className="text-2xl md:text-4xl font-light text-white mt-6 mb-4 tracking-tight">
          Secure the Future of Real Estate
          <br />
          with Blockchain Ownership
        </h3>
        <p className="text-sm text-white/55 max-w-xl mx-auto mb-8 font-light leading-relaxed">
          Get instant access to deed-verified fractional properties, on-chain rental yields, smart
          lease contracts, and a fully auditable blockchain ownership registry — all from one
          platform.
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
  );
}
