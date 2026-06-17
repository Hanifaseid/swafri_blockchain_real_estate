import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ChainTransaction,
  ChainTransactionsPage,
  MarkStalePayload,
  ReconcilePayload,
} from '../types/chain-transaction.types';

export async function getChainTransactions(
  page: number = 1,
  limit: number = 20,
  status?: string,
  search?: string
): Promise<ChainTransactionsPage> {
  const params: Record<string, any> = { page, limit };
  if (status) params.status = status;
  if (search) params.q = search;

  const response = await apiClient.get<ChainTransactionsPage>(ENDPOINTS.ADMIN.CHAIN_TXS, { params });
  return response.data;
}

export async function reconcileChainTransaction(id: string, payload: ReconcilePayload): Promise<ChainTransaction> {
  const response = await apiClient.post<ChainTransaction>(ENDPOINTS.ADMIN.CHAIN_RECONCILE(id), payload);
  return response.data;
}

export async function markChainTransactionStale(id: string, payload: MarkStalePayload): Promise<ChainTransaction> {
  const response = await apiClient.post<ChainTransaction>(ENDPOINTS.ADMIN.CHAIN_STALE(id), payload);
  return response.data;
}

export const chainTransactionService = {
  getChainTransactions,
  reconcileChainTransaction,
  markChainTransactionStale,
};
