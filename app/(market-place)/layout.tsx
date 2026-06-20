'use client';

import LandingNavbar from '@/components/landing/LandingNavbar';
import { Footer } from '@/components/layout/Footer';

// ─── Marketplace layout ──────────────────────────────────────────────────────
// Shared by all non-auth, non-admin pages: about, contact, properties,
// listing details, and tenant/owner account sections.
// Provides the LandingNavbar (with auth-aware profile dropdown) + Footer.
// The homepage (app/page.tsx) is NOT in this group — it renders its own nav + footer.

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <LandingNavbar />

      {/* Spacer for the fixed navbar height */}
      <div className="h-[72px]" />

      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
}
