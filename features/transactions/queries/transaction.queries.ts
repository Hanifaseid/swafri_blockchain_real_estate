import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import {
  createPurchaseTransaction,
  getPurchaseTransactions,
  getPurchaseTransactionDetail,
  updatePurchaseTransactionStatus,
  fundPurchaseEscrow,
  releasePurchaseEscrow,
  refundPurchaseEscrow,
  disputePurchaseTransaction,
  resolvePurchaseDispute,
} from '@/features/transactions/services/transaction.service';
import type {
  CreatePurchaseTransactionPayload,
  PurchaseEscrowActionPayload,
  UpdatePurchaseStatusPayload,
} from '@/features/transactions/types/transaction.types';

// ─── Query Keys ───────────────────────────────────────────────────────────────

const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters?: any) => [...transactionKeys.lists(), filters] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
};

// ─── useCreatePurchaseTransaction ────────────────────────────────────────────

export function useCreatePurchaseTransaction() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePurchaseTransactionPayload) => createPurchaseTransaction(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: transactionKeys.lists() });
      qc.setQueryData(transactionKeys.detail(data.id), data);
      toast.success('Purchase transaction created successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create transaction';
      toast.error(message);
    },
  });
}

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

function usePurchaseEscrowMutation(
  action: (id: string, payload?: PurchaseEscrowActionPayload) => Promise<any>,
  successMessage: string,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: PurchaseEscrowActionPayload }) =>
      action(id, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: transactionKeys.lists() });
      if (data?.id) qc.invalidateQueries({ queryKey: transactionKeys.detail(data.id) });
      toast.success(successMessage);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Purchase escrow action failed');
    },
  });
}

export function useFundPurchaseEscrow() {
  return usePurchaseEscrowMutation(fundPurchaseEscrow, 'Purchase escrow funding recorded.');
}

export function useReleasePurchaseEscrow() {
  return usePurchaseEscrowMutation(releasePurchaseEscrow, 'Purchase escrow released.');
}

export function useRefundPurchaseEscrow() {
  return usePurchaseEscrowMutation(refundPurchaseEscrow, 'Purchase escrow refunded.');
}

export function useDisputePurchaseTransaction() {
  return usePurchaseEscrowMutation(disputePurchaseTransaction, 'Purchase transaction disputed.');
}

export function useResolvePurchaseDispute() {
  return usePurchaseEscrowMutation(resolvePurchaseDispute, 'Purchase dispute resolved.');
}
