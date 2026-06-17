// ─── Chain Transaction Types ─────────────────────────────────────────────────

export type ChainTransactionStatus = 'pending' | 'confirmed' | 'reconciled' | 'stale' | 'failed';

export interface ChainTransaction {
  id: string;
  hash: string;
  chain: string;
  amount: number;
  currency: string;
  status: ChainTransactionStatus;
  initiatedBy: string;
  createdAt: string;
  updatedAt?: string;
  confirmations: number;
  reason?: string;
}

export interface ChainTransactionsPage {
  items: ChainTransaction[];
  total: number;
  page: number;
  limit: number;
}

export interface ReconcilePayload {
  confirmations: number;
}

export interface MarkStalePayload {
  reason: string;
}
