'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

import { registerSchema, type RegisterFormValues } from '@/features/auth/schemas/auth.schema';
import { useRegister } from '@/features/auth/queries/auth.queries';
import { AuthServiceError } from '@/features/auth/services/auth.service';
import { RoleSelector } from './RoleSelector';
import { darkInputClass } from './LoginForm';
import { cn } from '@/lib/utils';

// ─── RegisterForm ─────────────────────────────────────────────────────────────
// Full registration form.
// Only TENANT and PROPERTY_OWNER roles available per PRD.
// Uses useRegister mutation from Step 5.

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { mutate: registerUser, isPending, error, isSuccess } = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'TENANT',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = (data: RegisterFormValues) => {
    registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      phone: data.phone || undefined,
    });
  };

  const serverError =
    error instanceof AuthServiceError
      ? error.message
      : error
      ? 'Something went wrong. Please try again.'
      : null;

  return (
    <div className="p-6 md:p-8 space-y-5">
      {/* Heading */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-light text-white tracking-tight uppercase">
          Create Your Account
        </h2>
        <p className="text-xs text-white/40 font-mono">
          Join the blockchain real estate platform
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
          <span>Registration successful. Taking you to your dashboard…</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Role Selector */}
        <RoleSelector
          value={selectedRole}
          onChange={(r) => setValue('role', r, { shouldValidate: true })}
          error={errors.role?.message}
        />

        {/* Property owner notice */}
        {selectedRole === 'PROPERTY_OWNER' && (
          <div className="flex items-start gap-2 p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl text-[11px] text-emerald-400 font-mono leading-relaxed">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Your account starts as <strong>PENDING</strong>. You can create draft listings immediately,
              but an admin must approve your account before properties go live.
            </span>
          </div>
        )}

        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="block text-[10px] uppercase font-mono text-white/40 tracking-widest">
            Full Name <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 w-4 h-4 text-white/30 pointer-events-none" />
            <input
              type="text"
              placeholder="e.g. Jane Smith"
              autoComplete="name"
              {...register('name')}
              className={darkInputClass}
            />
          </div>
          {errors.name && (
            <p role="alert" className="text-xs text-rose-400 font-mono">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-[10px] uppercase font-mono text-white/40 tracking-widest">
            Email Address <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-white/30 pointer-events-none" />
            <input
              type="email"
              placeholder="e.g. jane@email.com"
              autoComplete="email"
              {...register('email')}
              className={darkInputClass}
            />
          </div>
          {errors.email && (
            <p role="alert" className="text-xs text-rose-400 font-mono">{errors.email.message}</p>
          )}
        </div>

        {/* Phone (optional) */}
        <div className="space-y-1.5">
          <label className="block text-[10px] uppercase font-mono text-white/40 tracking-widest">
            Phone Number <span className="text-white/25">(optional)</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-white/30 pointer-events-none" />
            <input
              type="tel"
              placeholder="e.g. +1 555 000 1234"
              autoComplete="tel"
              {...register('phone')}
              className={darkInputClass}
            />
          </div>
          {errors.phone && (
            <p role="alert" className="text-xs text-rose-400 font-mono">{errors.phone.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-[10px] uppercase font-mono text-white/40 tracking-widest">
            Password <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-white/30 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              autoComplete="new-password"
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

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="block text-[10px] uppercase font-mono text-white/40 tracking-widest">
            Confirm Password <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-white/30 pointer-events-none" />
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('confirmPassword')}
              className={cn(darkInputClass, 'pr-11')}
            />
            <button
              type="button"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3.5 top-3.5 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p role="alert" className="text-xs text-rose-400 font-mono">{errors.confirmPassword.message}</p>
          )}
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
              Creating account…
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>
    </div>
  );
}
