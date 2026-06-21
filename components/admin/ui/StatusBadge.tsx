import React from 'react';
import { cn } from '@/lib/utils';

/**
 * StatusBadge — unified status chip for ALL admin status values.
 *
 * Covers: account status, KYC status, listing status, wallet status,
 * lease status, application status, compliance status, chain tx status.
 *
 * Usage:
 *   <StatusBadge status="active" />
 *   <StatusBadge status="under_review" />
 *   <StatusBadge status="disputed" />
 *   <StatusBadge status="published" />
 */

const STATUS_MAP: Record<
  string,
  { label: string; className: string }
> = {
  // ── Account / user ────────────────────────────────────────────────────────
  active:         { label: 'Active',          className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pending:        { label: 'Pending',         className: 'bg-amber-50  text-amber-700  border-amber-200' },
  suspended:      { label: 'Suspended',       className: 'bg-orange-50 text-orange-700 border-orange-200' },
  blocked:        { label: 'Blocked',         className: 'bg-red-50    text-red-700    border-red-200' },
  rejected:       { label: 'Rejected',        className: 'bg-red-50    text-red-700    border-red-200' },

  // ── KYC ───────────────────────────────────────────────────────────────────
  not_started:    { label: 'Not Started',     className: 'bg-gray-100  text-gray-500   border-gray-200' },
  verified:       { label: 'Verified',        className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  under_review:   { label: 'Under Review',    className: 'bg-sky-50    text-sky-700    border-sky-200' },
  approved:       { label: 'Approved',        className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },

  // ── Listings ──────────────────────────────────────────────────────────────
  draft:          { label: 'Draft',           className: 'bg-gray-100  text-gray-600   border-gray-200' },
  submitted:      { label: 'Submitted',       className: 'bg-amber-50  text-amber-700  border-amber-200' },
  publish:        { label: 'Published',       className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  published:      { label: 'Published',       className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  archived:       { label: 'Archived',        className: 'bg-gray-100  text-gray-500   border-gray-200' },
  rented:         { label: 'Rented',          className: 'bg-sky-50    text-sky-700    border-sky-200' },
  sold:           { label: 'Sold',            className: 'bg-violet-50 text-violet-700 border-violet-200' },
  unverified:     { label: 'Unverified',      className: 'bg-gray-100  text-gray-500   border-gray-200' },
  requires_more_info: { label: 'More Info',   className: 'bg-sky-50    text-sky-700    border-sky-200' },

  // ── Lease / Escrow ────────────────────────────────────────────────────────
  proposed:       { label: 'Proposed',        className: 'bg-amber-50  text-amber-700  border-amber-200' },
  funded:         { label: 'Funded',          className: 'bg-sky-50    text-sky-700    border-sky-200' },
  completed:      { label: 'Completed',       className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  terminated:     { label: 'Terminated',      className: 'bg-red-50    text-red-700    border-red-200' },
  cancelled:      { label: 'Cancelled',       className: 'bg-gray-100  text-gray-500   border-gray-200' },
  disputed:       { label: 'Disputed',        className: 'bg-red-50    text-red-700    border-red-200' },

  // ── Purchase Transactions ─────────────────────────────────────────────────
  offer_accepted:       { label: 'Offer Accepted',   className: 'bg-sky-50    text-sky-700    border-sky-200' },
  deposit_pending:      { label: 'Deposit Pending',  className: 'bg-amber-50  text-amber-700  border-amber-200' },
  deposit_received:     { label: 'Funds in Escrow',  className: 'bg-amber-50  text-amber-700  border-amber-200' },
  closing_review:       { label: 'Closing Review',   className: 'bg-violet-50 text-violet-700 border-violet-200' },
  title_transfer_pending: { label: 'Title Transfer', className: 'bg-sky-50    text-sky-700    border-sky-200' },

  // ── Applications ──────────────────────────────────────────────────────────
  screening:      { label: 'Screening',       className: 'bg-sky-50    text-sky-700    border-sky-200' },
  lease_created:  { label: 'Lease Created',   className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  withdrawn:      { label: 'Withdrawn',       className: 'bg-gray-100  text-gray-500   border-gray-200' },

  // ── Compliance ────────────────────────────────────────────────────────────
  open:           { label: 'Open',            className: 'bg-amber-50  text-amber-700  border-amber-200' },
  resolved:       { label: 'Resolved',        className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  dismissed:      { label: 'Dismissed',       className: 'bg-gray-100  text-gray-500   border-gray-200' },

  // ── Chain Transactions ────────────────────────────────────────────────────
  confirmed:      { label: 'Confirmed',       className: 'bg-sky-50    text-sky-700    border-sky-200' },
  reconciled:     { label: 'Reconciled',      className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  stale:          { label: 'Stale',           className: 'bg-red-50    text-red-600    border-red-200' },
  failed:         { label: 'Failed',          className: 'bg-gray-100  text-gray-500   border-gray-200' },

  // ── Wallet ────────────────────────────────────────────────────────────────
  linked:         { label: 'Linked',          className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  not_linked:     { label: 'Not Linked',      className: 'bg-gray-100  text-gray-500   border-gray-200' },
  revoked:        { label: 'Revoked',         className: 'bg-red-50    text-red-600    border-red-200' },
  pending_signature: { label: 'Pending Sig.', className: 'bg-amber-50  text-amber-700  border-amber-200' },
};

interface StatusBadgeProps {
  status: string;
  /** Override displayed label */
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const key = status.toLowerCase().replace(/ /g, '_');
  const config = STATUS_MAP[key];

  const displayLabel = label ?? config?.label ?? status.replace(/_/g, ' ');
  const displayClass =
    config?.className ?? 'bg-gray-100 text-gray-500 border-gray-200';

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider border font-medium whitespace-nowrap',
        displayClass,
        className
      )}
    >
      {displayLabel}
    </span>
  );
}
