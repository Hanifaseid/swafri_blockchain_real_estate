'use client';

import { WalletCards } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

export default function AccountProfilePage() {
  const { currentUser } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6f3c]">Account</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[#153828]">Profile</h1>
      </div>
      <section className="rounded-lg border border-[#d5c8b3] bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5f6b61]">Name</p>
            <p className="mt-1 text-lg font-medium">{currentUser?.name ?? 'Account holder'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5f6b61]">Email</p>
            <p className="mt-1 text-lg font-medium">{currentUser?.email}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5f6b61]">Role</p>
            <p className="mt-1 text-lg font-medium">{currentUser?.role}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5f6b61]">Wallet</p>
            <p className="mt-1 flex items-center gap-2 text-lg font-medium">
              <WalletCards size={18} />
              {currentUser?.linkedWalletAddress ?? 'Not linked'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
