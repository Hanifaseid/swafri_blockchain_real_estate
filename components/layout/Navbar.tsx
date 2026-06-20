'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Navbar ───────────────────────────────────────────────────────────────────
// Public-facing navigation. Dark glass design matching LandingPage.
// Used by app/(public)/layout.tsx for about & contact pages.

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Browse', href: '/properties' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="px-6 md:px-12 lg:px-16 pt-6 sticky top-0 z-50">
      <div className="liquid-glass rounded-xl px-4 py-2.5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 select-none" aria-label="TerraChain home">
          <div className="w-7 h-7 rounded bg-white flex items-center justify-center text-black font-extrabold text-sm">
            V
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">TerraChain</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm" aria-label="Main navigation">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-white/70 hover:text-white transition-colors font-medium"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA + mobile toggle */}
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="hidden sm:inline-flex bg-white text-black text-sm font-semibold px-5 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Get Started
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden text-white/60 hover:text-white p-1.5 rounded-lg transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden mt-2 liquid-glass rounded-xl px-4 py-4 space-y-1">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-white/10">
            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="block text-center bg-white text-black text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
