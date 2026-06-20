'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Bath, BedDouble, Maximize, MapPin, ShieldCheck } from 'lucide-react';
import Reveal from '@/components/Reveal';
import SectionHeading from './SectionHeading';
import { Property } from './data';
import { formatCurrency } from '@/lib/utils';

interface FeaturedPropertiesProps {
  properties: Property[];
  onVerify: (prop: Property) => void;
}

export default function FeaturedProperties({ properties, onVerify }: FeaturedPropertiesProps) {
  return (
    <section
      id="listings-section"
      className="py-24 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto z-10 relative"
    >
      <SectionHeading
        index="01"
        kicker="The Register"
        title={<>Verified properties,<br className="hidden md:block" /> ready to view.</>}
        description="Every listing is identity-checked, document-reviewed, and anchored to a blockchain certificate of title. Verify any of them yourself."
        action={
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 text-sm font-mono text-amber-300 hover:text-amber-200 transition-colors"
          >
            View all listings <ArrowRight className="w-4 h-4" />
          </Link>
        }
      />

      <div className="grid md:grid-cols-3 gap-6">
        {properties.map((prop, i) => {
          const price = formatCurrency(prop.price, 'USD');
          const priceLabel = prop.listingType === 'rent' ? `${price}/mo` : price;

          return (
            <Reveal key={prop.id} delay={i * 110}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/30 hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.8)]">
                {/* Photo */}
                <div className="relative h-56 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={prop.image}
                    alt={prop.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14110c] via-[#14110c]/10 to-transparent" />

                  {/* Listing type — gold for sale, glass for rent */}
                  <span
                    className={[
                      'absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider',
                      prop.listingType === 'sale'
                        ? 'bg-amber-500 text-emerald-950'
                        : 'bg-white/15 text-white backdrop-blur border border-white/20',
                    ].join(' ')}
                  >
                    {prop.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                  </span>

                  {/* Verified chip */}
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-700/30 px-2 py-1 text-[10px] font-semibold text-emerald-100 ring-1 ring-emerald-400/40 backdrop-blur">
                    <BadgeCheck className="h-3 w-3" /> Verified
                  </span>

                  {/* Location */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[11px] font-mono text-white/85">
                    <MapPin className="h-3 w-3 text-amber-300" />
                    {prop.location}
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg font-medium leading-tight text-white">
                      {prop.name}
                    </h3>
                  </div>

                  {/* Specs */}
                  <div className="mt-3 flex items-center gap-4 text-xs text-white/55">
                    <span className="inline-flex items-center gap-1.5">
                      <BedDouble className="h-3.5 w-3.5" /> {prop.beds}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Bath className="h-3.5 w-3.5" /> {prop.baths}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Maximize className="h-3.5 w-3.5" /> {prop.area} m²
                    </span>
                    <span className="ml-auto text-[10px] font-mono uppercase tracking-wider text-white/35">
                      {prop.type}
                    </span>
                  </div>

                  {/* Title id */}
                  <div className="mt-4 flex items-center justify-between rounded-lg border border-white/8 bg-black/20 px-3 py-2 font-mono text-[10px]">
                    <span className="text-white/35 uppercase tracking-wider">Title</span>
                    <span className="text-amber-200/90">{prop.titleId}</span>
                  </div>

                  {/* Price + actions */}
                  <div className="mt-auto pt-5">
                    <div className="mb-4 flex items-end justify-between border-t border-white/10 pt-4">
                      <span className="font-display text-2xl font-semibold text-white">
                        {priceLabel}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onVerify(prop)}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-amber-400/40 px-3 py-2.5 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-400/10"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verify Title
                      </button>
                      <Link
                        href="/auth"
                        className="inline-flex items-center justify-center gap-1 rounded-lg bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/15"
                      >
                        Details <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
