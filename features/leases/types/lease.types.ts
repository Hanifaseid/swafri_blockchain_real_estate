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

export interface LeaseTimelineEvent {
  id?: string;
  key: string;          // unique key for React list rendering
  type: string;
  label: string;        // human-readable label
  status: string;       // completed | active | pending | etc.
  description?: string;
  txHash?: string;
  at?: string;          // ISO datetime when event occurred
  occurredAt?: string;  // fallback from API
  actorId?: string;
  metadata?: Record<string, unknown>;
}

export interface LeaseTimeline {
  leaseId: string;
  currentStatus: string;  // current lease status
  escrowState: string;    // current escrow state
  events: LeaseTimelineEvent[];
}
