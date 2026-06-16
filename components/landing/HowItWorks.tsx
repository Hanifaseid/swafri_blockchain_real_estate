'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Building2, ArrowRight } from 'lucide-react';
import FadeIn from '@/components/FadeIn';

const TENANT_STEPS = [
  {
    step: '01',
    title: 'Browse Verified Listings',
    desc: 'Find deed-verified apartments, villas, offices and studios with full ownership history on-chain.',
  },
  {
    step: '02',
    title: 'Transparent Rental Agreements',
    desc: 'Sign smart contract leases directly. All terms are immutable, visible, and enforceable on-chain.',
  },
  {
    step: '03',
    title: 'Secure Payments via Escrow',
    desc: 'Pay rent through multisig escrow. Funds release automatically at contract milestones — no disputes.',
  },
  {
    step: '04',
    title: 'Buy Fractional Ownership',
    desc: 'Own a share of any property starting from $85 USDC. Earn proportional rental yield every month.',
  },
];

const OWNER_STEPS = [
  {
    step: '01',
    title: 'Submit Your Property',
    desc: 'Upload deed documents, photos, and ownership certificates. Our admin team verifies every listing.',
  },
  {
    step: '02',
    title: 'Verify Ownership On-Chain',
    desc: 'Once approved, your deed is hashed and anchored as an ERC-1155 digital title certificate.',
  },
  {
    step: '03',
    title: 'Tokenize & Raise Capital',
    desc: 'Divide your property into fractional tokens. Raise capital from global investors in under 24 hours.',
  },
  {
    step: '04',
    title: 'Connect with Trusted Tenants',
    desc: 'Manage tenant inquiries, track occupancy, and receive rent automatically through smart escrow.',
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works-section"
      className="py-24 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto z-10 relative"
    >
      <FadeIn delay={0} duration={600}>
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 mb-3 block">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight">
            For Tenants &amp; Property Owners
          </h2>
        </div>
      </FadeIn>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Tenant side */}
        <FadeIn delay={0} duration={600}>
          <div className="liquid-glass border border-white/15 rounded-2xl p-8 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-900/40 border border-emerald-800/40 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                  For Tenants
                </div>
                <h3 className="text-lg font-semibold text-white">Rent or Invest in Property</h3>
              </div>
            </div>
            <div className="space-y-4">
              {TENANT_STEPS.map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="text-[11px] font-mono text-emerald-400 font-bold w-6 shrink-0 pt-0.5">
                    {item.step}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{item.title}</div>
                    <div className="text-xs text-white/50 font-light mt-0.5 leading-relaxed">
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/auth"
              className="mt-8 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
            >
              Find a Property <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>

        {/* Owner side */}
        <FadeIn delay={150} duration={600}>
          <div className="liquid-glass border border-white/15 rounded-2xl p-8 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-900/40 border border-blue-800/40 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">
                  For Property Owners
                </div>
                <h3 className="text-lg font-semibold text-white">List, Verify &amp; Manage</h3>
              </div>
            </div>
            <div className="space-y-4">
              {OWNER_STEPS.map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="text-[11px] font-mono text-blue-400 font-bold w-6 shrink-0 pt-0.5">
                    {item.step}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{item.title}</div>
                    <div className="text-xs text-white/50 font-light mt-0.5 leading-relaxed">
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/auth"
              className="mt-8 w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
            >
              List Your Property <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
