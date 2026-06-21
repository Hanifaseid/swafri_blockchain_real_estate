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
  RotateCcw,
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
import type { UserAccount, KycStatus } from '@/features/users/types/user.types';
import type { KycDocument } from '@/features/kyc/services/kyc.service';

// ── Status config ─────────────────────────────────────────────────────────────

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

const KYC_BADGE: Record<KycStatus, { label: string; bg: string; text: string }> = {
  not_started:  { label: 'Not Started',  bg: 'bg-white/8',         text: 'text-white/40' },
  pending:      { label: 'Pending',      bg: 'bg-amber-500/15',    text: 'text-amber-300' },
  under_review: { label: 'Under Review', bg: 'bg-blue-500/15',     text: 'text-blue-300' },
  verified:     { label: 'Verified',     bg: 'bg-emerald-500/15',  text: 'text-emerald-400' },
  rejected:     { label: 'Rejected',     bg: 'bg-red-500/15',      text: 'text-red-400' },
  expired:      { label: 'Expired',      bg: 'bg-orange-500/15',   text: 'text-orange-300' },
};

const ACCOUNT_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  ACTIVE:    { label: 'Active',    bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  PENDING:   { label: 'Pending',   bg: 'bg-amber-500/15',  text: 'text-amber-300' },
  SUSPENDED: { label: 'Suspended', bg: 'bg-red-500/15',    text: 'text-red-400' },
  BLOCKED:   { label: 'Blocked',   bg: 'bg-red-700/20',    text: 'text-red-500' },
  REJECTED:  { label: 'Rejected',  bg: 'bg-white/8',       text: 'text-white/40' },
};

const DOC_TYPE_LABEL: Record<string, string> = {
  national_id:      'National ID',
  passport:         'Passport',
  drivers_license:  'Driver\'s License',
  other:            'Other Document',
};

const DOC_STATUS_BADGE: Record<string, { bg: string; text: string }> = {
  pending:  { bg: 'bg-amber-500/15', text: 'text-amber-300' },
  approved: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  rejected: { bg: 'bg-red-500/15', text: 'text-red-400' },
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

// ── Smaller components ────────────────────────────────────────────────────────

function KycBadge({ status }: { status: KycStatus }) {
  const b = KYC_BADGE[status] ?? KYC_BADGE.not_started;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${b.bg} ${b.text}`}>
      {b.label}
    </span>
  );
}

function AccountBadge({ status }: { status: string }) {
  const b = ACCOUNT_BADGE[status] ?? ACCOUNT_BADGE.PENDING;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${b.bg} ${b.text}`}>
      {b.label}
    </span>
  );
}

function DocLink({ userId, doc }: { userId: string; doc: KycDocument }) {
  const { data: url, isLoading } = useAdminKycDocUrl(userId, doc.id);
  const db = DOC_STATUS_BADGE[doc.status] ?? DOC_STATUS_BADGE.pending;

  return (
    <div className="flex items-center justify-between rounded-xl border border-(--color-dash-border) bg-(--color-dash-card) p-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
          <FileText size={14} className="text-white/40" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">
            {DOC_TYPE_LABEL[doc.type] ?? doc.type.replace(/_/g, ' ')}
          </p>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-white/40">
            <span>Uploaded {relativeDate(doc.uploadedAt)}</span>
            <span className={`rounded-full px-2 py-px text-[10px] font-semibold ${db.bg} ${db.text}`}>
              {doc.status}
            </span>
          </div>
        </div>
      </div>
      {isLoading ? (
        <Loader2 size={14} className="shrink-0 animate-spin text-white/30" />
      ) : url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="ml-3 flex shrink-0 items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20"
        >
          <ExternalLink size={11} /> View
        </a>
      ) : (
        <span className="ml-3 text-xs text-red-400">Unavailable</span>
      )}
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
        <Loader2 size={20} className="animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!kyc) {
    return <p className="py-4 text-sm text-red-400">Failed to load KYC details.</p>;
  }

  return (
    <div className="space-y-5 pt-4">
      {/* KYC + Account status summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoTile label="KYC status"     value={<KycBadge status={kycStatus as KycStatus} />} />
        <InfoTile label="Account status" value={<AccountBadge status={user.status} />} />
        <InfoTile label="Role"           value={<span className="text-sm font-medium text-white">{user.role.replace('_', ' ')}</span>} />
        <InfoTile label="Registered"     value={<span className="text-sm text-white/60">{relativeDate(user.createdAt)}</span>} />
      </div>

      {/* Documents */}
      <div>
        <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-white/40">
          Submitted Documents ({kyc.documents.length})
        </p>
        {kyc.documents.length === 0 ? (
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-white/10 px-4 py-5 text-sm text-white/30">
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
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 p-4">
          <p className="mb-1 text-[10px] font-mono uppercase tracking-widest text-amber-400/60">Previous review note</p>
          <p className="text-sm leading-relaxed text-white/70">{kyc.reviewNote}</p>
        </div>
      )}

      {/* Actions */}
      {canReview && (
        <div className="space-y-3 rounded-xl border border-(--color-dash-border) p-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">Admin decision</p>

          {canStartReview && (
            <button
              disabled={busy}
              onClick={() => startReview({ userId: user.id }, { onSuccess: onDone })}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 py-2.5 text-sm font-semibold text-blue-300 transition-colors hover:bg-blue-500/20 disabled:opacity-40"
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
            className="w-full resize-none rounded-xl border border-(--color-dash-border) bg-(--color-dash-input,#1a1a2e) p-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/60 transition-colors"
          />

          <div className="flex gap-2">
            <button
              disabled={busy}
              onClick={() => review({ userId: user.id, decision: 'approve', note: note || undefined }, { onSuccess: onDone })}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-40"
            >
              {reviewing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              Approve
            </button>
            <button
              disabled={busy || !note.trim()}
              title={!note.trim() ? 'A note is required for rejection' : ''}
              onClick={() => review({ userId: user.id, decision: 'reject', note }, { onSuccess: onDone })}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-40"
            >
              {reviewing ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
              Reject
            </button>
          </div>
          {!note.trim() && (
            <p className="text-[11px] text-white/30">Add a note above to enable rejection.</p>
          )}
        </div>
      )}

      {/* Verified / expired view */}
      {(kycStatus === 'verified' || kycStatus === 'expired') && (
        <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
          kycStatus === 'verified'
            ? 'border-emerald-500/20 bg-emerald-500/8 text-emerald-300'
            : 'border-orange-500/20 bg-orange-500/8 text-orange-300'
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

function InfoTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-(--color-dash-border) bg-(--color-dash-card) p-3">
      <p className="text-[10px] font-mono uppercase tracking-widest text-white/30">{label}</p>
      <div className="mt-1.5">{value}</div>
    </div>
  );
}

// ── User row ─────────────────────────────────────────────────────────────────

function UserRow({ user }: { user: UserAccount }) {
  const [open, setOpen] = useState(false);

  const kycStatus = user.kycStatus as KycStatus;
  const needsAction = kycStatus === 'pending' || kycStatus === 'under_review';

  return (
    <div className={`rounded-2xl border transition-colors ${
      needsAction
        ? 'border-amber-500/25 bg-(--color-dash-card)'
        : 'border-(--color-dash-border) bg-(--color-dash-card)'
    }`}>
      {/* Header row */}
      <button
        className="flex w-full items-center gap-4 p-4 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        {/* Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-bold text-emerald-400">
          {avatar(user.name)}
        </div>

        {/* Identity */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-white">{user.name}</span>
            {needsAction && (
              <span className="rounded-full bg-amber-500/15 px-2 py-px text-[10px] font-bold text-amber-300">
                Action needed
              </span>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-white/40">
            <span>{user.email}</span>
            {user.phone && <span>· {user.phone}</span>}
            <span>· {user.role.replace(/_/g, ' ')}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <KycBadge status={kycStatus} />
          <AccountBadge status={user.status} />
        </div>

        <div className="shrink-0 text-white/30">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Mobile badges */}
      <div className="flex flex-wrap gap-2 px-4 pb-2 sm:hidden">
        <KycBadge status={kycStatus} />
        <AccountBadge status={user.status} />
      </div>

      {/* Expanded review panel */}
      {open && (
        <div className="border-t border-(--color-dash-border) px-4 pb-4">
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
    activeTab === 'all' ? {} : { kycStatus: activeTab as any }
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return allUsers;
    const q = search.toLowerCase();
    return allUsers.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [allUsers, search]);

  const tabCounts = useMemo(() => {
    const counts: Partial<Record<TabStatus, number>> = {};
    counts[activeTab] = allUsers.length;
    return counts;
  }, [allUsers, activeTab]);

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
        {/* Summary bar */}
        {actionNeeded > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-sm text-amber-300">
            <Clock size={15} className="shrink-0" />
            <strong>{actionNeeded}</strong>&nbsp;submission{actionNeeded !== 1 ? 's' : ''} require review.
          </div>
        )}

        {/* Status tabs */}
        <div className="flex flex-wrap gap-1 rounded-xl border border-(--color-dash-border) bg-(--color-dash-card) p-1">
          {TABS.map(({ key, label, icon: Icon }) => {
            const count = tabCounts[key];
            return (
              <button
                key={key}
                onClick={() => { setActiveTab(key); setSearch(''); }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  activeTab === key
                    ? 'bg-(--color-dash-highlight,#1e2033) text-white'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <Icon size={12} />
                {label}
                {count != null && count > 0 && (
                  <span className={`ml-0.5 rounded-full px-1.5 text-[10px] font-bold ${
                    activeTab === key ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/40'
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
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="h-10 w-full rounded-xl border border-(--color-dash-border) bg-(--color-dash-card) pl-9 pr-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/60 transition-colors"
          />
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-emerald-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-(--color-dash-border) bg-(--color-dash-card) py-16">
            <BadgeCheck className="h-10 w-10 text-emerald-400/30" />
            <p className="mt-3 font-medium text-white">
              {search ? 'No users match your search' : `No users with ${activeTab === 'all' ? 'any' : activeTab.replace('_', ' ')} KYC status`}
            </p>
            <p className="mt-1 text-sm text-white/30">
              {activeTab === 'pending' ? 'All pending submissions have been reviewed.' : ''}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-white/30">
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
