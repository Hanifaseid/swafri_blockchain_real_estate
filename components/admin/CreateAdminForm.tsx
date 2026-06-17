'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Lock, AlertCircle } from 'lucide-react';

import { createAdminSchema, type CreateAdminFormValues } from '@/features/users/schemas/user.schema';
import { useCreateAdmin } from '@/features/auth/queries/auth.queries';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { inputClass, inputErrorClass, inputWithIconClass } from '@/components/forms/styles';
import { cn } from '@/lib/utils';

// ─── CreateAdminForm ──────────────────────────────────────────────────────────
// SUPER_ADMIN only — creates a new ADMIN account.
// Uses light design (dashboard context, white card).

interface CreateAdminFormProps {
  onSuccess?: () => void;
}

export function CreateAdminForm({ onSuccess }: CreateAdminFormProps) {
  const { mutate: createAdmin, isPending, error, isSuccess } = useCreateAdmin();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAdminFormValues>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = (data: CreateAdminFormValues) => {
    createAdmin(data, {
      onSuccess: () => {
        reset();
        onSuccess?.();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 bg-red-50 border border-red-200 p-3.5 rounded-xl text-red-700 text-xs"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{(error as Error).message}</span>
        </div>
      )}

      {isSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-emerald-700 text-xs">
          Admin account created successfully.
        </div>
      )}

      <FormField label="Full Name" error={errors.name?.message} required>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="e.g. John Admin"
            autoComplete="name"
            {...register('name')}
            className={cn(inputWithIconClass, errors.name && inputErrorClass)}
          />
        </div>
      </FormField>

      <FormField label="Email Address" error={errors.email?.message} required>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="email"
            placeholder="e.g. admin@swafir.com"
            autoComplete="email"
            {...register('email')}
            className={cn(inputWithIconClass, errors.email && inputErrorClass)}
          />
        </div>
      </FormField>

      <FormField
        label="Password"
        error={errors.password?.message}
        hint="Min 8 chars, one uppercase, one number"
        required
      >
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register('password')}
            className={cn(inputWithIconClass, errors.password && inputErrorClass)}
          />
        </div>
      </FormField>

      <Button type="submit" loading={isPending} className="w-full">
        Create Admin Account
      </Button>
    </form>
  );
}
