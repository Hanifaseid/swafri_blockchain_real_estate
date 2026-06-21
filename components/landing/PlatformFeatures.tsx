'use client';

import React from 'react';
import { FileCheck, Lock, ScrollText, ShieldCheck } from 'lucide-react';
import Reveal from '@/components/Reveal';
import SectionHeading from './SectionHeading';
import { FEATURES } from './data';

const ICON_MAP = {
  FileCheck,
  Lock,
  ShieldCheck,
  ScrollText,
} as const;

export default function PlatformFeatures() {
  return (
    <section
      id="features-section"
      className="relative left-1/2 z-20 w-screen -translate-x-1/2 overflow-hidden border-y border-white/10 py-24"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <SectionHeading
          index="02"
          kicker="Marketplace Core"
          align="center"
          title={<>Discovery, proof,<br className="hidden md:block" /> and oversight in one flow.</>}
          description="The platform connects map-based search, structured listing data, digital title records, lease escrow, and compliance review without adding extra marketplace roles."
        />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => {
            const Icon = ICON_MAP[f.iconName];
            const gold = f.color === 'gold';
            return (
              <Reveal key={f.title} delay={i * 90}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05]">
                  <span className="absolute right-4 top-4 font-mono text-[11px] tracking-widest text-white/20">
                    0{i + 1}
                  </span>
                  <div
                    className={[
                      'mb-5 flex h-12 w-12 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-105',
                      gold
                        ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
                        : 'border-emerald-400/25 bg-emerald-500/10 text-emerald-300',
                    ].join(' ')}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-medium text-white">{f.title}</h3>
                  <p className="text-[13px] font-light leading-relaxed text-white/55">{f.desc}</p>
                  <span
                    className={[
                      'absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100',
                      gold ? 'rule-gold' : 'bg-emerald-400/40',
                    ].join(' ')}
                  />
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
