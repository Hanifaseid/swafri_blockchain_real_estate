'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Phone, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuthStore } from '@/stores/auth.store';
import { updateProfileSchema, type UpdateProfileFormValues } from '@/features/users/schemas/user.schema';
import { updateSessionUser } from '@/lib/auth/session';
import { getMockUsers, saveMockUsers } from '@/features/auth/utils/seed';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { inputClass, inputErrorClass } from '@/components/forms/styles';
import { Avatar } from '@/components/ui/Avatar';
import { ROLE_LABELS } from '@/features/roles/types/role.types';
import { ACCOUNT_STATUS_BADGE, KYC_STATUS_BADGE, WALLET_STATUS_BADGE } from '@/features/users/constants';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { currentUser, updateUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: currentUser?.name ?? '',
      phone: currentUser?.phone ?? '',
    },
  });

  if (!currentUser) return null;

  const onSubmit = (data: UpdateProfileFormValues) => {
    // Update mock DB
    const all = getMockUsers();
    const idx = all.findIndex((u) => u.id === currentUser.id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], name: data.name.trim(), phone: data.phone || undefined };
      saveMockUsers(all);
    }
    // Update session + Zustand store
    updateSessionUser({ name: data.name.trim(), phone: data.phone || undefined });
    updateUser({ name: data.name.trim(), phone: data.phone || undefined });
    toast.success('Profile updated.');
  };

  const statusBadge = ACCOUNT_STATUS_BADGE[currentUser.status];
  const kycBadge = KYC_STATUS_BADGE[currentUser.kycStatus];
  const walletBadge = WALLET_STATUS_BADGE[currentUser.walletStatus];

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <User className="w-6 h-6 text-white/50 shrink-0" />
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/35">Account</p>
          <h1 className="text-2xl font-light text-white tracking-tight">My Profile</h1>
        </div>
      </div>

      <div className="space-y-5">
        {/* Identity card */}
        <div className="dash-card p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar name={currentUser.name} size="xl" />
            <div>
              <p className="text-lg font-semibold text-white">{currentUser.name}</p>
              <p className="text-sm text-white/40 font-mono">{currentUser.email}</p>
              <span className={cn(
                'inline-block mt-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md',
                currentUser.role === 'SUPER_ADMIN' && 'bg-amber-950/40 text-amber-400',
                currentUser.role === 'ADMIN' && 'bg-blue-950/40 text-blue-400',
                currentUser.role === 'PROPERTY_OWNER' && 'bg-purple-950/40 text-purple-400',
                currentUser.role === 'TENANT' && 'bg-emerald-950/40 text-emerald-400',
              )}>
                {ROLE_LABELS[currentUser.role]}
              </span>
            </div>
          </div>

          {/* Status cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Account', badge: statusBadge },
              { label: 'KYC', badge: kycBadge },
              { label: 'Wallet', badge: walletBadge },
            ].map(({ label, badge }) => (
              <div
                key={label}
                className="rounded-xl p-3 text-center"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-dash-border)' }}
              >
                <p className="text-[9px] font-mono uppercase text-white/30 mb-1.5">{label}</p>
                <span className={cn('text-[10px] font-mono font-semibold', badge.color)}>
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Edit form */}
        <div className="dash-card p-6">
          <p className="text-xs font-mono uppercase tracking-widest text-white/35 mb-5">Edit Profile</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField label="Full Name" error={errors.name?.message} required>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  autoComplete="name"
                  {...register('name')}
                  className={cn('pl-9', inputClass, errors.name && inputErrorClass)}
                />
              </div>
            </FormField>

            <FormField label="Phone Number" error={errors.phone?.message} hint="Optional">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="tel"
                  autoComplete="tel"
                  {...register('phone')}
                  className={cn('pl-9', inputClass, errors.phone && inputErrorClass)}
                />
              </div>
            </FormField>

            <FormField label="Email Address" hint="Email cannot be changed">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  value={currentUser.email}
                  disabled
                  className={cn('pl-9', inputClass, 'opacity-50 cursor-not-allowed')}
                />
              </div>
            </FormField>

            <div className="flex items-center justify-between pt-2">
              <p className="text-[10px] text-white/25 font-mono">
                Role cannot be self-updated
              </p>
              <Button type="submit" disabled={!isDirty} size="md">
                <CheckCircle2 size={14} />
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
