'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, ShieldCheck, X } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Properties', id: 'listings-section' },
  { label: 'The Register', id: 'features-section' },
  { label: 'How It Works', id: 'how-it-works-section' },
  { label: 'Reviews', id: 'testimonials-section' },
] as const;

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Scroll state: solidify the bar + drive the gold progress hairline.
  // NOTE: globals.css makes <body> the scroll container (height:100%;
  // overflow-y:auto), so window.scrollY stays 0. Read from whichever element
  // actually scrolls, and listen in the capture phase so the body's scroll
  // event (which doesn't bubble) still reaches us.
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const body = document.body;
      const y = body.scrollTop || doc.scrollTop || window.scrollY || 0;
      const scrollHeight = Math.max(body.scrollHeight, doc.scrollHeight);
      const max = scrollHeight - window.innerHeight;
      setScrolled(y > 12);
      setProgress(max > 0 ? Math.min(1, y / max) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    return () => window.removeEventListener('scroll', onScroll, { capture: true });
  }, []);

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const scrollTo = useCallback((id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Scroll progress — a thin gold ledger line */}
      <div
        className="absolute inset-x-0 top-0 h-0.5 origin-left bg-linear-to-r from-amber-400 to-amber-600"
        style={{ transform: `scaleX(${progress})`, transition: 'transform 0.1s linear' }}
        aria-hidden
      />

      <div
        className={[
          'flex items-center justify-between gap-4 px-5 transition-all duration-300 md:px-12 lg:px-16',
          scrolled
            ? 'border-b border-white/10 bg-black py-3 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.7)]'
            : 'border-b border-transparent py-5',
        ].join(' ')}
      >
        {/* Wordmark */}
        <Link href="/" className="group flex select-none items-center gap-3" aria-label="VEX — home">
          <span className="relative grid h-9 w-9 place-items-center rounded-[8px] bg-linear-to-br from-amber-300 to-amber-600 font-display text-lg font-semibold leading-none text-emerald-950 shadow-[0_2px_10px_-2px_rgba(189,139,39,0.6)] transition-transform group-hover:scale-105">
            V
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl font-semibold tracking-tight text-white">VEX</span>
            <span className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.28em] text-amber-300/80">
              Property Register
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-9 text-sm md:flex" aria-label="Primary">
          {NAV_ITEMS.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="relative cursor-pointer font-medium text-white/70 transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-amber-400 after:transition-all after:duration-300 hover:text-white hover:after:w-full"
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/auth"
            className="hidden px-4 py-2 text-sm font-medium text-white/75 transition-colors hover:text-white sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/auth"
            className="group hidden items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-emerald-950 shadow-[0_2px_10px_-2px_rgba(189,139,39,0.6)] transition-colors hover:bg-amber-400 sm:inline-flex"
          >
            Get Started
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10 md:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      <div
        className={[
          'md:hidden overflow-hidden border-b border-white/10 bg-black transition-[max-height,opacity] duration-300 ease-out',
          mobileOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0',
        ].join(' ')}
      >
        <nav className="flex flex-col px-5 py-4" aria-label="Mobile">
          {NAV_ITEMS.map(({ label, id }, i) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="flex items-center justify-between border-b border-white/5 py-3.5 text-left font-display text-lg text-white/85 transition-colors hover:text-white"
            >
              <span>{label}</span>
              <span className="font-mono text-[11px] text-amber-300/60">§ 0{i + 1}</span>
            </button>
          ))}

          <div className="mt-4 flex flex-col gap-2.5">
            <Link
              href="/auth"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-semibold text-emerald-950"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 py-3 text-sm font-medium text-white"
            >
              Sign in
            </Link>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 py-2 font-mono text-[10px] uppercase tracking-widest text-white/35">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Every listing title-verified
          </div>
        </nav>
      </div>
    </header>
  );
}
