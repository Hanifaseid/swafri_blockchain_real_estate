'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Building2, Users } from 'lucide-react';
import Reveal from '@/components/Reveal';
import SectionHeading from './SectionHeading';

const TENANT_STEPS = [
  {
    step: '01',
    title: 'Browse verified listings',
    desc: 'Search deed-verified homes on the map. Check the certificate of title before you ever reach out.',
  },
  {
    step: '02',
    title: 'Apply or make an offer',
    desc: 'Submit a rental application or a purchase offer. Counter, accept, and negotiate in the open.',
  },
  {
    step: '03',
    title: 'Sign & fund escrow',
    desc: 'Your deposit or purchase funds are held in audited on-chain escrow — never paid blindly to a stranger.',
  },
  {
    step: '04',
    title: 'Move in or take title',
    desc: 'On completion, the deposit settles or the title transfers to your wallet. Every step is on the record.',
  },
];

const OWNER_STEPS = [
  {
    step: '01',
    title: 'Submit your property',
    desc: 'Upload photos and ownership documents, then pass identity verification. Quality is enforced up front.',
  },
  {
    step: '02',
    title: 'Get reviewed & approved',
    desc: 'Our compliance team verifies the deed and your identity before anything goes live.',
  },
  {
    step: '03',
    title: 'Receive your title certificate',
    desc: 'Once approved, the document hash is minted as an ERC-721 certificate of title — your verifiable proof.',
  },
  {
    step: '04',
    title: 'Lease or sell with escrow',
    desc: 'Accept tenants or buyers and let escrow handle the money. Deposits and payments settle automatically.',
  },
];

function Track({
  variant,
  label,
  heading,
  steps,
  cta,
}: {
  variant: 'gold' | 'green';
  label: string;
  heading: string;
  steps: { step: string; title: string; desc: string }[];
  cta: string;
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
            className={`text-[10px] font-mono uppercase tracking-[0.22em] ${gold ? 'text-amber-300' : 'text-emerald-300'}`}
          >
            {label}
          </div>
          <h3 className="font-display text-xl font-medium text-white">{heading}</h3>
        </div>
      </div>

      <ol className="relative space-y-6 before:absolute before:left-[12px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
        {steps.map((item) => (
          <li key={item.step} className="relative flex gap-4 pl-0">
            <span
              className={[
                'relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-mono font-bold',
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
        href="/auth"
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
        title={<>Two paths, one record.</>}
        description="Whether you are looking for a home or listing one, the same verified, escrow-protected rails sit underneath."
      />

      <div className="grid md:grid-cols-2 gap-6">
        <Reveal>
          <Track
            variant="green"
            label="For Renters & Buyers"
            heading="Find a home"
            steps={TENANT_STEPS}
            cta="Find a Property"
          />
        </Reveal>
        <Reveal delay={120}>
          <Track
            variant="gold"
            label="For Property Owners"
            heading="List & sell"
            steps={OWNER_STEPS}
            cta="List Your Property"
          />
        </Reveal>
      </div>
    </section>
  );
}
