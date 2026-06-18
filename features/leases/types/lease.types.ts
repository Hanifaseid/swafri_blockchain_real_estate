export type LeaseStatus = 
  | 'draft'
  | 'proposed'
  | 'funded'
  | 'active'
  | 'cancelled'
  | 'completed'
  | 'terminated'
  | 'disputed';

export interface Lease {
  id: string;
  listing: string;
  landlord: string;
  tenant: string;
  status: LeaseStatus;
  monthlyRent: number;
  depositAmount: number;
  currency: string;
  startDate: string;
  endDate: string;
  terms: string;
  escrowTxHash?: string;
  disputeNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeasePayload {
  listingId: string;
  tenantId: string;
  monthlyRent: number;
  depositAmount: number;
  currency: string;
  startDate: string;
  endDate: string;
  terms: string;
}

export interface ResolveDisputePayload {
  decision: 'release_deposit' | 'refund_deposit' | 'cancel';
  note?: string;
}

export interface EscrowVerification {
  leaseId: string;
  contractAddress: string;
  balance: string;
  status: string;
  verified: boolean;
}
