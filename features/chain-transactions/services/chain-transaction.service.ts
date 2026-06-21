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

  const response = await apiClient.get<any>(ENDPOINTS.ADMIN.CHAIN_TXS, { params });
  const body = response.data;

  // API wraps paginated results: { success, message, data: { items, total, page, limit } }
  const inner = body?.data ?? body;
  const rawItems: any[] = Array.isArray(inner?.items) ? inner.items : Array.isArray(inner) ? inner : [];

  // Normalize — API uses _id, operation (not hash), txHash, no amount/currency/initiatedBy
  const items: ChainTransaction[] = rawItems.map((t: any) => ({
    id:           t.id ?? t._id ?? '',
    hash:         t.txHash ?? t.hash ?? '—',
    chain:        t.chain ?? t.network ?? 'ETH',
    amount:       t.amount ?? 0,
    currency:     t.currency ?? 'ETH',
    status:       t.status,
    initiatedBy:  t.createdBy ?? t.initiatedBy ?? t.actor ?? '—',
    createdAt:    t.createdAt ?? '',
    updatedAt:    t.updatedAt,
    confirmations: t.confirmations ?? 0,
    reason:       t.reason,
    // extra fields surfaced in UI
    operation:    t.operation,
    targetType:   t.targetType,
    targetId:     t.targetId,
  }));

  return {
    items,
    total: inner?.total ?? items.length,
    page:  inner?.page  ?? page,
    limit: inner?.limit ?? limit,
  };
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
