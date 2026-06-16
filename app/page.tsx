// Root page — redirects to the (public) route group home page.
// The actual landing page lives at app/(public)/page.tsx.
// This redirect is instant so users never see a blank page.

import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/');
}
