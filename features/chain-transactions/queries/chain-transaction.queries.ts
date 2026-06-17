import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import {
  getChainTransactions,
  markChainTransactionStale,
  reconcileChainTransaction,
} from '@/features/chain-transactions/services/chain-transaction.service';
import type { MarkStalePayload, ReconcilePayload } from '@/features/chain-transactions/types/chain-transaction.types';
import { queryKeys } from '@/lib/query/query-keys';

const chainTransactionKeys = {
  all: ['chain-transactions'] as const,
  list: (filters?: Record<string, unknown>) => [...chainTransactionKeys.all, 'list', filters] as const,
  detail: (id: string) => [...chainTransactionKeys.all, 'detail', id] as const,
};

export function useChainTransactions(
  page: number = 1,
  limit: number = 20,
  status?: string,
  search?: string
) {
  return useQuery({
    queryKey: chainTransactionKeys.list({ page, limit, status, search }),
    queryFn: () => getChainTransactions(page, limit, status, search),
  });
}

export function useReconcileChainTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReconcilePayload }) => reconcileChainTransaction(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chainTransactionKeys.all });
      toast.success('Transaction reconciled');
    },
    onError: () => {
      toast.error('Failed to reconcile transaction');
    },
  });
}

export function useMarkChainTransactionStale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MarkStalePayload }) => markChainTransactionStale(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chainTransactionKeys.all });
      toast.success('Transaction marked stale');
    },
    onError: () => {
      toast.error('Failed to mark transaction stale');
    },
  });
}
