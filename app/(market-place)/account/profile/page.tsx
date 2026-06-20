'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { WalletSection } from '@/components/account/WalletSection';
import { useUpdateProfile } from '@/features/auth/queries/auth.queries';
import { useAuthStore } from '@/stores/auth.store';

export default function AccountProfilePage() {
  const { currentUser } = useAuthStore();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState(currentUser?.name ?? '');
  const [phone, setPhone] = useState(currentUser?.phone ?? '');

  const dirty =
    name.trim() !== (currentUser?.name ?? '') || phone.trim() !== (currentUser?.phone ?? '');

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Name is required.');
      return;
    }
    updateProfile.mutate(
      { name: name.trim(), phone: phone.trim() || undefined },
      {
        onSuccess: () => toast.success('Profile updated.'),
        onError: (e: any) => toast.error(e?.message ?? 'Could not update profile.'),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">Account</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-white">Profile</h1>
      </div>

      {/* Editable details */}
      <section className="rounded-lg border border-border-primary bg-surface-card p-5">
        <h2 className="mb-4 text-sm font-semibold text-white">Personal details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
              Name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-lg border border-border-primary bg-surface-input px-3 text-sm text-white outline-none focus:border-accent-400"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
              Phone
            </span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Optional"
              className="mt-1.5 h-11 w-full rounded-lg border border-border-primary bg-surface-input px-3 text-sm text-white outline-none placeholder:text-text-placeholder focus:border-accent-400"
            />
          </label>
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
              Email
            </span>
            <p className="mt-1.5 flex h-11 items-center text-sm font-medium text-text-secondary">
              {currentUser?.email}
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
              Role
            </span>
            <p className="mt-1.5 flex h-11 items-center text-sm font-medium text-text-secondary">
              {currentUser?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <Button onClick={handleSave} loading={updateProfile.isPending} disabled={!dirty}>
            Save changes
          </Button>
        </div>
      </section>

      {/* KYC status */}
      <section className="rounded-lg border border-border-primary bg-surface-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-surface-success p-2.5 text-emerald-400">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Identity (KYC)</h2>
              <p className="mt-0.5 text-xs text-text-muted">
                Required before listing or moving funds in escrow.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-surface-highlight px-3 py-1.5 text-xs font-semibold text-emerald-400">
            {currentUser?.kycStatus ?? 'not_started'}
          </span>
        </div>
      </section>

      {/* Wallet */}
      <WalletSection />
    </div>
  );
}
