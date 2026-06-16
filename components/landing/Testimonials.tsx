'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import FadeIn from '@/components/FadeIn';
import { TESTIMONIALS } from './data';

export default function Testimonials() {
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : true,
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handlePrevTestimonial = () => {
    setCurrentTestimonialIndex((prev) => {
      const limit = isMobile ? TESTIMONIALS.length - 1 : TESTIMONIALS.length - 3;
      return prev === 0 ? limit : prev - 1;
    });
  };

  const handleNextTestimonial = () => {
    setCurrentTestimonialIndex((prev) => {
      const limit = isMobile ? TESTIMONIALS.length - 1 : TESTIMONIALS.length - 3;
      return prev >= limit ? 0 : prev + 1;
    });
  };

  return (
    <section id="testimonials-section" className="py-24 relative z-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <FadeIn delay={0} duration={600}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 mb-2 block">
                Verified Investor Reviews
              </span>
              <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight">
                Trusted by Property Investors Worldwide
              </h2>
            </div>
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10">
              <button
                onClick={handlePrevTestimonial}
                className="w-9 h-9 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 flex items-center justify-center transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-emerald-400" />
              </button>
              <button
                onClick={handleNextTestimonial}
                className="w-9 h-9 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 flex items-center justify-center transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>
        </FadeIn>

        <div className="overflow-hidden">
          <div
            className="flex gap-5 transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${currentTestimonialIndex * (isMobile ? 100 : 33.3333)}%)`,
            }}
          >
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="liquid-glass border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between shrink-0 w-full md:w-[calc(33.3333%-14px)]"
              >
                <div>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Sparkles key={i} className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                    ))}
                  </div>
                  <p className="text-sm text-white/75 leading-relaxed font-light mb-5">
                    &quot;{t.text}&quot;
                  </p>
                </div>
                <div className="flex items-center gap-3 border-t border-white/10 pt-4">
                  <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center font-bold text-white text-xs shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.author}</div>
                    <div className="text-[10px] text-white/40 font-mono uppercase">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
