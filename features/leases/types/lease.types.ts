export type LeaseStatus =
  | 'draft'
  | 'proposed'
  | 'funded'        // not a backend status — kept so legacy checks compile; backend uses proposed + escrow.state=funded
  | 'active'
  | 'cancelled'
  | 'completed'
  | 'terminated'
  | 'disputed';

export type EscrowState = 'none' | 'funded' | 'active' | 'closed';

export interface LeaseUser {
  id: string;
  name?: string;
  email?: string;
}

export interface LeaseListing {
  id: string;
  title?: string;
  listingType?: string;
  monthlyRent?: number;
  currency?: string;
}

export interface LeaseEscrow {
  escrowId?: string;
  contractAddress?: string;
  token?: string;
  state: EscrowState;
  fundTxHash?: string;
  activateTxHash?: string;
  settleTxHash?: string;
  landlordWallet?: string;
  tenantWallet?: string;
}

export interface LeaseDispute {
  openedBy?: string;
  openedAt?: string;
  reason?: string;
  response?: string;
  respondedBy?: string;
  respondedAt?: string;
}

export interface Lease {
  id: string;
  listing: LeaseListing | string;
  landlord: LeaseUser | string;
  tenant: LeaseUser | string;
  status: LeaseStatus;
  monthlyRent: number;
  depositAmount: number;
  escrowAmount?: number;
  currency: string;
  startDate: string;
  endDate: string;
  terms?: string;
  termsHash?: string;
  signedByTenantAt?: string;
  tenantSignature?: string;
  escrow?: LeaseEscrow;
  dispute?: LeaseDispute;
  createdBy?: string;
  // Legacy aliases kept for backward compat
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
  terms?: string;
}

export interface RespondToDisputePayload {
  response: string;
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
  key: string;
  type: string;
  label: string;
  status: string;       // 'completed' | 'active' | 'pending'
  description?: string;
  txHash?: string;
  at?: string;
  occurredAt?: string;
  actorId?: string;
  metadata?: Record<string, unknown>;
}

export interface LeaseTimeline {
  leaseId: string;
  currentStatus: string;
  escrowState: string;
  events: LeaseTimelineEvent[];
}
