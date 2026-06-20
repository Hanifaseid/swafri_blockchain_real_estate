'use client';

import { useState } from 'react';
import {
  BadgeCheck, Clock, CheckCircle2, XCircle, Loader2, Link2,
} from 'lucide-react';

import { useAuthStore } from '@/stores/auth.store';
import { useUsers } from '@/features/users/queries/users.queries';
import {
  useAdminKycDetails,
  useReviewUserKyc,
  useAdminKycDocUrl,
  useStartKycReview,
} from '@/features/kyc/queries/kyc.admin.queries';

// ─── Admin KYC Page ───────────────────────────────────────────────────────────
// Shows the admin KYC review queue only.
// Personal KYC management is in the user's own /account pages.

export default function AdminKycPage() {
  const { currentUser } = useAuthStore();
  if (!currentUser) return null;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <BadgeCheck className="w-6 h-6 text-emerald-500 shrink-0" />
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">Admin</p>
          <h1 className="text-2xl font-light text-[#0f172a] tracking-tight">KYC Review Queue</h1>
        </div>
      </div>
      <AdminKycQueue />
    </div>
  );
}

// ─── Admin KYC Queue ──────────────────────────────────────────────────────────

function AdminKycQueue() {
  const { data: users = [], isLoading } = useUsers({ kycStatus: 'pending' as any });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <BadgeCheck className="w-10 h-10 text-black/15 mx-auto mb-3" />
          <p className="text-sm text-black/40 font-light">No pending KYC reviews.</p>
          <p className="text-xs text-black/30 mt-1">All submissions have been reviewed.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-black/35 font-mono">
            {users.length} pending review{users.length !== 1 ? 's' : ''}
          </p>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {users.map((user, i) => (
              <div key={user.id}>
                <button
                  type="button"
                  onClick={() => setSelectedUserId(selectedUserId === user.id ? null : user.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-black/80">{user.name}</p>
                    <p className="text-[10px] font-mono text-black/40">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200">
                      Pending
                    </span>
                    <span className="text-[10px] text-emerald-500 font-medium">
                      {selectedUserId === user.id ? 'Close ↑' : 'Review →'}
                    </span>
                  </div>
                </button>

                {selectedUserId === user.id && (
                  <div className="px-4 pb-5 bg-gray-50/50 border-t border-gray-100 pt-4">
                    <AdminKycReview
                      userId={user.id}
                      onReviewed={() => setSelectedUserId(null)}
                    />
                  </div>
                )}

                {i < users.length - 1 && <div className="border-b border-gray-100" />}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Admin KYC Review Panel ───────────────────────────────────────────────────

function AdminKycReview({
  userId,
  onReviewed,
}: {
  userId: string;
  onReviewed: () => void;
}) {
  const { data: kycDetails, isLoading } = useAdminKycDetails(userId);
  const { mutate: startReview, isPending: starting } = useStartKycReview();
  const { mutate: review, isPending: reviewing } = useReviewUserKyc();
  const [note, setNote] = useState('');

  const busy = starting || reviewing;

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!kycDetails) {
    return <p className="text-sm text-red-500">Failed to load KYC details.</p>;
  }

  const isUnderReview = (kycDetails as any).kycStatus === 'under_review';

  return (
    <div className="space-y-5">
      {/* Documents */}
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-2">
          Submitted Documents
        </p>
        {kycDetails.documents.length === 0 ? (
          <p className="text-xs text-black/40">No documents attached.</p>
        ) : (
          <div className="grid gap-2">
            {kycDetails.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3"
              >
                <div>
                  <p className="text-xs font-medium text-black/70">
                    {doc.type.replace(/_/g, ' ')}
                  </p>
                  <p className="text-[10px] font-mono text-black/40">
                    {new Date(doc.uploadedAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <KycDocLink userId={userId} docId={doc.id} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review note */}
      {kycDetails.reviewNote && (
        <div className="text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-xl p-3">
          Previous note: {kycDetails.reviewNote}
        </div>
      )}

      {/* Admin actions */}
      <div className="space-y-3 pt-1 border-t border-gray-100">
        <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">
          Admin Decision
        </p>

        {/* Step 1: Start Review (moves status to under_review) */}
        {!isUnderReview && (
          <button
            type="button"
            disabled={busy}
            onClick={() => startReview({ userId }, { onSuccess: onReviewed })}
            className="flex w-full justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
          >
            {starting ? <Loader2 size={13} className="animate-spin" /> : <Clock size={13} />}
            Start Review
          </button>
        )}

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note to the user (required for rejection)…"
          rows={2}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-black/70 placeholder:text-black/25 focus:outline-none focus:border-emerald-400 resize-none"
        />

        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              review(
                { userId, decision: 'approve', note: note || undefined },
                { onSuccess: onReviewed }
              )
            }
            className="flex-1 flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold py-2 rounded-xl transition-colors"
          >
            {reviewing ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
            Approve
          </button>
          <button
            type="button"
            disabled={busy || !note.trim()}
            onClick={() =>
              review(
                { userId, decision: 'reject', note },
                { onSuccess: onReviewed }
              )
            }
            title={!note.trim() ? 'A note is required for rejection' : ''}
            className="flex-1 flex justify-center items-center gap-2 bg-red-50 hover:bg-red-100 disabled:bg-gray-50 disabled:text-gray-400 text-red-600 text-xs font-semibold py-2 rounded-xl transition-colors"
          >
            {reviewing ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── KYC Doc Link ─────────────────────────────────────────────────────────────

function KycDocLink({ userId, docId }: { userId: string; docId: string }) {
  const { data: url, isLoading } = useAdminKycDocUrl(userId, docId);

  if (isLoading) return <Loader2 size={13} className="animate-spin text-emerald-500" />;
  if (!url) return <span className="text-[10px] text-red-500">Error</span>;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
    >
      <Link2 size={12} /> View
    </a>
  );
}
