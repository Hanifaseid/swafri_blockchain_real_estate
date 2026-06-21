'use client';

import { useState } from 'react';
import { BadgeCheck, Clock, CheckCircle2, XCircle, Loader2, Link2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useUsers } from '@/features/users/queries/users.queries';
import {
  useAdminKycDetails,
  useReviewUserKyc,
  useAdminKycDocUrl,
  useStartKycReview,
} from '@/features/kyc/queries/kyc.admin.queries';
import {
  AdminPageLayout,
  AdminCard,
  AdminLoadingState,
  AdminEmptyState,
} from '@/components/admin/ui';
import { Button } from '@/components/ui/Button';

export default function AdminKycPage() {
  const { currentUser } = useAuthStore();
  if (!currentUser) return null;

  return (
    <AdminPageLayout icon={BadgeCheck} label="Admin" title="KYC Review Queue" maxWidth="max-w-4xl">
      <AdminKycQueue />
    </AdminPageLayout>
  );
}

function AdminKycQueue() {
  const { data: users = [], isLoading } = useUsers({ kycStatus: 'pending' as any });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  if (isLoading) return <AdminLoadingState />;

  if (users.length === 0) {
    return (
      <AdminCard>
        <AdminEmptyState
          icon={BadgeCheck}
          title="No pending KYC reviews"
          description="All submissions have been reviewed."
        />
      </AdminCard>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400 font-mono">
        {users.length} pending review{users.length !== 1 ? 's' : ''}
      </p>

      <AdminCard padding="none">
        {users.map((user, i) => (
          <div key={user.id}>
            <button
              type="button"
              onClick={() => setSelectedUserId(selectedUserId === user.id ? null : user.id)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-400 font-mono">{user.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                  Pending
                </span>
                <span className="text-xs text-emerald-600 font-medium">
                  {selectedUserId === user.id ? 'Close ↑' : 'Review →'}
                </span>
              </div>
            </button>

            {selectedUserId === user.id && (
              <div className="px-5 pb-5 bg-gray-50/50 border-t border-gray-100 pt-4">
                <AdminKycReview userId={user.id} onReviewed={() => setSelectedUserId(null)} />
              </div>
            )}

            {i < users.length - 1 && <div className="border-b border-gray-100" />}
          </div>
        ))}
      </AdminCard>
    </div>
  );
}

function AdminKycReview({ userId, onReviewed }: { userId: string; onReviewed: () => void }) {
  const { data: kycDetails, isLoading } = useAdminKycDetails(userId);
  const { mutate: startReview, isPending: starting } = useStartKycReview();
  const { mutate: review, isPending: reviewing } = useReviewUserKyc();
  const [note, setNote] = useState('');

  const busy = starting || reviewing;

  if (isLoading) return <AdminLoadingState size="sm" />;
  if (!kycDetails) return <p className="text-sm text-red-500">Failed to load KYC details.</p>;

  const isUnderReview = (kycDetails as any).kycStatus === 'under_review';

  return (
    <div className="space-y-5">
      {/* Documents */}
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-2">
          Submitted Documents
        </p>
        {kycDetails.documents.length === 0 ? (
          <p className="text-xs text-gray-400">No documents attached.</p>
        ) : (
          <div className="grid gap-2">
            {kycDetails.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
                <div>
                  <p className="text-xs font-medium text-gray-700">{doc.type.replace(/_/g, ' ')}</p>
                  <p className="text-[10px] font-mono text-gray-400">
                    {new Date(doc.uploadedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <KycDocLink userId={userId} docId={doc.id} />
              </div>
            ))}
          </div>
        )}
      </div>

      {kycDetails.reviewNote && (
        <div className="text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-lg p-3">
          Previous note: {kycDetails.reviewNote}
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Admin Decision</p>

        {!isUnderReview && (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center border-sky-200 text-sky-700 hover:bg-sky-50"
            loading={starting}
            disabled={busy}
            onClick={() => startReview({ userId }, { onSuccess: onReviewed })}
          >
            <Clock size={13} />
            Start Review
          </Button>
        )}

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note to the user (required for rejection)…"
          rows={2}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none"
        />

        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 justify-center"
            loading={reviewing}
            disabled={busy}
            onClick={() => review({ userId, decision: 'approve', note: note || undefined }, { onSuccess: onReviewed })}
          >
            <CheckCircle2 size={13} />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 justify-center border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40"
            loading={reviewing}
            disabled={busy || !note.trim()}
            title={!note.trim() ? 'A note is required for rejection' : ''}
            onClick={() => review({ userId, decision: 'reject', note }, { onSuccess: onReviewed })}
          >
            <XCircle size={13} />
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
}

function KycDocLink({ userId, docId }: { userId: string; docId: string }) {
  const { data: url, isLoading } = useAdminKycDocUrl(userId, docId);
  if (isLoading) return <Loader2 size={13} className="animate-spin text-emerald-500" />;
  if (!url) return <span className="text-[10px] text-red-500">Error</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors"
    >
      <Link2 size={12} /> View
    </a>
  );
}
