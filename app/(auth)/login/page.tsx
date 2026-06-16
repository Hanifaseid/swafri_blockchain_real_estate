'use client';

// Login page — uses the existing auth/page.tsx design as the template.
// Auth form components will be added in Step 8.
// For now renders the existing AuthPage to keep the app working.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import AuthPageLegacy from '@/app/auth/page';

export default function LoginPage() {
  const router = useRouter();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    const user = getCurrentUser();
    if (user) router.replace('/dashboard');
  }, [router]);

  // Render the existing auth page until Step 8 replaces it with LoginForm
  return <AuthPageLegacy />;
}
