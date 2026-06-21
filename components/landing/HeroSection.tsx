'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Hash,
  Home,
  KeyRound,
  LayoutDashboard,
  MapPin,
  Plus,
} from 'lucide-react';
import AnimatedHeading from '@/components/AnimatedHeading';
import FadeIn from '@/components/FadeIn';
import { useAuthStore } from '@/stores/auth.store';

const LEDGER = [
  { value: 'Map', label: 'Spatial Discovery' },
  { value: 'ERC-721', label: 'Digital Title Records' },
  { value: 'Escrow', label: 'Lease Protection' },
  { value: 'KYC', label: 'Compliance Review' },
];

export default function HeroSection() {
  const { currentUser } = useAuthStore();
  const role = currentUser?.role;
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const isOwner = role === 'PROPERTY_OWNER';
  const isTenant = role === 'TENANT';

  const secondaryCta = isTenant
    ? null
    : isOwner
      ? { href: '/account/listings/new', label: 'List Your Property', icon: Plus }
      : isAdmin
        ? { href: '/admin/dashboard', label: 'Go to Dashboard', icon: LayoutDashboard }
        : { href: '/auth/login', label: 'List Your Property', icon: KeyRound };

  return (
    <section className="relative z-10 flex min-h-[85vh] items-center pb-16 pt-10">
      <div className="grid w-full items-center gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <FadeIn delay={0} duration={600}>
            <span className="mb-7 inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-amber-300/90">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
              Web3 Real Estate
              <span className="rule-gold h-px w-8" />
              Verified Listings
            </span>
          </FadeIn>

          <AnimatedHeading
            text={'Find property\nwith proof built in.'}
            className="mb-7 font-display text-[3.25rem] font-medium leading-[0.98] text-white sm:text-6xl lg:text-7xl xl:text-[5.25rem]"
          />

          <FadeIn delay={650} duration={700}>
            <p className="mb-9 max-w-xl text-base font-light leading-relaxed text-white/70 md:text-lg">
              Discover homes and commercial spaces on a map-first marketplace where ownership
              documents, KYC review, digital title records, and lease escrow are connected in one
              transparent transaction flow.
            </p>
          </FadeIn>

          <FadeIn delay={900} duration={700}>
            <div className="mb-12 flex flex-wrap items-center gap-4">
              <Link
                href="/discovery"
                className="group inline-flex items-center gap-2 rounded-xl bg-amber-500 px-7 py-3.5 font-semibold text-emerald-950 shadow-[0_8px_24px_-8px_rgba(189,139,39,0.7)] transition-colors hover:bg-amber-400"
              >
                <Home className="h-4 w-4" />
                Explore the Map
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              {secondaryCta && (() => {
                const Icon = secondaryCta.icon;
                return (
                  <Link
                    href={secondaryCta.href}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-7 py-3.5 font-medium text-white transition-colors hover:border-white/35 hover:bg-white/5"
                  >
                    <Icon className="h-4 w-4 text-amber-300" />
                    {secondaryCta.label}
                  </Link>
                );
              })()}
            </div>
          </FadeIn>

          <FadeIn delay={1100} duration={700}>
            <div className="grid max-w-2xl grid-cols-2 border-t border-white/10 pt-6 sm:grid-cols-4">
              {LEDGER.map((s, i) => (
                <div key={s.label} className={i > 0 ? 'border-white/10 sm:border-l sm:pl-5' : ''}>
                  <div className="font-display text-2xl tracking-tight text-white md:text-3xl">
                    {s.value}
                  </div>
                  <div className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-white/40">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>

        <div className="flex justify-center lg:col-span-5 lg:justify-end">
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

function CertificateOfTitle() {
  return (
    <div className="cert grain w-[20rem] rotate-2 p-7 pt-6 sm:w-[23rem]">
      <div className="cert-guilloche relative z-[2] -m-1 p-1">
        <div className="mb-4 text-center">
          <div className="font-mono text-[9px] uppercase tracking-[0.32em] text-[#9d6f22]">
            VEX Property Register
          </div>
          <div className="mt-1.5 font-display text-2xl font-semibold leading-none text-[#2c2415]">
            Title Review Record
          </div>
          <div className="mx-auto mt-3 h-px w-24 bg-[#9d6f22]/40" />
        </div>

        <div className="relative mb-4 h-28 w-full overflow-hidden rounded-[3px] ring-1 ring-[#9d6f22]/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=70"
            alt="Reviewed property"
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3a2f1c]/40 to-transparent" />
          <div className="absolute bottom-1.5 left-2 text-[10px] font-medium text-white/95 drop-shadow">
            Verified Coastal Residence
          </div>
        </div>

        <dl className="space-y-2 text-[#5a4a2e]">
          <Field icon={<Home className="h-3 w-3" />} label="Listing ID" value="VEX-2026-0481" />
          <Field icon={<MapPin className="h-3 w-3" />} label="Location" value="Verified Address" />
          <Field icon={<Hash className="h-3 w-3" />} label="Document Hash" value="0x9f2c...a7e1" mono />
        </dl>

        <div className="mt-4 flex items-end justify-between">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700/12 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-700/25">
            <BadgeCheck className="h-3.5 w-3.5" />
            Title Review Ready
          </div>
          <div className="wax-seal relative grid h-12 w-12 place-items-center rounded-full text-emerald-950">
            <BadgeCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-[#9d6f22]/25 pt-3">
          <div>
            <div className="font-display text-base italic leading-none text-[#2c2415]">
              Platform Review
            </div>
            <div className="mt-1.5 font-mono text-[8px] uppercase tracking-[0.2em] text-[#9d6f22]">
              Ready for minting
            </div>
          </div>
          <div className="text-right font-mono text-[8px] uppercase tracking-[0.2em] text-[#9d6f22]">
            Sepolia testnet
          </div>
        </div>
      </div>

      <div className="animate-stamp pointer-events-none absolute -right-3 top-16 z-[3] -rotate-12">
        <div className="rounded-md border-2 border-emerald-700/70 px-2.5 py-1 text-emerald-800/80">
          <div className="font-mono text-[12px] font-bold leading-none tracking-[0.18em]">
            REVIEWED
          </div>
          <div className="mt-0.5 text-center font-mono text-[7px] tracking-[0.22em]">
            TITLE DATA
          </div>
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
      <dt className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#9d6f22]">
        {icon}
        {label}
      </dt>
      <dd className={mono ? 'font-mono font-medium text-[#2c2415]' : 'font-medium text-[#2c2415]'}>
        {value}
      </dd>
    </div>
  );
}
