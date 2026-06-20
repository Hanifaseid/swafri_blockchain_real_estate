// ─── Purchase Transaction Types ───────────────────────────────────────────────

export type PurchaseStatus =
  | 'pending'
  | 'deposit_pending'
  | 'processing'
  | 'under_inspection'
  | 'approved'
  | 'completed'
  | 'rejected'
  | 'cancelled'
  | 'failed';

export interface ClosingChecklist {
  purchaseAgreement?: boolean;
  inspection?: boolean;
  financing?: boolean;
  titleReview?: boolean;
  settlementStatement?: boolean;
}

export interface PurchaseTransaction {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId?: string;
  listingTitle: string;
  listingPrice: number;
  currency?: string;
  status: PurchaseStatus;
  depositAmount?: number;
  totalAmount?: number;
  note?: string;
  closingChecklist?: ClosingChecklist;
  createdAt: string;
  updatedAt: string;
  estimatedCloseDate?: string;
  actualCloseDate?: string;
}

export interface UpdatePurchaseStatusPayload {
  status: PurchaseStatus;
  note?: string;
  depositAmount?: number;
  closingChecklist?: ClosingChecklist;
}

export interface CreatePurchaseTransactionPayload {
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  currency?: string;
  buyerAmount: number;
  depositAmount?: number;
  note?: string;
}

export interface PaginatedTransactions {
  items: PurchaseTransaction[];
  total: number;
  page: number;
  limit: number;
}

export interface PurchaseEscrowActionPayload {
  amount?: number;
  note?: string;
  reason?: string;
  txHash?: string;
}
