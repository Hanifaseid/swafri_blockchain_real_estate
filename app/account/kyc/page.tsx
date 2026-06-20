'use client';

import { ShieldCheck } from 'lucide-react';
import { useKycStatus } from '@/features/kyc/queries/kyc.queries';
import { useAuthStore } from '@/stores/auth.store';

export default function AccountKycPage() {
  const { currentUser } = useAuthStore();
  const { data, isLoading } = useKycStatus();
  const status = (data as any)?.status ?? (data as any)?.kycStatus ?? currentUser?.kycStatus ?? 'not_started';

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6f3c]">Compliance</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[#153828]">KYC review</h1>
      </div>
      <section className="rounded-lg border border-[#d5c8b3] bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-[#e7f0e8] p-3 text-[#163c2c]">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Verification status</h2>
              <p className="mt-1 text-sm text-[#5f6b61]">
                KYC approval is required for property submission and escrow actions.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-[#f7f2e8] px-4 py-2 text-sm font-semibold text-[#163c2c]">
            {isLoading ? 'Loading' : status}
          </span>
        </div>
      </section>
    </div>
  );
}
