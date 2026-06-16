'use client';

// Public home — renders the existing LandingPage component unchanged.
// The old app/page.tsx will redirect here once routing is complete.

import LandingPage from '@/components/LandingPage';

export default function PublicHomePage() {
  return <LandingPage />;
}
