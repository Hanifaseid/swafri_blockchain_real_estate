'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { LoginForm } from '@/features/auth/components/LoginForm';

// ─── Login Page ───────────────────────────────────────────────────────────────
// Uses AuthCard + LoginForm components from Step 8.
// Background provided by (auth)/layout.tsx.

export default function LoginPage() {
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
          {/* Page title */}
          <div className="text-center mb-8">
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-900/30">
              Secure Portal
            </span>
            <p className="text-xs text-white/40 mt-3 font-mono">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-emerald-400 hover:text-white transition-colors">
                Register here
              </Link>
            </p>
          </div>

          {/* Tab toggle */}
          <div className="grid grid-cols-2 bg-white/5 p-1 rounded-xl border border-white/10 mb-5 font-mono text-xs">
            <div className="py-2.5 rounded-lg text-center bg-white text-black font-semibold shadow">
              LOGIN
            </div>
            <Link
              href="/register"
              className="py-2.5 rounded-lg text-center text-white/40 hover:text-white transition-colors"
            >
              REGISTER
            </Link>
          </div>

          {/* Form card */}
          <AuthCard>
            <LoginForm />
          </AuthCard>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-5 border-t border-white/5 text-center text-[10px] font-mono text-white/25">
        © {new Date().getFullYear()} Swafir Real Estate Platform
      </footer>
    </div>
  );
}
