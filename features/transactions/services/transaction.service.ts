import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { 
  PurchaseTransaction, 
  UpdatePurchaseStatusPayload, 
  PaginatedTransactions,
  CreatePurchaseTransactionPayload,
} from '../types/transaction.types';

// ─── Purchase Transactions Service ────────────────────────────────────────────
// Note: Purchase transactions are auto-created when offers are accepted via the offers API
// Manual creation is not supported per the OpenAPI spec

export async function createPurchaseTransaction(
  payload: CreatePurchaseTransactionPayload
): Promise<PurchaseTransaction> {
  // This endpoint doesn't exist in the spec - transactions are created via offer acceptance
  throw new Error('Purchase transactions are auto-created when offers are accepted. Use the offers API instead.');
}

export async function getPurchaseTransactions(
  page: number = 1,
  limit: number = 20,
  status?: string,
  search?: string
): Promise<PaginatedTransactions> {
  const params: Record<string, any> = {
    page,
    limit,
  };
  if (status) params.status = status;
  if (search) params.q = search;

  const response = await apiClient.get<PaginatedTransactions>(ENDPOINTS.PURCHASES.LIST, { params });
  return response.data;
}

export async function getPurchaseTransactionDetail(id: string): Promise<PurchaseTransaction> {
  const response = await apiClient.get<PurchaseTransaction>(ENDPOINTS.PURCHASES.DETAIL(id));
  return response.data;
}

export async function updatePurchaseTransactionStatus(
  id: string,
  payload: UpdatePurchaseStatusPayload
): Promise<PurchaseTransaction> {
  const response = await apiClient.patch<PurchaseTransaction>(
    ENDPOINTS.PURCHASES.UPDATE_STATUS(id),
    payload
  );
  return response.data;
}

export async function fundPurchaseTransaction(id: string): Promise<PurchaseTransaction> {
  const response = await apiClient.post<PurchaseTransaction>(
    ENDPOINTS.PURCHASES.FUND(id)
  );
  return response.data;
}

export async function releasePurchaseTransaction(id: string): Promise<PurchaseTransaction> {
  const response = await apiClient.post<PurchaseTransaction>(
    ENDPOINTS.PURCHASES.RELEASE(id)
  );
  return response.data;
}

export async function refundPurchaseTransaction(id: string): Promise<PurchaseTransaction> {
  const response = await apiClient.post<PurchaseTransaction>(
    ENDPOINTS.PURCHASES.REFUND(id)
  );
  return response.data;
}

export async function disputePurchaseTransaction(
  id: string,
  payload: { reason?: string }
): Promise<PurchaseTransaction> {
  const response = await apiClient.post<PurchaseTransaction>(
    ENDPOINTS.PURCHASES.DISPUTE(id),
    payload
  );
  return response.data;
}

export async function resolvePurchaseTransactionDispute(
  id: string,
  payload: { decision: 'release' | 'refund'; note?: string }
): Promise<PurchaseTransaction> {
  const response = await apiClient.post<PurchaseTransaction>(
    ENDPOINTS.PURCHASES.RESOLVE_DISPUTE(id),
    payload
  );
  return response.data;
}

// Export as service object for consistency
export const transactionService = {
  createPurchaseTransaction,
  getPurchaseTransactions,
  getPurchaseTransactionDetail,
  updatePurchaseTransactionStatus,
  fundPurchaseTransaction,
  releasePurchaseTransaction,
  refundPurchaseTransaction,
  disputePurchaseTransaction,
  resolvePurchaseTransactionDispute,
};
