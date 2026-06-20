'use client';

import Link from 'next/link';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { LoginForm } from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="w-full max-w-[420px] space-y-5">
      <AuthCard>
        <LoginForm />
      </AuthCard>

      <p className="text-center text-xs text-white/25 font-light">
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" className="text-amber-400/80 hover:text-amber-400 transition-colors">
          Create one
        </Link>
      </p>
    </div>
  );
}
