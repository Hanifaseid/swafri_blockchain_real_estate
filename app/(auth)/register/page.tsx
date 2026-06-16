'use client';

// Register page — redirects to login with ?tab=register until Step 8
// builds the dedicated RegisterForm component.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import AuthPageLegacy from '@/app/auth/page';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) router.replace('/dashboard');
  }, [router]);

  return <AuthPageLegacy />;
}
