'use client';

// Legacy /auth route — redirects to the new /login page.
// This keeps backward compatibility for any existing bookmarks or links.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthLegacyRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
    </div>
  );
}
