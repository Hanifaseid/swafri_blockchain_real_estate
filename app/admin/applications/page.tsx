'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import {
  useMyRentalApplications,
  useAllRentalApplications,
  useReviewRentalApplication,
} from '@/features/rental-applications/queries/rental-application.queries';
import type {
  RentalApplication,
  RentalApplicationStatus,
} from '@/features/rental-applications/types/rental-application.types';
import { FileText, Loader2, Calendar, ChevronDown, ChevronUp, CheckCircle2, XCircle, Search as SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatStatus(status: RentalApplicationStatus) {
  return status.replace(/_/g, ' ');
}

function statusClass(status: RentalApplicationStatus) {
  switch (status) {
    case 'approved':
    case 'lease_created':
      return 'bg-emerald-50 text-emerald-700';
    case 'rejected':
    case 'withdrawn':
      return 'bg-red-50 text-red-700';
    case 'screening':
      return 'bg-blue-50 text-blue-700';
    default:
      return 'bg-amber-50 text-amber-700';
  }
}

// ─── Admin Queue View ─────────────────────────────────────────────────────────
// Shown to ADMIN and SUPER_ADMIN — lists ALL platform applications with review actions.

function AdminApplicationsView() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data: applications = [], isLoading } = useAllRentalApplications(
    statusFilter ? { status: statusFilter } : undefined
  );
  const { mutate: review, isPending: reviewing } = useReviewRentalApplication();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});

  return (
    <div>
      {/* Filter */}
      <div className="flex items-center gap-3 mb-5">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border border-gray-200 px-3 text-sm text-black/70 bg-white focus:outline-none focus:border-emerald-400"
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="screening">Screening</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="lease_created">Lease Created</option>
        </select>
        {statusFilter && (
          <button
            type="button"
            onClick={() => setStatusFilter('')}
            className="text-xs text-black/40 hover:text-black/60 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <FileText className="w-10 h-10 text-black/15 mx-auto mb-3" />
          <p className="text-sm text-black/40 font-light">No rental applications found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-black/35 font-mono">{applications.length} application{applications.length !== 1 ? 's' : ''}</p>
          {applications.map((app) => {
            const listingTitle =
              typeof app.listing === 'string' ? null : app.listing?.title;
            const tenantName =
              typeof app.tenant === 'string' ? app.tenant : app.tenant?.name ?? app.tenant?.email;
            const isExpanded = expandedId === app.id;
            const note = noteMap[app.id] ?? '';
            const canReview = app.status === 'submitted' || app.status === 'screening';

            return (
              <div
                key={app.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
              >
                {/* Row header — click to expand */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : app.id)}
                  className="w-full flex items-start justify-between p-5 text-left hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={cn(
                          'px-2.5 py-0.5 text-[10px] font-mono uppercase rounded-lg',
                          statusClass(app.status)
                        )}
                      >
                        {formatStatus(app.status)}
                      </span>
                      <span className="text-[10px] font-mono text-black/30">#{app.id.slice(-6)}</span>
                    </div>
                    <p className="text-sm font-medium text-black/80 truncate">
                      {listingTitle ?? `Listing ${app.listingId}`}
                    </p>
                    {tenantName && (
                      <p className="text-xs text-black/40 mt-0.5">Tenant: {tenantName}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs text-black/40">
                      <Calendar size={12} />
                      {app.desiredStartDate}
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={14} className="text-black/30" />
                    ) : (
                      <ChevronDown size={14} className="text-black/30" />
                    )}
                  </div>
                </button>

                {/* Expanded detail + review actions */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                    {/* Application details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-black/60">
                      <div>
                        <span className="block text-[10px] font-mono uppercase text-black/30 mb-1">
                          Monthly Income
                        </span>
                        ${app.monthlyIncome.toLocaleString()}
                      </div>
                      <div>
                        <span className="block text-[10px] font-mono uppercase text-black/30 mb-1">
                          Occupants
                        </span>
                        {app.occupants}
                      </div>
                      {app.employer && (
                        <div>
                          <span className="block text-[10px] font-mono uppercase text-black/30 mb-1">
                            Employer
                          </span>
                          {app.employer}
                        </div>
                      )}
                      <div>
                        <span className="block text-[10px] font-mono uppercase text-black/30 mb-1">
                          End Date
                        </span>
                        {app.desiredEndDate}
                      </div>
                    </div>

                    {app.message && (
                      <div>
                        <p className="text-[10px] font-mono uppercase text-black/30 mb-1">
                          Applicant Message
                        </p>
                        <p className="text-sm text-black/60 bg-gray-50 rounded-xl p-3 leading-relaxed">
                          {app.message}
                        </p>
                      </div>
                    )}

                    {app.reviewNote && (
                      <div className="text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-xl p-3">
                        Previous review note: {app.reviewNote}
                      </div>
                    )}

                    {/* Admin review actions */}
                    {canReview && (
                      <div className="space-y-3 pt-2 border-t border-gray-100">
                        <p className="text-[10px] font-mono uppercase text-black/30">Admin Decision</p>
                        <textarea
                          value={note}
                          onChange={(e) =>
                            setNoteMap((prev) => ({ ...prev, [app.id]: e.target.value }))
                          }
                          rows={2}
                          placeholder="Optional note to the applicant…"
                          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-black/70 placeholder:text-black/25 focus:outline-none focus:border-emerald-400 resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={reviewing}
                            onClick={() =>
                              review(
                                { id: app.id, payload: { status: 'approved', note: note || undefined } },
                                { onSuccess: () => setExpandedId(null) }
                              )
                            }
                            className="flex-1 flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold py-2 rounded-xl transition-colors"
                          >
                            {reviewing ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={13} />
                            )}
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={reviewing}
                            onClick={() =>
                              review(
                                { id: app.id, payload: { status: 'screening', note: note || undefined } },
                                { onSuccess: () => setExpandedId(null) }
                              )
                            }
                            className="flex-1 flex justify-center items-center gap-2 bg-blue-50 hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 text-blue-600 text-xs font-semibold py-2 rounded-xl transition-colors"
                          >
                            {reviewing ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <SearchIcon size={13} />
                            )}
                            Move to Screening
                          </button>
                          <button
                            type="button"
                            disabled={reviewing}
                            onClick={() =>
                              review(
                                { id: app.id, payload: { status: 'rejected', note: note || undefined } },
                                { onSuccess: () => setExpandedId(null) }
                              )
                            }
                            className="flex-1 flex justify-center items-center gap-2 bg-red-50 hover:bg-red-100 disabled:bg-gray-50 disabled:text-gray-400 text-red-600 text-xs font-semibold py-2 rounded-xl transition-colors"
                          >
                            {reviewing ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <XCircle size={13} />
                            )}
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Non-admin View ───────────────────────────────────────────────────────────
// Shown to PROPERTY_OWNER / TENANT — unchanged from before.

function UserApplicationsView() {
  const { currentUser } = useAuthStore();
  const { data: applications = [], isLoading } = useMyRentalApplications(!!currentUser);
  const isTenant = currentUser?.role === 'TENANT';

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
        <FileText className="w-10 h-10 text-black/15 mx-auto mb-3" />
        <p className="text-sm text-black/40 font-light">
          {isTenant
            ? "You haven't submitted any rental applications yet."
            : "You don't have any rental applications yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {applications.map((app) => {
        const listingTitle = typeof app.listing === 'string' ? null : app.listing?.title;
        return (
          <div
            key={app.id}
            className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3 gap-3">
              <div>
                <h3 className="font-medium text-black/80">Application #{app.id.slice(-6)}</h3>
                <p className="text-xs text-black/40">
                  {listingTitle ? `For ${listingTitle}` : `For Listing: ${app.listingId}`}
                </p>
              </div>
              <span
                className={cn(
                  'px-2.5 py-1 text-[10px] font-mono uppercase rounded-lg',
                  statusClass(app.status)
                )}
              >
                {formatStatus(app.status)}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-black/60">
              <div>
                <span className="block text-[10px] font-mono uppercase text-black/30 mb-1">
                  Start Date
                </span>
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} /> {app.desiredStartDate}
                </div>
              </div>
              <div>
                <span className="block text-[10px] font-mono uppercase text-black/30 mb-1">
                  Occupants
                </span>
                {app.occupants}
              </div>
              <div>
                <span className="block text-[10px] font-mono uppercase text-black/30 mb-1">
                  Monthly Income
                </span>
                ${app.monthlyIncome.toLocaleString()}
              </div>
              <div className="flex items-center justify-end">
                <Link
                  href={`/applications/${app.id}`}
                  className="text-emerald-600 font-medium hover:text-emerald-700"
                >
                  View Details →
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApplicationsPage() {
  const { currentUser } = useAuthStore();
  if (!currentUser) return null;

  const isAdmin =
    currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <FileText className="w-6 h-6 text-emerald-500" />
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">
            {isAdmin ? 'Admin' : 'Overview'}
          </p>
          <h1 className="text-2xl font-light text-[#0f172a] tracking-tight">
            Rental Applications
          </h1>
        </div>
      </div>

      {isAdmin ? <AdminApplicationsView /> : <UserApplicationsView />}
    </div>
  );
}
