'use client';

import * as React from 'react';
import Link from 'next/link';
import { FileText, Loader2, Calendar } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useSubmitRentalApplication } from '@/features/rental-applications/queries/rental-application.queries';
import { WalletConnectButton } from '@/components/ui/WalletConnectButton';

export function RentalApplicationCard({
  listingId,
  title,
  monthlyRent,
  currency = 'USD'
}: {
  listingId: string;
  title?: string;
  monthlyRent?: number;
  currency?: string;
}) {
  const { currentUser } = useAuthStore();
  const { mutate: submitApplication, isPending } = useSubmitRentalApplication();
  
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    desiredStartDate: '',
    desiredEndDate: '',
    occupants: 1,
    monthlyIncome: '',
    employer: '',
    message: ''
  });

  // Only show this card if the listing is for rent
  if (!monthlyRent) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      window.location.href = '/portal/login';
      return;
    }

    if (!formData.desiredStartDate || !formData.desiredEndDate || !formData.monthlyIncome) {
      alert('Please fill in all required fields (dates and income).');
      return;
    }

    submitApplication(
      {
        listingId,
        desiredStartDate: formData.desiredStartDate,
        desiredEndDate: formData.desiredEndDate,
        occupants: Number(formData.occupants),
        monthlyIncome: Number(formData.monthlyIncome),
        employer: formData.employer.trim() || undefined,
        message: formData.message.trim() || undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
          // reset form
          setFormData({
            desiredStartDate: '',
            desiredEndDate: '',
            occupants: 1,
            monthlyIncome: '',
            employer: '',
            message: ''
          });
        }
      }
    );
  };

  return (
    <div className="bg-white p-4 rounded-2xl border shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-emerald-600 font-medium">Available for Rent</p>
          <p className="font-semibold text-lg">{monthlyRent.toLocaleString()} {currency} <span className="text-xs text-gray-500 font-normal">/ mo</span></p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
        >
          <FileText className="w-4 h-4" />
          Apply Now
        </button>
      </div>

      {open && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {!currentUser ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Please sign in to submit a rental application.
              </p>
              <div className="flex gap-2">
                <Link href="/portal/login" className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 text-sm font-medium transition-colors">
                  Sign in
                </Link>
                <WalletConnectButton />
                <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-xl border hover:bg-gray-50 text-sm font-medium transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Rental Application</p>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1">Move-in Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.desiredStartDate}
                    onChange={e => setFormData(f => ({ ...f, desiredStartDate: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1">Move-out Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.desiredEndDate}
                    onChange={e => setFormData(f => ({ ...f, desiredEndDate: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1">Occupants *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.occupants}
                    onChange={e => setFormData(f => ({ ...f, occupants: parseInt(e.target.value) || 1 }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1">Monthly Income *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.monthlyIncome}
                      onChange={e => setFormData(f => ({ ...f, monthlyIncome: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 pl-6 pr-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1">Employer / Occupation</label>
                <input
                  type="text"
                  value={formData.employer}
                  onChange={e => setFormData(f => ({ ...f, employer: e.target.value }))}
                  placeholder="Where do you work?"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1">Message to Owner</label>
                <textarea
                  value={formData.message}
                  onChange={e => setFormData(f => ({ ...f, message: e.target.value }))}
                  placeholder={`Hi, I'm interested in renting ${title || 'this property'}...`}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {isPending ? <Loader2 size={16} className="animate-spin" /> : 'Submit Application'}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                  className="px-4 py-2.5 rounded-xl border hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
