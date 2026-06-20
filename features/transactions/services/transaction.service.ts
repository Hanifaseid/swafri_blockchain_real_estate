import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { 
  PurchaseTransaction, 
  UpdatePurchaseStatusPayload, 
  PaginatedTransactions,
  CreatePurchaseTransactionPayload,
  PurchaseEscrowActionPayload,
} from '../types/transaction.types';

interface ApiSingleResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

function unwrapTransaction(payload: ApiSingleResponse<PurchaseTransaction> | PurchaseTransaction): PurchaseTransaction {
  if ('data' in payload && payload.data) return payload.data;
  return payload as PurchaseTransaction;
}

// ─── Purchase Transactions Service ────────────────────────────────────────────
// Note: Purchase transactions are auto-created when offers are accepted via the offers API
// Manual creation is not supported per the OpenAPI spec

export async function createPurchaseTransaction(
  payload: CreatePurchaseTransactionPayload
): Promise<PurchaseTransaction> {
  // POST to the collection path to create a new purchase transaction
  const response = await apiClient.post<PurchaseTransaction>(
    ENDPOINTS.PURCHASES.LIST,
    payload
  );
  return unwrapTransaction(response.data as PurchaseTransaction);
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
  const response = await apiClient.get<ApiSingleResponse<PurchaseTransaction> | PurchaseTransaction>(ENDPOINTS.PURCHASES.DETAIL(id));
  return unwrapTransaction(response.data);
}

export async function updatePurchaseTransactionStatus(
  id: string,
  payload: UpdatePurchaseStatusPayload
): Promise<PurchaseTransaction> {
  const response = await apiClient.patch<ApiSingleResponse<PurchaseTransaction> | PurchaseTransaction>(
    ENDPOINTS.PURCHASES.UPDATE_STATUS(id),
    payload
  );
  return unwrapTransaction(response.data);
}

async function postPurchaseEscrowAction(
  endpoint: string,
  payload?: PurchaseEscrowActionPayload,
): Promise<PurchaseTransaction> {
  const response = await apiClient.post<
    ApiSingleResponse<PurchaseTransaction> | PurchaseTransaction
  >(endpoint, payload ?? {});
  return unwrapTransaction(response.data);
}

export function fundPurchaseEscrow(
  id: string,
  payload?: PurchaseEscrowActionPayload,
) {
  return postPurchaseEscrowAction(ENDPOINTS.PURCHASES.FUND_ESCROW(id), payload);
}

export function releasePurchaseEscrow(
  id: string,
  payload?: PurchaseEscrowActionPayload,
) {
  return postPurchaseEscrowAction(ENDPOINTS.PURCHASES.RELEASE_ESCROW(id), payload);
}

export function refundPurchaseEscrow(
  id: string,
  payload?: PurchaseEscrowActionPayload,
) {
  return postPurchaseEscrowAction(ENDPOINTS.PURCHASES.REFUND_ESCROW(id), payload);
}

export function disputePurchaseTransaction(
  id: string,
  payload?: PurchaseEscrowActionPayload,
) {
  return postPurchaseEscrowAction(ENDPOINTS.PURCHASES.DISPUTE(id), payload);
}

export function resolvePurchaseDispute(
  id: string,
  payload?: PurchaseEscrowActionPayload,
) {
  return postPurchaseEscrowAction(ENDPOINTS.PURCHASES.RESOLVE_DISPUTE(id), payload);
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
  fundPurchaseEscrow,
  releasePurchaseEscrow,
  refundPurchaseEscrow,
  disputePurchaseTransaction,
  resolvePurchaseDispute,
};
