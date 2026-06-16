'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

// ─── Register Page ────────────────────────────────────────────────────────────
// Uses AuthCard + RegisterForm components from Step 8.
// Background provided by (auth)/layout.tsx.

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen relative z-10">
      {/* Header */}
      <header className="px-6 md:px-16 pt-8 pb-4 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-white/40 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-lg border border-white/10"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          Back to Home
        </Link>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-white flex items-center justify-center text-black font-extrabold text-sm shadow select-none">
            S
          </div>
          <span className="text-lg font-semibold tracking-tight text-white select-none">
            Swafir
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Tab toggle */}
          <div className="grid grid-cols-2 bg-white/5 p-1 rounded-xl border border-white/10 mb-5 font-mono text-xs">
            <Link
              href="/login"
              className="py-2.5 rounded-lg text-center text-white/40 hover:text-white transition-colors"
            >
              LOGIN
            </Link>
            <div className="py-2.5 rounded-lg text-center bg-white text-black font-semibold shadow">
              REGISTER
            </div>
          </div>

          {/* Form card */}
          <AuthCard>
            <RegisterForm />
          </AuthCard>

          <p className="text-center text-[10px] font-mono text-white/25 mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-400 hover:text-white transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-5 border-t border-white/5 text-center text-[10px] font-mono text-white/25">
        © {new Date().getFullYear()} Swafir Real Estate Platform
      </footer>
    </div>
  );
}
