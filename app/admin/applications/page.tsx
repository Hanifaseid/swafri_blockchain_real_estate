'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import {
  useMyRentalApplications,
  useAllRentalApplications,
  useReviewRentalApplication,
} from '@/features/rental-applications/queries/rental-application.queries';
import type { RentalApplication, RentalApplicationStatus } from '@/features/rental-applications/types/rental-application.types';
import { FileText, Calendar, ChevronDown, ChevronUp, CheckCircle2, XCircle, Search as SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AdminPageLayout,
  AdminCard,
  AdminFilterBar,
  AdminLoadingState,
  AdminEmptyState,
  StatusBadge,
} from '@/components/admin/ui';
import { Button } from '@/components/ui/Button';

function formatStatus(status: RentalApplicationStatus) {
  return status.replace(/_/g, ' ');
}

// ─── Admin Queue ──────────────────────────────────────────────────────────────

function AdminApplicationsView() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data: applications = [], isLoading } = useAllRentalApplications(
    statusFilter ? { status: statusFilter } : undefined
  );
  const { mutate: review, isPending: reviewing } = useReviewRentalApplication();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'screening', label: 'Screening' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'lease_created', label: 'Lease Created' },
  ];

  return (
    <div className="space-y-5">
      <AdminFilterBar
        filters={[{
          key: 'status',
          label: 'Status',
          value: statusFilter,
          onChange: setStatusFilter,
          options: statusOptions,
        }]}
        onClear={() => setStatusFilter('')}
      />

      {isLoading ? <AdminLoadingState /> :
       applications.length === 0 ? (
        <AdminCard>
          <AdminEmptyState icon={FileText} title="No rental applications found" />
        </AdminCard>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-400 font-mono">
            {applications.length} application{applications.length !== 1 ? 's' : ''}
          </p>
          {applications.map((app) => {
            const listingTitle = typeof app.listing === 'string' ? null : app.listing?.title;
            const tenantName = typeof app.tenant === 'string' ? app.tenant : app.tenant?.name ?? app.tenant?.email;
            const isExpanded = expandedId === app.id;
            const note = noteMap[app.id] ?? '';
            const canReview = app.status === 'submitted' || app.status === 'screening';

            return (
              <AdminCard key={app.id} padding="none">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : app.id)}
                  className="w-full flex items-start justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <StatusBadge status={app.status} />
                      <span className="text-[10px] font-mono text-gray-400">#{app.id.slice(-6)}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {listingTitle ?? `Listing ${app.listingId}`}
                    </p>
                    {tenantName && <p className="text-xs text-gray-400 mt-0.5">Tenant: {tenantName}</p>}
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar size={12} /> {app.desiredStartDate}
                    </span>
                    {isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
                      <div>
                        <span className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Monthly Income</span>
                        ${app.monthlyIncome.toLocaleString()}
                      </div>
                      <div>
                        <span className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Occupants</span>
                        {app.occupants}
                      </div>
                      {app.employer && (
                        <div>
                          <span className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Employer</span>
                          {app.employer}
                        </div>
                      )}
                      <div>
                        <span className="block text-[10px] font-mono uppercase text-gray-400 mb-1">End Date</span>
                        {app.desiredEndDate}
                      </div>
                    </div>

                    {app.message && (
                      <div>
                        <p className="text-[10px] font-mono uppercase text-gray-400 mb-1">Applicant Message</p>
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 leading-relaxed">{app.message}</p>
                      </div>
                    )}

                    {app.reviewNote && (
                      <div className="text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-lg p-3">
                        Previous review note: {app.reviewNote}
                      </div>
                    )}

                    {canReview && (
                      <div className="space-y-3 pt-2 border-t border-gray-100">
                        <p className="text-[10px] font-mono uppercase text-gray-400">Admin Decision</p>
                        <textarea
                          value={note}
                          onChange={(e) => setNoteMap((prev) => ({ ...prev, [app.id]: e.target.value }))}
                          rows={2}
                          placeholder="Optional note to the applicant…"
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 justify-center" loading={reviewing}
                            onClick={() => review({ id: app.id, payload: { status: 'approved', note: note || undefined } }, { onSuccess: () => setExpandedId(null) })}>
                            <CheckCircle2 size={13} /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 justify-center border-sky-200 text-sky-700 hover:bg-sky-50" loading={reviewing}
                            onClick={() => review({ id: app.id, payload: { status: 'screening', note: note || undefined } }, { onSuccess: () => setExpandedId(null) })}>
                            <SearchIcon size={13} /> Screening
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 justify-center border-red-200 text-red-600 hover:bg-red-50" loading={reviewing}
                            onClick={() => review({ id: app.id, payload: { status: 'rejected', note: note || undefined } }, { onSuccess: () => setExpandedId(null) })}>
                            <XCircle size={13} /> Reject
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </AdminCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── User / Tenant View ───────────────────────────────────────────────────────

function UserApplicationsView() {
  const { currentUser } = useAuthStore();
  const { data: applications = [], isLoading } = useMyRentalApplications(!!currentUser);

  if (isLoading) return <AdminLoadingState />;

  if (applications.length === 0) {
    return (
      <AdminCard>
        <AdminEmptyState icon={FileText} title="No rental applications yet" />
      </AdminCard>
    );
  }

  return (
    <div className="grid gap-4">
      {applications.map((app) => {
        const listingTitle = typeof app.listing === 'string' ? null : app.listing?.title;
        return (
          <AdminCard key={app.id}>
            <div className="flex justify-between items-start mb-3 gap-3">
              <div>
                <h3 className="font-medium text-gray-800">Application #{app.id.slice(-6)}</h3>
                <p className="text-xs text-gray-400">{listingTitle ? `For ${listingTitle}` : `For Listing: ${app.listingId}`}</p>
              </div>
              <StatusBadge status={app.status} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
              <div>
                <span className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Start Date</span>
                <div className="flex items-center gap-1.5"><Calendar size={13} /> {app.desiredStartDate}</div>
              </div>
              <div>
                <span className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Occupants</span>
                {app.occupants}
              </div>
              <div>
                <span className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Monthly Income</span>
                ${app.monthlyIncome.toLocaleString()}
              </div>
              <div className="flex items-center justify-end">
                <Link href={`/applications/${app.id}`} className="text-xs font-medium text-emerald-600 hover:text-emerald-700">
                  View Details →
                </Link>
              </div>
            </div>
          </AdminCard>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApplicationsPage() {
  const { currentUser } = useAuthStore();
  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';

  return (
    <AdminPageLayout
      icon={FileText}
      label={isAdmin ? 'Admin' : 'Overview'}
      title="Rental Applications"
      maxWidth="max-w-5xl"
    >
      {isAdmin ? <AdminApplicationsView /> : <UserApplicationsView />}
    </AdminPageLayout>
  );
}
