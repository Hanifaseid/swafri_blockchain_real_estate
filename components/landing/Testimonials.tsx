'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { TESTIMONIALS } from './data';

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : true,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const limit = isMobile ? TESTIMONIALS.length - 1 : TESTIMONIALS.length - 3;
  const prev = () => setIndex((p) => (p <= 0 ? limit : p - 1));
  const next = () => setIndex((p) => (p >= limit ? 0 : p + 1));

  return (
    <section id="testimonials-section" className="relative z-20 overflow-hidden py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        <SectionHeading
          index="04"
          kicker="On the Record"
          title={<>What people say<br className="hidden md:block" /> after they verify.</>}
          action={
            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                aria-label="Previous"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-amber-300 transition-colors hover:bg-white/10"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={next}
                aria-label="Next"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-amber-300 transition-colors hover:bg-white/10"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          }
        />

        <div className="overflow-hidden">
          <div
            className="flex gap-5 transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${index * (isMobile ? 100 : 33.3333)}%)` }}
          >
            {TESTIMONIALS.map((t, idx) => (
              <figure
                key={idx}
                className="flex w-full shrink-0 flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-7 md:w-[calc(33.3333%-14px)]"
              >
                <div>
                  <Quote className="mb-4 h-7 w-7 text-amber-400/40" />
                  <blockquote className="font-display text-lg font-light leading-snug text-white/85">
                    {t.text}
                  </blockquote>
                </div>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300/90 to-amber-600 font-mono text-xs font-bold text-emerald-950">
                    {t.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">{t.author}</div>
                    <div className="truncate font-mono text-[10px] uppercase tracking-wider text-white/40">
                      {t.role}
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
