'use client';

import React from 'react';
import { Activity } from 'lucide-react';
import { PARTNERS } from './data';

export default function PartnerMarquee() {
  return (
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
  );
}
