import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import {
  getPurchaseTransactions,
  getPurchaseTransactionDetail,
  updatePurchaseTransactionStatus,
} from '@/features/transactions/services/transaction.service';
import type { UpdatePurchaseStatusPayload } from '@/features/transactions/types/transaction.types';

// ─── Query Keys ───────────────────────────────────────────────────────────────

const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters?: any) => [...transactionKeys.lists(), filters] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
};

// ─── usePurchaseTransactions ──────────────────────────────────────────────────

export function usePurchaseTransactions(
  page: number = 1,
  limit: number = 20,
  status?: string,
  search?: string
) {
  return useQuery({
    queryKey: transactionKeys.list({ page, limit, status, search }),
    queryFn: () => getPurchaseTransactions(page, limit, status, search),
  });
}

// ─── usePurchaseTransactionDetail ────────────────────────────────────────────

export function usePurchaseTransactionDetail(id: string) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => getPurchaseTransactionDetail(id),
    enabled: !!id,
  });
}

// ─── useUpdatePurchaseTransactionStatus ──────────────────────────────────────

export function useUpdatePurchaseTransactionStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePurchaseStatusPayload }) =>
      updatePurchaseTransactionStatus(id, payload),
    onSuccess: (data) => {
      // Invalidate and update lists
      qc.invalidateQueries({ queryKey: transactionKeys.lists() });
      qc.invalidateQueries({ queryKey: transactionKeys.detail(data.id) });
      toast.success('Transaction status updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update transaction status';
      toast.error(message);
    },
  });
}
