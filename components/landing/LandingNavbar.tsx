'use client';

import React from 'react';
import Link from 'next/link';

const NAV_ITEMS = [
  { label: 'Properties', id: 'listings-section' },
  { label: 'Platform', id: 'features-section' },
  { label: 'How It Works', id: 'how-it-works-section' },
  { label: 'Reviews', id: 'testimonials-section' },
] as const;

export default function LandingNavbar() {
  return (
    <header className="px-6 md:px-12 lg:px-16 pt-6 sticky top-0 z-50">
      <div className="liquid-glass rounded-xl px-4 py-2.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 select-none">
          <div className="w-7 h-7 rounded bg-white flex items-center justify-center text-black font-extrabold text-sm">
            V
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">VEX</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          {NAV_ITEMS.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
              className="text-white/80 hover:text-white transition-colors cursor-pointer font-medium"
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/auth"
            className="bg-white text-black text-sm font-semibold px-5 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
