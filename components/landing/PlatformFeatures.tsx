'use client';

import React from 'react';
import { FileCheck, Lock, ShieldCheck, TrendingUp } from 'lucide-react';
import FadeIn from '@/components/FadeIn';
import { FEATURES } from './data';

const ICON_MAP = {
  FileCheck: FileCheck,
  Lock: Lock,
  ShieldCheck: ShieldCheck,
  TrendingUp: TrendingUp,
} as const;

export default function PlatformFeatures() {
  return (
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
              From fractional deed tokenization to smart lease automation — every feature is
              engineered around verified, on-chain property ownership.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = ICON_MAP[f.iconName];
            const iconColorClass =
              f.color === 'emerald' ? 'text-emerald-400' : 'text-white';
            return (
              <FadeIn key={i} delay={i * 100} duration={600}>
                <div className="liquid-glass border border-white/10 rounded-2xl p-6 hover:border-white/25 transition-all group h-full">
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                    <Icon className={`w-6 h-6 ${iconColorClass}`} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-xs text-white/50 leading-relaxed font-light">{f.desc}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
