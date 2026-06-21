'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Home, KeyRound, LayoutDashboard, Plus } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { useAuthStore } from '@/stores/auth.store';

export default function LandingCTA() {
  const { currentUser } = useAuthStore();
  const role = currentUser?.role;
  const isAdmin  = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const isOwner  = role === 'PROPERTY_OWNER';
  const isTenant = role === 'TENANT';

  // Secondary CTA — null hides the button (tenants)
  const secondaryCta = isTenant ? null
    : isOwner  ? { href: '/account/listings/new', label: 'List Your Property', icon: Plus }
    : isAdmin  ? { href: '/admin/dashboard',      label: 'Go to Dashboard',    icon: LayoutDashboard }
    :            { href: '/auth/login',            label: 'List Your Property', icon: KeyRound };

  return (
    <section className="relative z-10 mx-auto max-w-5xl py-24">
      <Reveal>
        <div className="cert grain relative overflow-hidden rounded-2xl px-8 py-14 text-center md:px-16">
          <div className="relative z-[2]">
            <div className="mb-5 font-mono text-[10px] uppercase tracking-[0.3em] text-[#9d6f22]">
              VEX Property Register
            </div>
            <h3 className="mx-auto max-w-2xl font-display text-3xl font-semibold leading-[1.05] text-[#2c2415] md:text-5xl">
              Property, with proof you can hold.
            </h3>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-[#5a4a2e] md:text-base">
              {isTenant
                ? 'Browse verified listings, rent with escrow protection, and check every title against the chain — all from one register.'
                : 'Browse verified listings, rent or buy with escrow protection, and check every title against the chain — all from one register.'}
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/listings"
                className="group inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-7 py-3.5 font-semibold text-white shadow-lg transition-colors hover:bg-emerald-700"
              >
                <Home className="h-4 w-4" />
                Explore Properties
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              {secondaryCta && (() => {
                const Icon = secondaryCta.icon;
                return (
                  <Link
                    href={secondaryCta.href}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#9d6f22]/40 px-7 py-3.5 font-semibold text-[#7d561f] transition-colors hover:bg-[#9d6f22]/10"
                  >
                    <Icon className="h-4 w-4" />
                    {secondaryCta.label}
                  </Link>
                );
              })()}
            </div>

            <div className="mx-auto mt-9 h-px w-28 bg-[#9d6f22]/30" />
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#9d6f22]">
              No crypto required · Escrow protected · Title verified
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
