import { cn } from '@/lib/utils';

/**
 * Badge — status pill used across Buyer, Owner, and Admin screens.
 *
 * Usage:
 *   <Badge status="active" />
 *   <Badge status="verified" />
 *   <Badge status="pending" label="Awaiting Review" />   // custom label, same color
 *   <Badge status="custom-status" />                      // falls back to gray
 */

export type BadgeStatus =
  | 'active'
  | 'pending'
  | 'sold'
  | 'rented'
  | 'flagged'
  | 'verified'
  | 'expired'
  | 'delisted'
  | 'draft'
  | 'awaiting_funds'
  | 'funds_held'
  | 'released'
  | 'disputed';

const STATUS_STYLES: Record<BadgeStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  verified: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  released: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',

  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  awaiting_funds: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  draft: 'bg-violet-50 text-violet-700 ring-violet-600/20',

  rented: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  funds_held: 'bg-blue-50 text-blue-700 ring-blue-600/20',

  sold: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  expired: 'bg-gray-100 text-gray-500 ring-gray-400/20',
  delisted: 'bg-gray-100 text-gray-500 ring-gray-400/20',

  flagged: 'bg-red-50 text-red-700 ring-red-600/20',
  disputed: 'bg-red-50 text-red-700 ring-red-600/20',
};

const STATUS_LABELS: Record<BadgeStatus, string> = {
  active: 'Active',
  pending: 'Pending',
  sold: 'Sold',
  rented: 'Rented',
  flagged: 'Flagged',
  verified: 'Verified',
  expired: 'Expired',
  delisted: 'Delisted',
  draft: 'Draft',
  awaiting_funds: 'Awaiting Funds',
  funds_held: 'Funds Held',
  released: 'Released',
  disputed: 'Disputed',
};

interface BadgeProps {
  /** Known status keys get color + label automatically. Unknown strings render gray with the raw text. */
  status: BadgeStatus | string;
  /** Override the displayed text while keeping the status's color. */
  label?: string;
  /** Hide the small leading dot. */
  hideDot?: boolean;
  className?: string;
}

export function Badge({ status, label, hideDot, className }: BadgeProps) {
  const known = (status as string) in STATUS_STYLES ? (status as BadgeStatus) : undefined;
  const style = known ? STATUS_STYLES[known] : 'bg-gray-100 text-gray-600 ring-gray-400/20';
  const text = label ?? (known ? STATUS_LABELS[known] : status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap',
        style,
        className
      )}
    >
      {!hideDot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {text}
    </span>
  );
}
