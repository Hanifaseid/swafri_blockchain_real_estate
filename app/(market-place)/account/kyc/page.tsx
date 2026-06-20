'use client';

import { useRef, useState } from 'react';
import { ShieldCheck, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useKycStatus, useSubmitKycDocuments } from '@/features/kyc/queries/kyc.queries';
import { useAuthStore } from '@/stores/auth.store';

const DOC_TYPES = [
  { value: 'national_id', label: 'National ID' },
  { value: 'passport', label: 'Passport' },
  { value: 'drivers_license', label: "Driver's licence" },
  { value: 'other', label: 'Other document' },
];

const STATUS_STYLE: Record<string, string> = {
  verified: 'bg-surface-success text-emerald-400',
  approved: 'bg-surface-success text-emerald-400',
  pending: 'bg-surface-warning text-amber-400',
  under_review: 'bg-surface-warning text-amber-400',
  rejected: 'bg-surface-danger text-text-danger',
  not_started: 'bg-surface-highlight text-text-muted',
};

export default function AccountKycPage() {
  const { currentUser } = useAuthStore();
  const { data, isLoading } = useKycStatus();
  const submit = useSubmitKycDocuments();
  const fileRef = useRef<HTMLInputElement>(null);

  const [documentType, setDocumentType] = useState('national_id');
  const [files, setFiles] = useState<File[]>([]);

  const status: string =
    (data as any)?.status ?? (data as any)?.kycStatus ?? currentUser?.kycStatus ?? 'not_started';
  const isVerified = status === 'verified' || status === 'approved';

  const handleSubmit = () => {
    if (files.length === 0) return;
    submit.mutate(
      { files, documentType },
      {
        onSuccess: (ok) => {
          if (ok) {
            setFiles([]);
            if (fileRef.current) fileRef.current.value = '';
          }
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">Compliance</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-white">KYC &amp; verification</h1>
      </div>

      {/* Status */}
      <section className="rounded-lg border border-border-primary bg-surface-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-surface-success p-3 text-emerald-400">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Verification status</h2>
              <p className="mt-1 text-sm text-text-muted">
                KYC approval is required before listing a property or moving funds in escrow.
              </p>
            </div>
          </div>
          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
              STATUS_STYLE[status] ?? STATUS_STYLE.not_started
            }`}
          >
            {isLoading ? 'Loading…' : status.replace('_', ' ')}
          </span>
        </div>
      </section>

      {/* Upload */}
      {!isVerified && (
        <section className="rounded-lg border border-border-primary bg-surface-card p-6">
          <h2 className="text-sm font-semibold text-white">Submit identity documents</h2>
          <p className="mt-1 text-sm text-text-muted">
            Upload a clear image or PDF. Accepted: national ID, passport, or driver&apos;s licence.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                Document type
              </span>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-lg border border-border-primary bg-surface-input px-3 text-sm text-white outline-none focus:border-accent-400"
              >
                {DOC_TYPES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                File(s)
              </span>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                className="mt-1.5 block w-full text-sm text-text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-700"
              />
            </label>
          </div>

          {files.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-text-muted">
              {files.map((f) => (
                <li key={f.name} className="flex items-center gap-2">
                  <UploadCloud size={13} className="text-accent-400" />
                  {f.name} <span className="text-text-placeholder">({Math.round(f.size / 1024)} KB)</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 flex justify-end">
            <Button onClick={handleSubmit} loading={submit.isPending} disabled={files.length === 0}>
              <UploadCloud size={16} />
              Submit for review
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
