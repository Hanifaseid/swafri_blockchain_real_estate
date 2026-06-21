// ─── Purchase Transaction Types ───────────────────────────────────────────────

export type PurchaseStatus =
  | 'offer_accepted'
  | 'deposit_pending'
  | 'deposit_received'
  | 'closing_review'
  | 'title_transfer_pending'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type PurchaseEscrowState = 'none' | 'funded' | 'released' | 'refunded';

export interface ClosingChecklist {
  purchaseAgreement?: boolean;
  inspection?: boolean;
  financing?: boolean;
  titleReview?: boolean;
  settlementStatement?: boolean;
}

export interface PurchaseEscrow {
  escrowId?: string;
  contractAddress?: string;
  token?: string;
  state: PurchaseEscrowState;
  fundTxHash?: string;
  settleTxHash?: string;
  buyerWallet?: string;
  sellerWallet?: string;
}

export interface PurchaseDispute {
  openedBy?: string;
  openedAt?: string;
  reason?: string;
  note?: string;
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
  escrow?: PurchaseEscrow;
  dispute?: PurchaseDispute;
  termsHash?: string;
  titleTransferTxHash?: string;
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
  /** For dispute resolution: release funds to seller or refund the buyer. */
  decision?: 'release' | 'refund';
}
