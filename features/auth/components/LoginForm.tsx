'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/auth.schema';
import { useLogin } from '@/features/auth/queries/auth.queries';
import { AuthServiceError } from '@/features/auth/services/auth.service';

// Shared UI components
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import {
  darkInputWithIconClass,
  darkInputPasswordClass,
  darkInputErrorClass,
} from '@/components/forms/styles';
import { cn } from '@/lib/utils';

// ─── LoginForm ────────────────────────────────────────────────────────────────

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: loginFn, isPending, error, isSuccess } = useLogin();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: LoginFormValues) => loginFn(data);

  const serverError =
    error instanceof AuthServiceError
      ? error.message
      : error
      ? 'Something went wrong. Please try again.'
      : null;

  return (
    <div className="space-y-5 p-6 md:p-8">
      {/* Heading */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-light text-white tracking-tight uppercase">
          Sign In
        </h2>
        <p className="text-xs text-white/50 font-mono">
          Enter your credentials to access your dashboard
        </p>
      </div>

      {/* Server alerts */}
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl text-rose-300 text-xs"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{serverError}</span>
        </div>
      )}
      {isSuccess && (
        <div className="flex items-start gap-2.5 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>Login successful. Redirecting…</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email — FormField (dark variant) wraps the input for accessible label */}
        <FormField
          label="Email Address"
          variant="dark"
          error={errors.email?.message}
          required
        >
          <div className="relative">
            <Mail
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="email"
              placeholder="e.g. tenant@swafir.com"
              autoComplete="email"
              {...register('email')}
              className={cn(
                darkInputWithIconClass,
                errors.email && darkInputErrorClass
              )}
            />
          </div>
        </FormField>

        {/* Password */}
        <FormField
          label="Password"
          variant="dark"
          error={errors.password?.message}
          required
        >
          <div className="relative">
            <Lock
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              {...register('password')}
              className={cn(
                darkInputPasswordClass,
                errors.password && darkInputErrorClass
              )}
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
            >
              {showPassword
                ? <EyeOff className="w-4 h-4" />
                : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </FormField>

        {/* Forgot password + security note row */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-white/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            Secured connection
          </span>
          <button
            type="button"
            className="text-[10px] font-mono text-white/35 hover:text-white/60 transition-colors cursor-pointer"
            onClick={() => alert('Password reset coming in Phase 3.')}
          >
            Forgot password?
          </button>
        </div>

        {/* Submit — uses Button component with loading state */}
        <Button
          type="submit"
          disabled={isPending || isSuccess}
          loading={isPending}
          className="w-full bg-white hover:bg-neutral-100 active:scale-[0.98] text-black py-3.5 rounded-xl text-xs font-bold tracking-widest font-mono uppercase shadow-xl"
          size="lg"
        >
          {isSuccess ? 'Redirecting…' : 'Sign In'}
        </Button>
      </form>
    </div>
  );
}
