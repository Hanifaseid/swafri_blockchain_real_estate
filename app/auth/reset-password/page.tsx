'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, CheckCircle2 } from 'lucide-react';
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
        setTimeout(() => router.push('/auth/login'), 2000);
      },
      onError: (err) => toast.error((err as Error).message),
    });
  };

  if (!token) {
    return (
      <div className="text-center py-6 space-y-3">
        <p className="text-sm text-white/50">Invalid or missing reset token.</p>
        <Link
          href="/auth/forgot-password"
          className="inline-block text-sm text-amber-400/80 hover:text-amber-400 transition-colors"
        >
          Request a new link →
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center py-6 space-y-3">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
        </div>
        <h2 className="text-lg font-medium text-white">Password updated</h2>
        <p className="text-sm text-white/40 font-light">Redirecting to sign in…</p>
      </div>
    );
  }

  return (
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
        className="w-full bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold tracking-widest uppercase shadow-lg shadow-amber-500/20">
        Reset Password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-[420px] space-y-5">
      <AuthCard>
        <div className="p-6 md:p-8 space-y-5">
          <Suspense fallback={<div className="text-center text-white/30 py-6 text-sm">Loading…</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </AuthCard>

      <p className="text-center text-xs text-white/25 font-light">
        <Link href="/auth/login" className="text-amber-400/80 hover:text-amber-400 transition-colors">
          ← Back to sign in
        </Link>
      </p>
    </div>
  );
}
