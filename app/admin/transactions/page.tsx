'use client';

import { useState } from 'react';
import { CreditCard } from 'lucide-react';
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
import { DataTable } from '@/components/ui/DataTable';
import {
  AdminPageLayout,
  AdminFilterBar,
  AdminPagination,
  AdminLoadingState,
  AdminEmptyState,
  AdminErrorState,
  StatusBadge,
} from '@/components/admin/ui';
import type { ColumnDef } from '@tanstack/react-table';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'offer_accepted', label: 'Offer Accepted' },
  { value: 'deposit_pending', label: 'Deposit Pending' },
  { value: 'deposit_received', label: 'Funds in Escrow' },
  { value: 'closing_review', label: 'Closing Review' },
  { value: 'title_transfer_pending', label: 'Title Transfer' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'disputed', label: 'Disputed' },
];

export default function TransactionsPage() {
  const { currentUser } = useAuthStore();
  const [page, setPage] = useState(1);
  const limit = 20;
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = usePurchaseTransactions(page, limit, statusFilter, search);
  const updateStatusMutation = useUpdatePurchaseTransactionStatus();
  const transactions = data?.items ?? [];

  const columns: ColumnDef<PurchaseTransaction>[] = [
    {
      accessorKey: 'listingTitle',
      header: 'Property',
      cell: ({ row }) => (
        <span className="font-medium text-gray-800">{row.original.listingTitle}</span>
      ),
    },
    {
      accessorKey: 'listingPrice',
      header: 'Price',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 font-mono">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: row.original.currency || 'USD' }).format(row.original.listingPrice)}
        </span>
      ),
    },
    {
      accessorKey: 'depositAmount',
      header: 'Deposit',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500 font-mono">
          {row.original.depositAmount
            ? new Intl.NumberFormat('en-US', { style: 'currency', currency: row.original.currency || 'USD' }).format(row.original.depositAmount)
            : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-xs text-gray-400 font-mono">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
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

  if (!currentUser) return null;

  return (
    <AdminPageLayout icon={CreditCard} label="Admin" title="Purchase Transactions">
      <AdminFilterBar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        placeholder="Search transactions…"
        filters={[{
          key: 'status',
          label: 'Status',
          value: statusFilter ?? '',
          onChange: (v) => { setStatusFilter(v || undefined); setPage(1); },
          options: STATUS_OPTIONS,
        }]}
        onClear={() => { setStatusFilter(undefined); setSearch(''); setPage(1); }}
        className="mb-5"
      />

      {isLoading ? <AdminLoadingState /> :
       error ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <AdminErrorState title="Failed to load transactions" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <AdminEmptyState icon={CreditCard} title="No purchase transactions found" />
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 font-mono mb-3">
            {data?.total ?? 0} transaction{(data?.total ?? 0) !== 1 ? 's' : ''} found
          </p>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <DataTable columns={columns} data={transactions} />
          </div>
          {data && (
            <AdminPagination page={page} total={data.total} limit={data.limit} onPageChange={setPage} />
          )}
        </>
      )}
    </AdminPageLayout>
  );
}

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
  const busy = fund.isPending || release.isPending || refund.isPending || resolve.isPending || mutation.isPending || checklist.isPending;

  const canFund = s === 'offer_accepted' || s === 'deposit_pending';
  const canSettle = s === 'deposit_received';
  const isClosingReview = s === 'closing_review';
  const isDisputed = s === 'disputed';

  if (!canFund && !canSettle && !isClosingReview && !isDisputed) {
    return <span className="text-xs text-gray-300">—</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {canFund && (
        <>
          <Button size="sm" loading={busy} onClick={() => fund.mutate({ id })}>Fund escrow</Button>
          <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" loading={busy}
            onClick={() => mutation.mutate({ id, payload: { status: 'cancelled' } })}>Cancel</Button>
        </>
      )}
      {canSettle && (
        <>
          <Button size="sm" loading={busy} onClick={() => release.mutate({ id })}>Release</Button>
          <Button size="sm" variant="outline" loading={busy} onClick={() => refund.mutate({ id })}>Refund</Button>
        </>
      )}
      {isClosingReview && (
        <Button size="sm" variant="secondary" loading={busy}
          onClick={() => checklist.mutate({ id, payload: { items: { title_transferred: true, funds_disbursed: true, documents_verified: true } } })}>
          Complete Checklist
        </Button>
      )}
      {isDisputed && (
        <>
          <Button size="sm" loading={busy} onClick={() => resolve.mutate({ id, payload: { decision: 'release' } })}>Resolve · release</Button>
          <Button size="sm" variant="outline" loading={busy} onClick={() => resolve.mutate({ id, payload: { decision: 'refund' } })}>Resolve · refund</Button>
        </>
      )}
    </div>
  );
}
