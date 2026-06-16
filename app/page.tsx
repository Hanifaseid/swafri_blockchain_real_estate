'use client';

// Root page — renders the LandingPage directly.
// app/(public)/page.tsx is removed to avoid route conflict.
// The (public) layout (Navbar + Footer) is applied via app/(public)/layout.tsx
// only when navigating through that route group — landing page handles its own nav.

import LandingPage from '@/components/LandingPage';

export default function Home() {
  return <LandingPage />;
}
