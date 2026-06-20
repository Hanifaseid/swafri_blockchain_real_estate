'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/features/auth/schemas/auth.schema';
import { useForgotPassword } from '@/features/auth/queries/auth.queries';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { darkInputWithIconClass, darkInputErrorClass } from '@/components/forms/styles';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { cn } from '@/lib/utils';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const { mutate: sendReset, isPending } = useForgotPassword();

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormValues) => {
    sendReset(data.email, {
      onSuccess: () => setSubmitted(true),
      onError: () => setSubmitted(true),
    });
  };

  return (
    <div className="w-full max-w-[420px] space-y-5">
      <AuthCard>
        <div className="p-6 md:p-8 space-y-5">
          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-medium text-white">Check your email</h2>
                <p className="text-sm text-white/40 font-light leading-relaxed">
                  If an account exists for that email, you&apos;ll receive a reset link shortly.
                </p>
              </div>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm text-amber-400/80 hover:text-amber-400 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <FormField label="Email Address" variant="dark" error={errors.email?.message} required>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    autoComplete="email"
                    {...register('email')}
                    className={cn(darkInputWithIconClass, errors.email && darkInputErrorClass)}
                  />
                </div>
              </FormField>

              <Button type="submit" loading={isPending} size="lg"
                className="w-full bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold tracking-widest uppercase shadow-lg shadow-amber-500/20">
                Send Reset Link
              </Button>
            </form>
          )}
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
