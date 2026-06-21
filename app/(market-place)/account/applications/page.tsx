'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ClipboardList, ChevronDown, ChevronUp, Calendar, Building2, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  useMyRentalApplications,
  useWithdrawRentalApplication,
  useReviewRentalApplication,
  useUpdateScreening,
  useUpdateAppointment,
  useCreateLeaseFromApplication,
} from '@/features/rental-applications/queries/rental-application.queries';
import { useAuthStore } from '@/stores/auth.store';
import type {
  RentalApplication,
  RentalApplicationStatus,
} from '@/features/rental-applications/types/rental-application.types';

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<RentalApplicationStatus, { label: string; cls: string }> = {
  submitted:    { label: 'Submitted',     cls: 'bg-amber-400/15 text-amber-300 border-amber-400/30' },
  screening:    { label: 'Screening',     cls: 'bg-blue-400/15 text-blue-300 border-blue-400/30' },
  approved:     { label: 'Approved',      cls: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30' },
  rejected:     { label: 'Rejected',      cls: 'bg-red-400/15 text-red-300 border-red-400/30' },
  withdrawn:    { label: 'Withdrawn',     cls: 'bg-white/10 text-white/50 border-white/15' },
  lease_created:{ label: 'Lease Created', cls: 'bg-purple-400/15 text-purple-300 border-purple-400/30' },
};

function StatusBadge({ status }: { status: RentalApplicationStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.submitted;
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ─── Tenant card ─────────────────────────────────────────────────────────────

function SentApplicationCard({ app }: { app: RentalApplication }) {
  const withdraw = useWithdrawRentalApplication();
  const updateAppt = useUpdateAppointment();

  const canWithdraw = (['submitted', 'screening', 'approved'] as RentalApplicationStatus[]).includes(app.status);
  const listingTitle = typeof app.listing === 'object' ? app.listing?.title : undefined;
  const listingId = app.listingId;

  const apptStatus = app.appointment?.status;
  const canRequestAppt = app.status === 'screening' && !app.appointment;
  const canCancelAppt =
    app.status === 'screening' &&
    apptStatus !== undefined &&
    apptStatus !== 'cancelled' &&
    apptStatus !== 'completed';

  return (
    <div className="rounded-lg border border-border-primary bg-surface-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 shrink-0 text-white/40" />
            <span className="font-semibold text-white">{listingTitle ?? 'Rental Application'}</span>
          </div>
          <p className="pl-6 text-sm text-text-muted">
            {app.desiredStartDate && new Date(app.desiredStartDate).toLocaleDateString()}
            {app.desiredEndDate && ` – ${new Date(app.desiredEndDate).toLocaleDateString()}`}
            {app.occupants > 0 && ` · ${app.occupants} occupant${app.occupants !== 1 ? 's' : ''}`}
          </p>
        </div>
        <StatusBadge status={app.status} />
      </div>

      {app.screening && (
        <p className="mt-3 pl-6 text-sm text-text-muted">
          Screening:{' '}
          <span className="capitalize text-white/70">
            {app.screening.status?.replace(/_/g, ' ')}
          </span>
          {app.screening.score != null && ` · Score ${app.screening.score}`}
        </p>
      )}

      {app.appointment && (
        <div className="mt-2 flex items-center gap-1.5 pl-6 text-sm text-text-muted">
          <Calendar className="h-3.5 w-3.5 text-blue-300" />
          <span>
            Viewing{' '}
            <span className="capitalize text-blue-300">
              {app.appointment.status?.replace(/_/g, ' ')}
            </span>
            {app.appointment.scheduledFor && (
              <>
                {' '}—{' '}
                {new Date(app.appointment.scheduledFor).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </>
            )}
            {app.appointment.locationNote && ` · ${app.appointment.locationNote}`}
          </span>
        </div>
      )}

      {app.reviewNote && (
        <p className="mt-2 pl-6 text-sm italic text-white/50">"{app.reviewNote}"</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3 pl-6">
        {listingId && (
          <Link href={`/listings/${listingId}`} className="text-sm font-medium text-accent-400 hover:underline">
            View listing
          </Link>
        )}
        {canRequestAppt && (
          <Button
            size="sm"
            variant="outline"
            loading={updateAppt.isPending}
            onClick={() => updateAppt.mutate({ id: app.id, payload: { status: 'requested' } })}
          >
            Request viewing
          </Button>
        )}
        {canCancelAppt && (
          <Button
            size="sm"
            variant="outline"
            loading={updateAppt.isPending}
            onClick={() => updateAppt.mutate({ id: app.id, payload: { status: 'cancelled' } })}
          >
            Cancel viewing
          </Button>
        )}
        {canWithdraw && (
          <Button
            size="sm"
            variant="outline"
            className="border-red-400/40 text-red-400 hover:bg-red-400/10"
            loading={withdraw.isPending}
            onClick={() => withdraw.mutate(app.id)}
          >
            Withdraw
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Owner card ───────────────────────────────────────────────────────────────

type OwnerMode = 'idle' | 'reject' | 'screening' | 'appointment' | 'lease';

function ReceivedApplicationCard({ app }: { app: RentalApplication }) {
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<OwnerMode>('idle');

  const review = useReviewRentalApplication();
  const updateScreeningMut = useUpdateScreening();
  const updateAppt = useUpdateAppointment();
  const createLease = useCreateLeaseFromApplication();

  const [reviewNote, setReviewNote] = useState('');
  const [screeningForm, setScreeningForm] = useState({
    status: (app.screening?.status && app.screening.status !== 'not_started'
      ? app.screening.status
      : 'pending') as 'pending' | 'passed' | 'failed' | 'manual_review',
    provider: app.screening?.provider ?? '',
    reference: app.screening?.reference ?? '',
    score: app.screening?.score?.toString() ?? '',
    notes: app.screening?.notes ?? '',
  });
  const [apptForm, setApptForm] = useState({
    status: 'scheduled' as 'scheduled' | 'rescheduled' | 'cancelled' | 'completed',
    scheduledFor: app.appointment?.scheduledFor?.split('.')[0] ?? '',
    locationNote: app.appointment?.locationNote ?? '',
    note: app.appointment?.note ?? '',
  });
  const [leaseForm, setLeaseForm] = useState({
    monthlyRent: '',
    depositAmount: '',
    currency: 'ETB',
    startDate: app.desiredStartDate?.split('T')[0] ?? '',
    endDate: app.desiredEndDate?.split('T')[0] ?? '',
    terms: '',
  });

  const tenantUser = typeof app.tenant === 'object' ? app.tenant : null;
  const listingTitle = typeof app.listing === 'object' ? app.listing?.title : 'Property';
  const listingId = app.listingId;
  const isTerminal = (['rejected', 'withdrawn', 'lease_created'] as RentalApplicationStatus[]).includes(app.status);
  const needsAction = (['submitted', 'screening'] as RentalApplicationStatus[]).includes(app.status);

  function handleReview(status: 'screening' | 'approved' | 'rejected') {
    review.mutate(
      { id: app.id, payload: { status, note: reviewNote || undefined } },
      { onSuccess: () => { setMode('idle'); setReviewNote(''); } }
    );
  }

  function handleScreeningSubmit() {
    updateScreeningMut.mutate(
      {
        id: app.id,
        payload: {
          status: screeningForm.status,
          provider: screeningForm.provider || undefined,
          reference: screeningForm.reference || undefined,
          score: screeningForm.score ? Number(screeningForm.score) : undefined,
          notes: screeningForm.notes || undefined,
        },
      },
      { onSuccess: () => setMode('idle') }
    );
  }

  function handleApptSubmit() {
    updateAppt.mutate(
      {
        id: app.id,
        payload: {
          status: apptForm.status,
          scheduledFor: apptForm.scheduledFor || undefined,
          locationNote: apptForm.locationNote || undefined,
          note: apptForm.note || undefined,
        },
      },
      { onSuccess: () => setMode('idle') }
    );
  }

  function handleLeaseSubmit() {
    if (!leaseForm.monthlyRent || !leaseForm.depositAmount || !leaseForm.startDate || !leaseForm.endDate) return;
    createLease.mutate(
      {
        id: app.id,
        payload: {
          monthlyRent: Number(leaseForm.monthlyRent),
          depositAmount: Number(leaseForm.depositAmount),
          currency: leaseForm.currency,
          startDate: leaseForm.startDate,
          endDate: leaseForm.endDate,
          terms: leaseForm.terms || undefined,
        },
      },
      { onSuccess: () => setMode('idle') }
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-lg border bg-surface-card ${
        needsAction ? 'border-accent-400/40' : 'border-border-primary'
      }`}
    >
      {/* Header — always visible, click to expand */}
      <button className="w-full p-5 text-left" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 shrink-0 text-white/40" />
              <span className="font-semibold text-white">
                {tenantUser?.name ?? tenantUser?.email ?? 'Applicant'}
              </span>
              {needsAction && (
                <span className="rounded bg-accent-400/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-400">
                  Action needed
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-6 text-sm text-text-muted">
              <span>{listingTitle}</span>
              {app.occupants > 0 && (
                <span>{app.occupants} occupant{app.occupants !== 1 ? 's' : ''}</span>
              )}
              {app.monthlyIncome > 0 && (
                <span>Income ${app.monthlyIncome.toLocaleString()}/mo</span>
              )}
              {app.desiredStartDate && (
                <span>From {new Date(app.desiredStartDate).toLocaleDateString()}</span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <StatusBadge status={app.status} />
            {expanded
              ? <ChevronUp className="h-4 w-4 text-white/40" />
              : <ChevronDown className="h-4 w-4 text-white/40" />}
          </div>
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="space-y-5 border-t border-border-primary px-5 pb-5">
          {/* Applicant message */}
          {app.message && (
            <div className="pt-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/40">
                Message
              </p>
              <p className="text-sm leading-relaxed text-white/70">"{app.message}"</p>
            </div>
          )}

          {/* Screening details */}
          {app.screening && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/40">
                Screening
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="capitalize text-blue-300">
                  {app.screening.status?.replace(/_/g, ' ')}
                </span>
                {app.screening.provider && (
                  <span className="text-white/60">via {app.screening.provider}</span>
                )}
                {app.screening.score != null && (
                  <span className="text-white/60">Score: {app.screening.score}</span>
                )}
                {app.screening.reference && (
                  <span className="text-white/60">Ref: {app.screening.reference}</span>
                )}
              </div>
              {app.screening.notes && (
                <p className="mt-1 text-sm italic text-white/50">{app.screening.notes}</p>
              )}
            </div>
          )}

          {/* Appointment details */}
          {app.appointment && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/40">
                Viewing Appointment
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="capitalize text-blue-300">
                  {app.appointment.status?.replace(/_/g, ' ')}
                </span>
                {app.appointment.scheduledFor && (
                  <span className="text-white/60">
                    {new Date(app.appointment.scheduledFor).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
                {app.appointment.locationNote && (
                  <span className="text-white/60">{app.appointment.locationNote}</span>
                )}
              </div>
            </div>
          )}

          {/* Review note */}
          {app.reviewNote && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/40">
                Review Note
              </p>
              <p className="text-sm italic text-white/60">"{app.reviewNote}"</p>
            </div>
          )}

          {/* Lease ref */}
          {app.lease && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/40">
                Lease
              </p>
              <Link href="/account/leases" className="text-sm text-accent-400 hover:underline">
                View lease #{app.lease.id.slice(-6)}
              </Link>
            </div>
          )}

          {/* ── Action panel ── */}
          {!isTerminal && (
            <div className="space-y-4 border-t border-border-primary pt-4">

              {/* submitted → idle mode */}
              {app.status === 'submitted' && mode === 'idle' && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    loading={review.isPending}
                    onClick={() => handleReview('screening')}
                  >
                    Start screening
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-emerald-400/40 text-emerald-400 hover:bg-emerald-400/10"
                    loading={review.isPending}
                    onClick={() => handleReview('approved')}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-400/40 text-red-400 hover:bg-red-400/10"
                    onClick={() => setMode('reject')}
                  >
                    Reject
                  </Button>
                </div>
              )}

              {/* screening → idle mode */}
              {app.status === 'screening' && mode === 'idle' && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-emerald-400/40 text-emerald-400 hover:bg-emerald-400/10"
                    loading={review.isPending}
                    onClick={() => handleReview('approved')}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-400/40 text-red-400 hover:bg-red-400/10"
                    onClick={() => setMode('reject')}
                  >
                    Reject
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setMode('screening')}>
                    Update screening
                  </Button>
                  {app.appointment?.status === 'requested' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-300/40 text-blue-300 hover:bg-blue-300/10"
                      onClick={() => setMode('appointment')}
                    >
                      Schedule viewing
                    </Button>
                  )}
                </div>
              )}

              {/* approved → idle mode */}
              {app.status === 'approved' && mode === 'idle' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-purple-400/40 text-purple-300 hover:bg-purple-400/10"
                  onClick={() => setMode('lease')}
                >
                  Create lease
                </Button>
              )}

              {/* Reject note form */}
              {mode === 'reject' && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-white">Rejection note (optional)</p>
                  <textarea
                    className="w-full resize-none rounded border border-border-primary bg-surface-base px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                    rows={3}
                    value={reviewNote}
                    onChange={e => setReviewNote(e.target.value)}
                    placeholder="Reason for rejection..."
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="border border-red-400/30 bg-red-500/20 text-red-300 hover:bg-red-500/30"
                      loading={review.isPending}
                      onClick={() => handleReview('rejected')}
                    >
                      Confirm rejection
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setMode('idle'); setReviewNote(''); }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Screening update form */}
              {mode === 'screening' && (
                <div className="space-y-3 rounded-lg border border-border-primary bg-surface-base p-4">
                  <p className="text-sm font-semibold text-white">Update Screening</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-white/50">Status</label>
                      <select
                        className="w-full rounded border border-border-primary bg-surface-card px-3 py-2 text-sm text-white focus:outline-none"
                        value={screeningForm.status}
                        onChange={e =>
                          setScreeningForm(s => ({
                            ...s,
                            status: e.target.value as typeof s.status,
                          }))
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="passed">Passed</option>
                        <option value="failed">Failed</option>
                        <option value="manual_review">Manual review</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-white/50">Provider</label>
                      <input
                        className="w-full rounded border border-border-primary bg-surface-card px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none"
                        value={screeningForm.provider}
                        onChange={e => setScreeningForm(s => ({ ...s, provider: e.target.value }))}
                        placeholder="e.g. TransUnion"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-white/50">Reference #</label>
                      <input
                        className="w-full rounded border border-border-primary bg-surface-card px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none"
                        value={screeningForm.reference}
                        onChange={e => setScreeningForm(s => ({ ...s, reference: e.target.value }))}
                        placeholder="Reference ID"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-white/50">Score</label>
                      <input
                        type="number"
                        className="w-full rounded border border-border-primary bg-surface-card px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none"
                        value={screeningForm.score}
                        onChange={e => setScreeningForm(s => ({ ...s, score: e.target.value }))}
                        placeholder="0–850"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs text-white/50">Notes</label>
                      <textarea
                        className="w-full resize-none rounded border border-border-primary bg-surface-card px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none"
                        rows={2}
                        value={screeningForm.notes}
                        onChange={e => setScreeningForm(s => ({ ...s, notes: e.target.value }))}
                        placeholder="Internal screening notes..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" loading={updateScreeningMut.isPending} onClick={handleScreeningSubmit}>
                      Save screening
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setMode('idle')}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Appointment scheduling form */}
              {mode === 'appointment' && (
                <div className="space-y-3 rounded-lg border border-border-primary bg-surface-base p-4">
                  <p className="text-sm font-semibold text-white">Schedule Viewing</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-white/50">Status</label>
                      <select
                        className="w-full rounded border border-border-primary bg-surface-card px-3 py-2 text-sm text-white focus:outline-none"
                        value={apptForm.status}
                        onChange={e =>
                          setApptForm(s => ({ ...s, status: e.target.value as typeof s.status }))
                        }
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="rescheduled">Rescheduled</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-white/50">Date &amp; time</label>
                      <input
                        type="datetime-local"
                        className="w-full rounded border border-border-primary bg-surface-card px-3 py-2 text-sm text-white focus:outline-none"
                        value={apptForm.scheduledFor}
                        onChange={e => setApptForm(s => ({ ...s, scheduledFor: e.target.value }))}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs text-white/50">Location note</label>
                      <input
                        className="w-full rounded border border-border-primary bg-surface-card px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none"
                        value={apptForm.locationNote}
                        onChange={e => setApptForm(s => ({ ...s, locationNote: e.target.value }))}
                        placeholder="Address, unit, meeting point..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" loading={updateAppt.isPending} onClick={handleApptSubmit}>
                      Save appointment
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setMode('idle')}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Lease creation form */}
              {mode === 'lease' && (
                <div className="space-y-3 rounded-lg border border-border-primary bg-surface-base p-4">
                  <p className="text-sm font-semibold text-white">Create Lease</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-white/50">Monthly rent</label>
                      <input
                        type="number"
                        className="w-full rounded border border-border-primary bg-surface-card px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none"
                        value={leaseForm.monthlyRent}
                        onChange={e => setLeaseForm(s => ({ ...s, monthlyRent: e.target.value }))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-white/50">Deposit</label>
                      <input
                        type="number"
                        className="w-full rounded border border-border-primary bg-surface-card px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none"
                        value={leaseForm.depositAmount}
                        onChange={e => setLeaseForm(s => ({ ...s, depositAmount: e.target.value }))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-white/50">Currency</label>
                      <input
                        className="w-full rounded border border-border-primary bg-surface-card px-3 py-2 text-sm text-white focus:outline-none"
                        value={leaseForm.currency}
                        onChange={e => setLeaseForm(s => ({ ...s, currency: e.target.value }))}
                      />
                    </div>
                    <div>{/* grid spacer */}</div>
                    <div>
                      <label className="mb-1 block text-xs text-white/50">Start date</label>
                      <input
                        type="date"
                        className="w-full rounded border border-border-primary bg-surface-card px-3 py-2 text-sm text-white focus:outline-none"
                        value={leaseForm.startDate}
                        onChange={e => setLeaseForm(s => ({ ...s, startDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-white/50">End date</label>
                      <input
                        type="date"
                        className="w-full rounded border border-border-primary bg-surface-card px-3 py-2 text-sm text-white focus:outline-none"
                        value={leaseForm.endDate}
                        onChange={e => setLeaseForm(s => ({ ...s, endDate: e.target.value }))}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs text-white/50">Terms (optional)</label>
                      <textarea
                        className="w-full resize-none rounded border border-border-primary bg-surface-card px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none"
                        rows={3}
                        value={leaseForm.terms}
                        onChange={e => setLeaseForm(s => ({ ...s, terms: e.target.value }))}
                        placeholder="Lease terms and conditions..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" loading={createLease.isPending} onClick={handleLeaseSubmit}>
                      Create lease
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setMode('idle')}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer links */}
          {listingId && (
            <div className="pt-1">
              <Link href={`/listings/${listingId}`} className="text-sm font-medium text-accent-400 hover:underline">
                View listing
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const NEEDS_ACTION_OWNER = new Set<RentalApplicationStatus>(['submitted', 'screening']);
const NEEDS_ACTION_TENANT = new Set<RentalApplicationStatus>(['screening']);

type Tab = 'action' | 'all';

export default function AccountApplicationsPage() {
  const { data = [], isLoading } = useMyRentalApplications();
  const { currentUser } = useAuthStore();
  const [tab, setTab] = useState<Tab>('action');

  const isOwner = currentUser?.role === 'PROPERTY_OWNER';

  const actionSet = isOwner ? NEEDS_ACTION_OWNER : NEEDS_ACTION_TENANT;
  const actionItems = (data as RentalApplication[]).filter(a => actionSet.has(a.status));
  const displayed: RentalApplication[] = tab === 'action' ? actionItems : (data as RentalApplication[]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">Rentals</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-white">
          {isOwner ? 'Received applications' : 'Rental applications'}
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border-primary bg-surface-card p-1">
        {(['action', 'all'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              tab === t ? 'bg-accent-400 text-black' : 'text-text-muted hover:text-white',
            ].join(' ')}
          >
            {t === 'action'
              ? `Needs action (${actionItems.length})`
              : `All (${(data as RentalApplication[]).length})`}
          </button>
        ))}
      </div>

      {/* Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg border border-border-primary bg-surface-card"
            />
          ))}
        </div>
      )}

      {/* List */}
      {!isLoading && (
        <div className="grid gap-3">
          {displayed.map(app =>
            isOwner
              ? <ReceivedApplicationCard key={app.id} app={app} />
              : <SentApplicationCard key={app.id} app={app} />
          )}
          {displayed.length === 0 && (
            <div className="rounded-lg border border-border-primary bg-surface-card p-8 text-center">
              <ClipboardList className="mx-auto h-8 w-8 text-accent-400" />
              <p className="mt-3 font-medium text-white">
                {tab === 'action' ? 'No applications need action' : 'No rental applications yet'}
              </p>
              <p className="mt-1 text-sm text-text-muted">
                {tab === 'action'
                  ? 'All caught up!'
                  : isOwner
                  ? 'Applications on your listings will appear here.'
                  : 'Apply from a rental property detail page.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
