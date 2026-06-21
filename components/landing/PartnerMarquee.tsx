'use client';

import React from 'react';
import { PARTNERS } from './data';

export default function PartnerMarquee() {
  return (
    <section className="relative left-1/2 z-20 w-screen -translate-x-1/2 overflow-hidden border-y border-white/10 bg-black/20 py-7">
      <div className="mb-5 text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/35">
          Backed by trusted registries, custody & identity partners
        </span>
      </div>

      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-surface-base to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-surface-base to-transparent" />

      <div className="relative flex w-full items-center">
        <div className="animate-marquee flex gap-4">
          {[...PARTNERS, ...PARTNERS].map((partner, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 whitespace-nowrap rounded-full border border-white/10 bg-white/4 px-5 py-2"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400/80" />
              <span className="font-display text-sm text-white/90">{partner.name}</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-white/30">
                {partner.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
