'use client';

import Link from 'next/link';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="w-full max-w-[420px] space-y-5">
      <AuthCard>
        <RegisterForm />
      </AuthCard>

      <p className="text-center text-xs text-white/25 font-light">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-amber-400/80 hover:text-amber-400 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
