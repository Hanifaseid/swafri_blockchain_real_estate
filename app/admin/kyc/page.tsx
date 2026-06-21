'use client';

import { useState, useMemo } from 'react';
import {
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  FileText,
  Hourglass,
  Loader2,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  ShieldQuestion,
  User,
  XCircle,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useUsers } from '@/features/users/queries/users.queries';
import {
  useAdminKycDetails,
  useReviewUserKyc,
  useAdminKycDocUrl,
  useStartKycReview,
} from '@/features/kyc/queries/kyc.admin.queries';
import { AdminPageLayout } from '@/components/admin/ui';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import type { UserAccount, KycStatus } from '@/features/users/types/user.types';
import type { KycDocument } from '@/features/kyc/services/kyc.service';

// ── Tabs ──────────────────────────────────────────────────────────────────────

type TabStatus = KycStatus | 'all';

const TABS: { key: TabStatus; label: string; icon: React.ElementType }[] = [
  { key: 'all',          label: 'All',          icon: User },
  { key: 'pending',      label: 'Pending',      icon: Clock },
  { key: 'under_review', label: 'Under Review', icon: Hourglass },
  { key: 'verified',     label: 'Verified',     icon: ShieldCheck },
  { key: 'rejected',     label: 'Rejected',     icon: ShieldOff },
  { key: 'not_started',  label: 'Not Started',  icon: ShieldQuestion },
  { key: 'expired',      label: 'Expired',      icon: ShieldAlert },
];

const DOC_TYPE_LABEL: Record<string, string> = {
  national_id:     'National ID',
  passport:        'Passport',
  drivers_license: "Driver's License",
  other:           'Other Document',
};

function relativeDate(d: string) {
  if (!d) return '—';
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);
  if (days < 1) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function avatar(name: string) {
  return name?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

// ── Document row ──────────────────────────────────────────────────────────────

function DocLink({ userId, doc }: { userId: string; doc: KycDocument }) {
  const { data: url, isLoading } = useAdminKycDocUrl(userId, doc.id);

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-gray-200">
          <FileText size={14} className="text-gray-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {DOC_TYPE_LABEL[doc.type] ?? doc.type.replace(/_/g, ' ')}
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="text-xs text-gray-500">Uploaded {relativeDate(doc.uploadedAt)}</span>
            <StatusBadge status={doc.status} />
          </div>
        </div>
      </div>
      {isLoading ? (
        <Loader2 size={14} className="shrink-0 animate-spin text-gray-400" />
      ) : url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="ml-3 flex shrink-0 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
        >
          <ExternalLink size={11} /> View
        </a>
      ) : (
        <span className="ml-3 text-xs text-red-500">Unavailable</span>
      )}
    </div>
  );
}

// ── Info tile ─────────────────────────────────────────────────────────────────

function InfoTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">{label}</p>
      <div className="mt-1.5">{value}</div>
    </div>
  );
}

// ── Review panel ──────────────────────────────────────────────────────────────

function ReviewPanel({ user, onDone }: { user: UserAccount; onDone: () => void }) {
  const { data: kyc, isLoading } = useAdminKycDetails(user.id);
  const { mutate: startReview, isPending: starting } = useStartKycReview();
  const { mutate: review, isPending: reviewing } = useReviewUserKyc();
  const [note, setNote] = useState('');

  const busy = starting || reviewing;
  const kycStatus = (kyc as any)?.kycStatus ?? user.kycStatus;
  const canStartReview = kycStatus === 'pending';
  const canReview = kycStatus === 'pending' || kycStatus === 'under_review' || kycStatus === 'rejected';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={20} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!kyc) {
    return <p className="py-4 text-sm text-red-600">Failed to load KYC details.</p>;
  }

  return (
    <div className="space-y-4 pt-4">
      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoTile label="KYC Status"     value={<StatusBadge status={kycStatus} />} />
        <InfoTile label="Account Status" value={<StatusBadge status={user.status} />} />
        <InfoTile label="Role"           value={<span className="text-sm font-semibold text-gray-800 capitalize">{user.role.replace(/_/g, ' ').toLowerCase()}</span>} />
        <InfoTile label="Registered"     value={<span className="text-sm text-gray-600">{relativeDate(user.createdAt)}</span>} />
      </div>

      {/* Documents */}
      <div>
        <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Submitted Documents ({kyc.documents.length})
        </p>
        {kyc.documents.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-5 text-sm text-gray-400">
            <FileText size={15} /> No documents submitted yet.
          </div>
        ) : (
          <div className="space-y-2">
            {kyc.documents.map((doc) => (
              <DocLink key={doc.id} userId={user.id} doc={doc} />
            ))}
          </div>
        )}
      </div>

      {/* Previous review note */}
      {kyc.reviewNote && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="mb-1 text-[10px] font-mono uppercase tracking-widest text-amber-600">Previous review note</p>
          <p className="text-sm leading-relaxed text-amber-900">{kyc.reviewNote}</p>
        </div>
      )}

      {/* Action panel */}
      {canReview && (
        <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin Decision</p>

          {canStartReview && (
            <button
              disabled={busy}
              onClick={() => startReview({ userId: user.id }, { onSuccess: onDone })}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-sky-200 bg-sky-50 py-2.5 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-100 disabled:opacity-50"
            >
              {starting ? <Loader2 size={14} className="animate-spin" /> : <Hourglass size={14} />}
              {starting ? 'Starting review…' : 'Start Review'}
            </button>
          )}

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Note to user (required for rejection, optional for approval)…"
            className="w-full resize-none rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />

          <div className="flex gap-2">
            <button
              disabled={busy}
              onClick={() => review({ userId: user.id, decision: 'approve', note: note || undefined }, { onSuccess: onDone })}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {reviewing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              Approve
            </button>
            <button
              disabled={busy || !note.trim()}
              title={!note.trim() ? 'A note is required for rejection' : ''}
              onClick={() => review({ userId: user.id, decision: 'reject', note }, { onSuccess: onDone })}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
            >
              {reviewing ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
              Reject
            </button>
          </div>
          {!note.trim() && (
            <p className="text-[11px] text-gray-400">Add a note above to enable rejection.</p>
          )}
        </div>
      )}

      {/* Verified / expired info */}
      {(kycStatus === 'verified' || kycStatus === 'expired') && (
        <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium ${
          kycStatus === 'verified'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : 'border-orange-200 bg-orange-50 text-orange-800'
        }`}>
          {kycStatus === 'verified' ? <ShieldCheck size={15} /> : <ShieldAlert size={15} />}
          {kycStatus === 'verified'
            ? 'KYC is verified. No action required.'
            : 'KYC has expired. User needs to resubmit documents.'}
        </div>
      )}
    </div>
  );
}

// ── User row ──────────────────────────────────────────────────────────────────

function UserRow({ user }: { user: UserAccount }) {
  const [open, setOpen] = useState(false);
  const kycStatus = user.kycStatus as KycStatus;
  const needsAction = kycStatus === 'pending' || kycStatus === 'under_review';

  return (
    <div className={`rounded-xl border bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md ${
      needsAction ? 'border-amber-200' : 'border-gray-200'
    }`}>
      <button
        className="flex w-full items-center gap-4 p-4 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        {/* Avatar */}
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          needsAction
            ? 'bg-amber-100 text-amber-700'
            : 'bg-emerald-100 text-emerald-700'
        }`}>
          {avatar(user.name)}
        </div>

        {/* Identity */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">{user.name}</span>
            {needsAction && (
              <span className="rounded-full bg-amber-100 px-2 py-px text-[10px] font-bold text-amber-700 border border-amber-200">
                Action needed
              </span>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span>{user.email}</span>
            {user.phone && <span>· {user.phone}</span>}
            <span>· <span className="capitalize">{user.role.replace(/_/g, ' ').toLowerCase()}</span></span>
          </div>
        </div>

        {/* Badges */}
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <StatusBadge status={kycStatus} />
          <StatusBadge status={user.status} />
        </div>

        <div className="shrink-0 text-gray-400">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Mobile badges */}
      <div className="flex flex-wrap gap-2 px-4 pb-3 sm:hidden">
        <StatusBadge status={kycStatus} />
        <StatusBadge status={user.status} />
      </div>

      {/* Expanded panel */}
      {open && (
        <div className="border-t border-gray-100 px-4 pb-4">
          <ReviewPanel user={user} onDone={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminKycPage() {
  const { currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabStatus>('pending');
  const [search, setSearch] = useState('');

  const { data: allUsers = [], isLoading } = useUsers(
    activeTab === 'all' ? {} : { kycStatus: activeTab as KycStatus }
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return allUsers;
    const q = search.toLowerCase();
    return allUsers.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [allUsers, search]);

  if (!currentUser) return null;

  const actionNeeded = filtered.filter(
    (u) => u.kycStatus === 'pending' || u.kycStatus === 'under_review'
  ).length;

  return (
    <AdminPageLayout
      icon={BadgeCheck}
      label="Admin"
      title="KYC Management"
      maxWidth="max-w-5xl"
    >
      <div className="space-y-5">
        {/* Alert bar */}
        {actionNeeded > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <Clock size={15} className="shrink-0 text-amber-600" />
            <strong>{actionNeeded}</strong>&nbsp;submission{actionNeeded !== 1 ? 's' : ''} require review.
          </div>
        )}

        {/* Status tabs */}
        <div className="flex flex-wrap gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
          {TABS.map(({ key, label, icon: Icon }) => {
            const isActive = activeTab === key;
            const count = isActive ? allUsers.length : undefined;
            return (
              <button
                key={key}
                onClick={() => { setActiveTab(key); setSearch(''); }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
                }`}
              >
                <Icon size={12} />
                {label}
                {count != null && count > 0 && (
                  <span className={`ml-0.5 rounded-full px-1.5 py-px text-[10px] font-bold ${
                    isActive ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="h-10 w-full rounded-xl border border-gray-300 bg-white pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-emerald-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-16">
            <BadgeCheck className="h-10 w-10 text-gray-300" />
            <p className="mt-3 font-medium text-gray-700">
              {search
                ? 'No users match your search'
                : `No users with ${activeTab === 'all' ? 'any' : activeTab.replace('_', ' ')} KYC status`}
            </p>
            {activeTab === 'pending' && (
              <p className="mt-1 text-sm text-gray-400">All pending submissions have been reviewed.</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-400">
              {filtered.length} user{filtered.length !== 1 ? 's' : ''}
              {search ? ` matching "${search}"` : ''}
            </p>
            {filtered.map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
          </div>
        )}
      </div>
    </AdminPageLayout>
  );
}
