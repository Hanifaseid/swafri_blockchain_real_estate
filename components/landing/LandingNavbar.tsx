'use client';

import React from 'react';
import Link from 'next/link';

const NAV_ITEMS = [
  { label: 'Properties', id: 'listings-section' },
  { label: 'The Register', id: 'features-section' },
  { label: 'How It Works', id: 'how-it-works-section' },
  { label: 'Reviews', id: 'testimonials-section' },
] as const;

export default function LandingNavbar() {
  return (
    <header className="px-6 md:px-12 lg:px-16 pt-6 sticky top-0 z-50">
      <div className="liquid-glass rounded-xl pl-4 pr-3 py-2.5 flex items-center justify-between">
        {/* Wordmark — serif, with an engraved gold monogram */}
        <Link href="/" className="flex items-center gap-3 select-none group">
          <span className="relative grid place-items-center w-8 h-8 rounded-[7px] bg-gradient-to-br from-amber-300 to-amber-600 text-emerald-950 font-display font-semibold text-lg leading-none shadow-[0_2px_8px_-2px_rgba(189,139,39,0.6)]">
            V
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl font-semibold tracking-tight text-white">VEX</span>
            <span className="text-[8px] font-mono uppercase tracking-[0.28em] text-amber-300/80 mt-0.5">
              Property Register
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          {NAV_ITEMS.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
              className="relative text-white/70 hover:text-white transition-colors cursor-pointer font-medium after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-amber-400 after:transition-all hover:after:w-full"
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/auth"
            className="hidden sm:inline-flex text-sm font-medium text-white/80 hover:text-white px-4 py-2 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/auth"
            className="bg-amber-500 text-emerald-950 text-sm font-semibold px-5 py-2 rounded-lg hover:bg-amber-400 transition-colors shadow-[0_2px_10px_-2px_rgba(189,139,39,0.6)]"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
