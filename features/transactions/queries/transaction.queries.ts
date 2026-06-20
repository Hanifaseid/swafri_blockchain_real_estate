import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import {
  createPurchaseTransaction,
  getPurchaseTransactions,
  getPurchaseTransactionDetail,
  updatePurchaseTransactionStatus,
  fundPurchaseTransaction,
  releasePurchaseTransaction,
  refundPurchaseTransaction,
  disputePurchaseTransaction,
  resolvePurchaseTransactionDispute,
} from '@/features/transactions/services/transaction.service';
import type { CreatePurchaseTransactionPayload, UpdatePurchaseStatusPayload } from '@/features/transactions/types/transaction.types';

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

// ─── useFundPurchaseTransaction ─────────────────────────────────────────────────

export function useFundPurchaseTransaction() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fundPurchaseTransaction(id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: transactionKeys.lists() });
      qc.invalidateQueries({ queryKey: transactionKeys.detail(data.id) });
      toast.success('Escrow funded successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to fund escrow';
      toast.error(message);
    },
  });
}

// ─── useReleasePurchaseTransaction ───────────────────────────────────────────────

export function useReleasePurchaseTransaction() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => releasePurchaseTransaction(id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: transactionKeys.lists() });
      qc.invalidateQueries({ queryKey: transactionKeys.detail(data.id) });
      toast.success('Escrow released successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to release escrow';
      toast.error(message);
    },
  });
}

// ─── useRefundPurchaseTransaction ────────────────────────────────────────────────

export function useRefundPurchaseTransaction() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => refundPurchaseTransaction(id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: transactionKeys.lists() });
      qc.invalidateQueries({ queryKey: transactionKeys.detail(data.id) });
      toast.success('Escrow refunded successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to refund escrow';
      toast.error(message);
    },
  });
}

// ─── useDisputePurchaseTransaction ───────────────────────────────────────────────

export function useDisputePurchaseTransaction() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      disputePurchaseTransaction(id, { reason }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: transactionKeys.lists() });
      qc.invalidateQueries({ queryKey: transactionKeys.detail(data.id) });
      toast.success('Dispute opened successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to open dispute';
      toast.error(message);
    },
  });
}

// ─── useResolvePurchaseTransactionDispute ─────────────────────────────────────────

export function useResolvePurchaseTransactionDispute() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, decision, note }: { id: string; decision: 'release' | 'refund'; note?: string }) =>
      resolvePurchaseTransactionDispute(id, { decision, note }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: transactionKeys.lists() });
      qc.invalidateQueries({ queryKey: transactionKeys.detail(data.id) });
      toast.success('Dispute resolved successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to resolve dispute';
      toast.error(message);
    },
  });
}
