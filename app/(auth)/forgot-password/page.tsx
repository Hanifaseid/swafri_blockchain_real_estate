'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

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
      onError: () => {
        // Show success anyway — don't reveal if email exists
        setSubmitted(true);
      },
    });
  };

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
              {submitted ? (
                <div className="text-center py-4 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h2 className="text-lg font-semibold text-white">Check Your Email</h2>
                  <p className="text-sm text-white/50 font-light leading-relaxed">
                    If an account exists for that email, you will receive a password reset link shortly.
                  </p>
                  <Link href="/login" className="inline-block mt-4 text-emerald-400 text-sm hover:text-emerald-300 transition-colors font-mono">
                    ← Back to Login
                  </Link>
                </div>
              ) : (
                <>
                  <div className="text-center space-y-1">
                    <h2 className="text-xl font-light text-white tracking-tight uppercase">Reset Password</h2>
                    <p className="text-xs text-white/35 font-mono">Enter your email to receive a reset link</p>
                  </div>

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
                      className="w-full bg-white hover:bg-neutral-100 text-black text-xs font-bold tracking-widest font-mono uppercase">
                      Send Reset Link
                    </Button>
                  </form>
                </>
              )}
            </div>
          </AuthCard>
        </div>
      </main>
    </div>
  );
}
