'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { ShieldCheck, WalletCards } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUpdateProfile, useUnlinkWallet } from '@/features/auth/queries/auth.queries';
import { useAuthStore } from '@/stores/auth.store';

const WALLET_LABEL: Record<string, string> = {
  LINKED: 'Linked',
  VERIFIED: 'Linked',
  NOT_LINKED: 'Not linked',
  PENDING: 'Pending signature',
  REVOKED: 'Revoked',
};

export default function AccountProfilePage() {
  const { currentUser } = useAuthStore();
  const updateProfile = useUpdateProfile();
  const unlinkWallet = useUnlinkWallet();

  const [name, setName] = useState(currentUser?.name ?? '');
  const [phone, setPhone] = useState(currentUser?.phone ?? '');

  const dirty =
    name.trim() !== (currentUser?.name ?? '') || phone.trim() !== (currentUser?.phone ?? '');
  const walletLinked = !!currentUser?.linkedWalletAddress;

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

  const handleUnlink = () => {
    unlinkWallet.mutate(undefined, {
      onSuccess: () => toast.success('Wallet unlinked.'),
      onError: (e: any) =>
        toast.error(e?.message ?? 'Could not unlink wallet (active escrow may block this).'),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6f3c]">Account</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[#153828]">Profile</h1>
      </div>

      {/* Editable details */}
      <section className="rounded-lg border border-[#d5c8b3] bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-[#153828]">Personal details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5f6b61]">
              Name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-lg border border-[#d5c8b3] bg-[#fbf8f1] px-3 text-sm text-[#1c1a16] outline-none focus:border-[#1e5a3d]"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5f6b61]">
              Phone
            </span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Optional"
              className="mt-1.5 h-11 w-full rounded-lg border border-[#d5c8b3] bg-[#fbf8f1] px-3 text-sm text-[#1c1a16] outline-none placeholder:text-[#9a917f] focus:border-[#1e5a3d]"
            />
          </label>
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5f6b61]">
              Email
            </span>
            <p className="mt-1.5 flex h-11 items-center text-sm font-medium text-[#3a4640]">
              {currentUser?.email}
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5f6b61]">
              Role
            </span>
            <p className="mt-1.5 flex h-11 items-center text-sm font-medium text-[#3a4640]">
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
      <section className="rounded-lg border border-[#d5c8b3] bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-[#e7f0e8] p-2.5 text-[#163c2c]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#153828]">Identity (KYC)</h2>
              <p className="mt-0.5 text-xs text-[#5f6b61]">
                Required before listing or moving funds in escrow.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-[#f7f2e8] px-3 py-1.5 text-xs font-semibold text-[#163c2c]">
            {currentUser?.kycStatus ?? 'not_started'}
          </span>
        </div>
      </section>

      {/* Wallet */}
      <section className="rounded-lg border border-[#d5c8b3] bg-white p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-[#f1ece0] p-2.5 text-[#7d561f]">
              <WalletCards size={20} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#153828]">Linked wallet</h2>
              <p className="mt-0.5 font-mono text-xs text-[#5f6b61]">
                {currentUser?.linkedWalletAddress ?? 'No wallet linked'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#f7f2e8] px-3 py-1.5 text-xs font-semibold text-[#163c2c]">
              {WALLET_LABEL[currentUser?.walletStatus ?? 'NOT_LINKED'] ?? currentUser?.walletStatus}
            </span>
            {walletLinked && (
              <Button variant="outline" onClick={handleUnlink} loading={unlinkWallet.isPending}>
                Unlink
              </Button>
            )}
          </div>
        </div>
        <p className="mt-3 text-xs text-[#5f6b61]">
          A linked wallet is where your property title certificate is issued and where escrow refunds
          are received.
        </p>
      </section>
    </div>
  );
}
