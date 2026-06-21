'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Building2, Users } from 'lucide-react';
import Reveal from '@/components/Reveal';
import SectionHeading from './SectionHeading';

const TENANT_STEPS = [
  {
    step: '01',
    title: 'Search the live map',
    desc: 'Explore listings by location, radius, custom boundary, price, beds, amenities, availability, and verified-title status.',
  },
  {
    step: '02',
    title: 'Inspect the proof',
    desc: 'Open the property page to review photos, metadata, ownership status, document hash, and title record before you inquire.',
  },
  {
    step: '03',
    title: 'Apply or make an offer',
    desc: 'Submit a rental application or purchase offer as a tenant, then track the workflow from inquiry to acceptance.',
  },
  {
    step: '04',
    title: 'Lease with escrow visibility',
    desc: 'When a lease is created, KYC, wallet linking, escrow funding, and transaction status are visible instead of hidden in email threads.',
  },
];

const OWNER_STEPS = [
  {
    step: '01',
    title: 'Create a structured listing',
    desc: 'Add sale or rental details, address data, photos, amenities, pricing, availability, and property metadata.',
  },
  {
    step: '02',
    title: 'Submit documents for review',
    desc: 'Upload ownership documents and complete KYC so admins can verify the listing before it is published.',
  },
  {
    step: '03',
    title: 'Anchor title evidence',
    desc: 'After approval, the platform can mint a digital title certificate with the listing and document hash anchored on-chain.',
  },
  {
    step: '04',
    title: 'Manage leads without a dashboard',
    desc: 'Owners handle inquiries, applications, offers, leases, and listing updates from marketplace account pages, not a landlord dashboard.',
  },
];

function Track({
  variant,
  label,
  heading,
  steps,
  cta,
  href,
}: {
  variant: 'gold' | 'green';
  label: string;
  heading: string;
  steps: { step: string; title: string; desc: string }[];
  cta: string;
  href: string;
}) {
  const gold = variant === 'gold';
  return (
    <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8">
      <div className="mb-7 flex items-center gap-3">
        <div
          className={[
            'flex h-11 w-11 items-center justify-center rounded-xl border',
            gold
              ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
              : 'border-emerald-400/25 bg-emerald-500/10 text-emerald-300',
          ].join(' ')}
        >
          {gold ? <Users className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
        </div>
        <div>
          <div
            className={`font-mono text-[10px] uppercase tracking-[0.22em] ${
              gold ? 'text-amber-300' : 'text-emerald-300'
            }`}
          >
            {label}
          </div>
          <h3 className="font-display text-xl font-medium text-white">{heading}</h3>
        </div>
      </div>

      <ol className="relative space-y-6 before:absolute before:bottom-2 before:left-[12px] before:top-2 before:w-px before:bg-white/10">
        {steps.map((item) => (
          <li key={item.step} className="relative flex gap-4 pl-0">
            <span
              className={[
                'relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold',
                gold ? 'bg-amber-500 text-emerald-950' : 'bg-emerald-600 text-white',
              ].join(' ')}
            >
              {item.step}
            </span>
            <div>
              <div className="text-sm font-semibold text-white">{item.title}</div>
              <div className="mt-1 text-xs font-light leading-relaxed text-white/55">{item.desc}</div>
            </div>
          </li>
        ))}
      </ol>

      <Link
        href={href}
        className={[
          'mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors',
          gold
            ? 'bg-amber-500 text-emerald-950 hover:bg-amber-400'
            : 'border border-white/20 text-white hover:bg-white/10',
        ].join(' ')}
      >
        {cta} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section id="how-it-works-section" className="relative z-10 py-24">
      <SectionHeading
        index="03"
        kicker="How It Works"
        align="center"
        title={<>Two marketplace paths.<br className="hidden md:block" /> One source of truth.</>}
        description="TENANT covers both buyers and renters. PROPERTY_OWNER covers owners and representatives. Admin dashboards remain reserved for ADMIN and SUPER_ADMIN."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Reveal>
          <Track
            variant="green"
            label="For Tenants"
            heading="Discover, apply, offer"
            steps={TENANT_STEPS}
            cta="Browse Properties"
            href="/discovery"
          />
        </Reveal>
        <Reveal delay={120}>
          <Track
            variant="gold"
            label="For Property Owners"
            heading="List, verify, transact"
            steps={OWNER_STEPS}
            cta="Create a Listing"
            href="/account/listings/new"
          />
        </Reveal>
      </div>
    </section>
  );
}
