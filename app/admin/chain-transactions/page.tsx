'use client';

import { useMemo, useState } from 'react';
import { ServerCog } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useChainTransactions, useMarkChainTransactionStale, useReconcileChainTransaction } from '@/features/chain-transactions/queries/chain-transaction.queries';
import type { ChainTransaction, ChainTransactionStatus } from '@/features/chain-transactions/types/chain-transaction.types';
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

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'reconciled', label: 'Reconciled' },
  { value: 'stale', label: 'Stale' },
  { value: 'failed', label: 'Failed' },
];

export default function ChainTransactionsPage() {
  const { currentUser } = useAuthStore();
  const [page, setPage] = useState(1);
  const limit = 20;
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useChainTransactions(page, limit, statusFilter || undefined, search);
  const reconcileMutation = useReconcileChainTransaction();
  const staleMutation = useMarkChainTransactionStale();
  const transactions = data?.items ?? [];

  const columns: ColumnDef<ChainTransaction>[] = useMemo(() => [
    {
      accessorKey: 'operation',
      header: 'Operation',
      cell: ({ row }) => (
        <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
          {row.original.operation ?? '—'}
        </span>
      ),
    },
    {
      accessorKey: 'hash',
      header: 'Tx Hash',
      cell: ({ row }) => (
        <span className="text-xs text-gray-600 font-mono truncate block max-w-[140px]">
          {row.original.hash !== '—' ? `${row.original.hash.slice(0, 10)}…` : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'targetType',
      header: 'Target',
      cell: ({ row }) => (
        <div>
          <span className="text-xs text-gray-600 capitalize">{row.original.targetType ?? '—'}</span>
          {row.original.targetId && (
            <p className="text-[10px] text-gray-400 font-mono">…{row.original.targetId.slice(-8)}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'initiatedBy',
      header: 'Created By',
      cell: ({ row }) => (
        <span className="text-xs text-gray-500 font-mono">
          {row.original.initiatedBy !== '—' ? `…${row.original.initiatedBy.slice(-8)}` : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-xs text-gray-400 font-mono">
          {new Date(row.original.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {(row.original.status === 'confirmed' || row.original.status === 'mined' as any) && (
            <Button
              size="sm"
              loading={reconcileMutation.status === 'pending'}
              onClick={() => reconcileMutation.mutate({ id: row.original.id, payload: { confirmations: row.original.confirmations || 1 } })}
            >
              Reconcile
            </Button>
          )}
          {row.original.status !== 'reconciled' && row.original.status !== 'failed' && (
            <Button
              size="sm"
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
              loading={staleMutation.status === 'pending'}
              onClick={() => staleMutation.mutate({ id: row.original.id, payload: { reason: 'Manual reconciliation required' } })}
            >
              Mark Stale
            </Button>
          )}
        </div>
      ),
    },
  ], [reconcileMutation, staleMutation]);

  if (!currentUser) return null;

  return (
    <AdminPageLayout icon={ServerCog} label="Admin" title="Chain Transactions">
      <AdminFilterBar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        placeholder="Search chain transactions…"
        filters={[{
          key: 'status',
          label: 'Status',
          value: statusFilter,
          onChange: (v) => { setStatusFilter(v); setPage(1); },
          options: STATUS_OPTIONS,
        }]}
        onClear={() => { setStatusFilter(''); setSearch(''); setPage(1); }}
        className="mb-5"
      />

      {isLoading ? (
        <AdminLoadingState />
      ) : error ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <AdminErrorState title="Failed to load chain transactions" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <AdminEmptyState icon={ServerCog} title="No chain transactions found" />
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
            <AdminPagination
              page={page}
              total={data.total}
              limit={data.limit}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </AdminPageLayout>
  );
}
