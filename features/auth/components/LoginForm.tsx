'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/auth.schema';
import { useLogin } from '@/features/auth/queries/auth.queries';
import { AuthServiceError } from '@/features/auth/services/auth.service';
import { QuickFillBar } from './QuickFillBar';
import { cn } from '@/lib/utils';

// ─── LoginForm ────────────────────────────────────────────────────────────────
// Full login form using react-hook-form + zod.
// Uses useLogin mutation from Step 5.
// Matches the dark design of the existing auth/page.tsx.

// Shared dark input class used by both LoginForm and RegisterForm
export const darkInputClass =
  'w-full bg-black/60 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/25 font-mono focus:outline-none focus:border-emerald-400 transition-all';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending, error, isSuccess } = useLogin();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: LoginFormValues) => {
    login(data);
  };

  // Extract friendly error message from AuthServiceError
  const serverError =
    error instanceof AuthServiceError
      ? error.message
      : error
      ? 'Something went wrong. Please try again.'
      : null;

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Tab label */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-light text-white tracking-tight uppercase">
          Access Your Account
        </h2>
        <p className="text-xs text-white/40 font-mono">
          Enter your credentials to continue
        </p>
      </div>

      {/* Server alerts */}
      {serverError && (
        <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}
      {isSuccess && (
        <div className="flex items-start gap-2.5 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Login successful. Redirecting to dashboard…</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-[10px] uppercase font-mono text-white/40 tracking-widest">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-white/30 pointer-events-none" />
            <input
              type="email"
              placeholder="e.g. tenant@swafir.com"
              autoComplete="email"
              {...register('email')}
              className={darkInputClass}
            />
          </div>
          {errors.email && (
            <p role="alert" className="text-xs text-rose-400 font-mono">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-[10px] uppercase font-mono text-white/40 tracking-widest">
              Password
            </label>
            <button
              type="button"
              className="text-[10px] font-mono text-white/35 hover:text-white/70 transition-colors cursor-pointer"
              onClick={() => alert('Password reset coming in Phase 3.')}
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-white/30 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              {...register('password')}
              className={cn(darkInputClass, 'pr-11')}
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-3.5 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p role="alert" className="text-xs text-rose-400 font-mono">{errors.password.message}</p>
          )}
        </div>

        {/* Security note */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/30">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secured connection</span>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending || isSuccess}
          className="w-full bg-white hover:bg-neutral-100 active:scale-[0.98] text-black py-3.5 rounded-xl text-xs font-bold tracking-widest font-mono uppercase transition-all shadow-xl disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
              Signing in…
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Dev quick-fill */}
      <QuickFillBar
        onFill={(email, password) => {
          setValue('email', email);
          setValue('password', password);
        }}
      />
    </div>
  );
}
