'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Hash, Home, KeyRound, MapPin } from 'lucide-react';
import AnimatedHeading from '@/components/AnimatedHeading';
import FadeIn from '@/components/FadeIn';

/* Ledger figures — the real product story (verified listings + escrow + titles). */
const LEDGER = [
  { value: '12,400+', label: 'Verified Listings' },
  { value: '100%', label: 'Title-Anchored On-Chain' },
  { value: '24h', label: 'Avg. Verification' },
  { value: '30+', label: 'Countries' },
];

export default function HeroSection() {
  return (
    <section className="relative z-10 min-h-[92vh] flex items-center px-6 md:px-12 lg:px-16 pt-28 md:pt-24 pb-16">
      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        {/* ── Editorial column ───────────────────────────────────────────── */}
        <div className="lg:col-span-7">
          <FadeIn delay={0} duration={600}>
            <span className="inline-flex items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.22em] text-amber-300/90 mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Est. On-Chain
              <span className="w-8 h-px rule-gold" />
              Title Verified
            </span>
          </FadeIn>

          <AnimatedHeading
            text={"A verified title\nfor every home."}
            className="font-display text-[3.25rem] sm:text-6xl lg:text-7xl xl:text-[5.25rem] font-medium text-white leading-[0.98] mb-7"
            style={{ letterSpacing: '-0.025em' }}
          />

          <FadeIn delay={650} duration={700}>
            <p className="text-base md:text-lg text-white/70 max-w-xl leading-relaxed font-light mb-9">
              Every listing is identity-verified and its ownership document is anchored to a
              blockchain <span className="text-amber-200/90">certificate of title</span> — so you can
              rent or buy with escrow-protected deposits and proof you can check yourself.
            </p>
          </FadeIn>

          <FadeIn delay={900} duration={700}>
            <div className="flex flex-wrap items-center gap-4 mb-12">
              <Link
                href="/auth"
                className="group inline-flex items-center gap-2 bg-amber-500 text-emerald-950 px-7 py-3.5 rounded-xl font-semibold hover:bg-amber-400 transition-colors shadow-[0_8px_24px_-8px_rgba(189,139,39,0.7)]"
              >
                <Home className="w-4 h-4" />
                Explore Properties
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 border border-white/20 text-white px-7 py-3.5 rounded-xl font-medium hover:bg-white/5 hover:border-white/35 transition-colors"
              >
                <KeyRound className="w-4 h-4 text-amber-300" />
                List Your Property
              </Link>
            </div>
          </FadeIn>

          {/* Ledger strip */}
          <FadeIn delay={1100} duration={700}>
            <div className="grid grid-cols-2 sm:grid-cols-4 max-w-2xl border-t border-white/10 pt-6">
              {LEDGER.map((s, i) => (
                <div
                  key={s.label}
                  className={i > 0 ? 'sm:pl-5 sm:border-l border-white/10' : ''}
                >
                  <div className="font-display text-2xl md:text-3xl text-white tracking-tight">
                    {s.value}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-white/40 mt-1.5">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>

        {/* ── Certificate of Title (signature artifact) ───────────────────── */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <FadeIn delay={500} duration={900}>
            <div className="animate-cert-float">
              <CertificateOfTitle />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   CertificateOfTitle — a cream, engraved land-registry certificate.
   This is the one thing people remember: the on-chain title made tangible.
   ───────────────────────────────────────────────────────────────────────── */
function CertificateOfTitle() {
  return (
    <div className="cert grain w-[20rem] sm:w-[23rem] p-7 pt-6 rotate-2">
      <div className="relative z-[2] cert-guilloche -m-1 p-1">
        {/* Masthead */}
        <div className="text-center mb-4">
          <div className="text-[9px] font-mono uppercase tracking-[0.32em] text-[#9d6f22]">
            VEX Property Register
          </div>
          <div className="font-display text-2xl font-semibold text-[#2c2415] mt-1.5 leading-none">
            Certificate of Title
          </div>
          <div className="mx-auto mt-3 h-px w-24 bg-[#9d6f22]/40" />
        </div>

        {/* Property plate */}
        <div className="relative h-28 w-full overflow-hidden rounded-[3px] ring-1 ring-[#9d6f22]/30 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=70"
            alt="Certified property"
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3a2f1c]/40 to-transparent" />
          <div className="absolute bottom-1.5 left-2 text-[10px] font-medium text-white/95 drop-shadow">
            Côte d&apos;Azur Beachfront Villa
          </div>
        </div>

        {/* Registry fields */}
        <dl className="space-y-2 text-[#5a4a2e]">
          <Field icon={<Home className="w-3 h-3" />} label="Listing ID" value="VEX-2026-0481" />
          <Field icon={<MapPin className="w-3 h-3" />} label="Jurisdiction" value="Nice, France" />
          <Field
            icon={<Hash className="w-3 h-3" />}
            label="Document Hash"
            value="0x9f2c…a7e1"
            mono
          />
        </dl>

        {/* Status + seal */}
        <div className="mt-4 flex items-end justify-between">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700/12 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-700/25">
            <BadgeCheck className="w-3.5 h-3.5" />
            Title · Active
          </div>
          {/* Wax seal */}
          <div className="relative grid place-items-center w-12 h-12 rounded-full wax-seal text-emerald-950">
            <BadgeCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Signature line */}
        <div className="mt-4 pt-3 border-t border-[#9d6f22]/25 flex items-end justify-between">
          <div>
            <div className="font-display italic text-base text-[#2c2415] leading-none">
              Verified Registrar
            </div>
            <div className="text-[8px] font-mono uppercase tracking-[0.2em] text-[#9d6f22] mt-1.5">
              Issued 12 Jun 2026
            </div>
          </div>
          <div className="text-[8px] font-mono uppercase tracking-[0.2em] text-[#9d6f22] text-right">
            Block #8,302,114
          </div>
        </div>
      </div>

      {/* Rubber stamp */}
      <div className="animate-stamp pointer-events-none absolute -right-3 top-16 z-[3] -rotate-12">
        <div className="rounded-md border-2 border-emerald-700/70 px-2.5 py-1 text-emerald-800/80">
          <div className="text-[12px] font-mono font-bold tracking-[0.18em] leading-none">
            VERIFIED
          </div>
          <div className="text-[7px] font-mono tracking-[0.22em] text-center mt-0.5">ON-CHAIN</div>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <dt className="inline-flex items-center gap-1.5 text-[#9d6f22] uppercase tracking-wider text-[10px] font-mono">
        {icon}
        {label}
      </dt>
      <dd className={mono ? 'font-mono text-[#2c2415] font-medium' : 'text-[#2c2415] font-medium'}>
        {value}
      </dd>
    </div>
  );
}
