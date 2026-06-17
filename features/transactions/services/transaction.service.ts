import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { 
  PurchaseTransaction, 
  UpdatePurchaseStatusPayload, 
  PaginatedTransactions,
  CreatePurchaseTransactionPayload,
} from '../types/transaction.types';

// ─── Purchase Transactions Service ────────────────────────────────────────────

export async function createPurchaseTransaction(
  payload: CreatePurchaseTransactionPayload
): Promise<PurchaseTransaction> {
  const response = await apiClient.post<PurchaseTransaction>(
    ENDPOINTS.PURCHASES.CREATE,
    payload
  );
  return response.data;
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

// Export as service object for consistency
export const transactionService = {
  createPurchaseTransaction,
  getPurchaseTransactions,
  getPurchaseTransactionDetail,
  updatePurchaseTransactionStatus,
};
