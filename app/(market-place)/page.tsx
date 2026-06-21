'use client';

// Home page. Lives in the (market-place) group so it shares the group layout's
// navbar and footer — LandingPage no longer renders its own.

import LandingPage from '@/components/LandingPage';

export default function Home() {
  return <LandingPage />;
}
