'use client';

import { useState } from 'react';
import { CreditCard, Search, SlidersHorizontal, X, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import {
  usePurchaseTransactions,
  useUpdatePurchaseTransactionStatus,
  useFundPurchaseEscrow,
  useReleasePurchaseEscrow,
  useRefundPurchaseEscrow,
  useResolvePurchaseDispute,
  useUpdateClosingChecklist,
} from '@/features/transactions/queries/transaction.queries';
import type { PurchaseStatus, PurchaseTransaction } from '@/features/transactions/types/transaction.types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { ROLE_LABELS } from '@/features/roles/types/role.types';
import { cn } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';

// ─── Status Display ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<PurchaseStatus, { label: string; color: string }> = {
  offer_accepted: { label: 'Offer Accepted', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  deposit_pending: { label: 'Deposit Pending', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  deposit_received: { label: 'Funds in Escrow', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  closing_review: { label: 'Closing Review', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  title_transfer_pending: { label: 'Title Transfer', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  completed: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-50 text-gray-700 border-gray-200' },
  disputed: { label: 'Disputed', color: 'bg-red-50 text-red-700 border-red-200' },
};

// ─── Transactions Page ────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const { currentUser } = useAuthStore();
  if (!currentUser) return null;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="w-6 h-6 text-emerald-500 shrink-0" />
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">{ROLE_LABELS[currentUser.role]}</p>
          <h1 className="text-2xl font-light text-dash-sidebar tracking-tight">Purchase Transactions</h1>
        </div>
      </div>

      <TransactionsTable />
    </div>
  );
}

// ─── Transactions Table ───────────────────────────────────────────────────────

function TransactionsTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = usePurchaseTransactions(page, limit, statusFilter, search);
  const updateStatusMutation = useUpdatePurchaseTransactionStatus();

  const transactions = data?.items ?? [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  // Define table columns
  const columns: ColumnDef<PurchaseTransaction>[] = [
    {
      accessorKey: 'listingTitle',
      header: 'Property',
      cell: ({ row }) => (
        <div className="font-medium text-black/80">{row.original.listingTitle}</div>
      ),
    },
    {
      accessorKey: 'listingPrice',
      header: 'Price',
      cell: ({ row }) => (
        <div className="text-sm text-black/60">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: row.original.currency || 'USD',
          }).format(row.original.listingPrice)}
        </div>
      ),
    },
    {
      accessorKey: 'depositAmount',
      header: 'Deposit',
      cell: ({ row }) => (
        <div className="text-sm text-black/60">
          {row.original.depositAmount
            ? new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: row.original.currency || 'USD',
              }).format(row.original.depositAmount)
            : '—'}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const config = STATUS_CONFIG[row.original.status];
        return <Badge status={row.original.status} label={config.label} className={cn('text-xs font-medium', config.color)} />;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => (
        <div className="text-sm text-black/60">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <ActionButtons transaction={row.original} mutation={updateStatusMutation} />
      ),
    },
  ];

  return (
    <div>
      {/* Search + Filter Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions…"
            className="w-full h-9 rounded-lg border border-gray-200 pl-9 pr-3 text-sm text-black/70 placeholder:text-black/25 focus:outline-none focus:border-emerald-400 bg-white"
          />
        </div>
        <button
          type="submit"
          className="h-9 px-4 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            'h-9 px-3 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5',
            showFilters
              ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
              : 'border-gray-200 text-black/60 hover:border-gray-300 bg-white'
          )}
        >
          <SlidersHorizontal size={13} /> Filters
        </button>
      </form>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-1.5 block">
              Status
            </label>
            <select
              value={statusFilter ?? ''}
              onChange={(e) => {
                setStatusFilter(e.target.value || undefined);
                setPage(1);
              }}
              className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm text-black/70 bg-white focus:outline-none focus:border-emerald-400"
            >
              <option value="">All Statuses</option>
              {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setStatusFilter(undefined);
                setSearch('');
                setPage(1);
              }}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors"
            >
              <X size={12} /> Clear filters
            </button>
          </div>
        </div>
      )}

      {/* Table or Loading/Error State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-black/60 text-sm font-light">Failed to load transactions</p>
          <p className="text-xs text-black/40">Please try again later</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <CreditCard className="w-10 h-10 text-black/15" />
          <p className="text-black/40 text-sm font-light">No purchase transactions found</p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-xs text-black/35 font-mono">
              {data?.total ?? 0} transaction{(data?.total ?? 0) !== 1 ? 's' : ''} found
            </p>
          </div>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--color-dash-border)', background: 'var(--color-dash-card)' }}
          >
            <DataTable columns={columns} data={transactions} />
          </div>

          {/* Pagination */}
          {data && data.total > data.limit && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-medium text-black/60 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-xs text-black/50 font-mono">
                Page {page} of {Math.ceil(data.total / data.limit)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(data.total / data.limit)}
                className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-medium text-black/60 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Action Buttons ───────────────────────────────────────────────────────────

function ActionButtons({
  transaction,
  mutation,
}: {
  transaction: PurchaseTransaction;
  mutation: ReturnType<typeof useUpdatePurchaseTransactionStatus>;
}) {
  const fund = useFundPurchaseEscrow();
  const release = useReleasePurchaseEscrow();
  const refund = useRefundPurchaseEscrow();
  const resolve = useResolvePurchaseDispute();
  const checklist = useUpdateClosingChecklist();

  const id = transaction.id;
  const s = transaction.status;
  const busy =
    fund.isPending || release.isPending || refund.isPending ||
    resolve.isPending || mutation.isPending || checklist.isPending;

  const canFund = s === 'offer_accepted' || s === 'deposit_pending';
  const canSettle = s === 'deposit_received';
  const isClosingReview = s === 'closing_review';
  const isDisputed = s === 'disputed';

  if (!canFund && !canSettle && !isClosingReview && !isDisputed) {
    return <span className="text-xs text-black/30">—</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canFund && (
        <>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            loading={busy}
            onClick={() => fund.mutate({ id })}
          >
            Fund escrow
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 text-xs"
            loading={busy}
            onClick={() => mutation.mutate({ id, payload: { status: 'cancelled' } })}
          >
            Cancel
          </Button>
        </>
      )}
      {canSettle && (
        <>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            loading={busy}
            onClick={() => release.mutate({ id })}
          >
            Release to seller
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            loading={busy}
            onClick={() => refund.mutate({ id })}
          >
            Refund buyer
          </Button>
        </>
      )}
      {isClosingReview && (
        <Button
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
          loading={busy}
          onClick={() =>
            checklist.mutate({
              id,
              payload: {
                items: {
                  title_transferred: true,
                  funds_disbursed: true,
                  documents_verified: true,
                },
              },
            })
          }
        >
          Complete Checklist
        </Button>
      )}
      {isDisputed && (
        <>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            loading={busy}
            onClick={() => resolve.mutate({ id, payload: { decision: 'release' } })}
          >
            Resolve · release
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            loading={busy}
            onClick={() => resolve.mutate({ id, payload: { decision: 'refund' } })}
          >
            Resolve · refund
          </Button>
        </>
      )}
    </div>
  );
}
