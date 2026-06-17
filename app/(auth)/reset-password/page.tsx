'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { resetPasswordSchema, type ResetPasswordFormValues } from '@/features/auth/schemas/auth.schema';
import { useResetPassword } from '@/features/auth/queries/auth.queries';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { darkInputWithIconClass, darkInputErrorClass } from '@/components/forms/styles';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { cn } from '@/lib/utils';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';
  const [done, setDone] = useState(false);

  const { mutate: doReset, isPending } = useResetPassword();

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, newPassword: '', confirmPassword: '' },
  });

  const onSubmit = (data: ResetPasswordFormValues) => {
    doReset({ token: data.token || token, newPassword: data.newPassword }, {
      onSuccess: () => {
        setDone(true);
        toast.success('Password reset. Please sign in again.');
        setTimeout(() => router.push('/login'), 2000);
      },
      onError: (err) => toast.error((err as Error).message),
    });
  };

  if (!token) {
    return (
      <div className="text-center py-8 space-y-3">
        <p className="text-red-400 text-sm">Invalid or missing reset token.</p>
        <Link href="/forgot-password" className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors font-mono">
          Request a new link
        </Link>
      </div>
    );
  }

  return done ? (
    <div className="text-center py-4 space-y-3">
      <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
      <h2 className="text-lg font-semibold text-white">Password Reset</h2>
      <p className="text-sm text-white/50 font-light">Redirecting to login…</p>
    </div>
  ) : (
    <>
      <div className="text-center space-y-1">
        <h2 className="text-xl font-light text-white tracking-tight uppercase">Set New Password</h2>
        <p className="text-xs text-white/35 font-mono">Enter and confirm your new password</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <input type="hidden" {...register('token')} value={token} />

        <FormField label="New Password" variant="dark" error={errors.newPassword?.message}
          hint="Min 8 chars, one uppercase, one number" required>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            <input type="password" autoComplete="new-password" {...register('newPassword')}
              className={cn(darkInputWithIconClass, errors.newPassword && darkInputErrorClass)} />
          </div>
        </FormField>

        <FormField label="Confirm Password" variant="dark" error={errors.confirmPassword?.message} required>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            <input type="password" autoComplete="new-password" {...register('confirmPassword')}
              className={cn(darkInputWithIconClass, errors.confirmPassword && darkInputErrorClass)} />
          </div>
        </FormField>

        <Button type="submit" loading={isPending} size="lg"
          className="w-full bg-white hover:bg-neutral-100 text-black text-xs font-bold tracking-widest font-mono uppercase">
          Reset Password
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col min-h-screen relative z-10">
      <header className="px-6 md:px-16 pt-8 pb-4 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur">
        <Link href="/login" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-lg border border-white/10">
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          Back to Login
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-white flex items-center justify-center text-black font-extrabold text-sm">S</div>
          <span className="text-lg font-semibold tracking-tight text-white">Swafir</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-900/30">
              Password Recovery
            </span>
          </div>
          <AuthCard>
            <div className="p-6 md:p-8 space-y-5">
              <Suspense fallback={<div className="text-center text-white/40 py-4">Loading…</div>}>
                <ResetPasswordForm />
              </Suspense>
            </div>
          </AuthCard>
        </div>
      </main>
    </div>
  );
}
