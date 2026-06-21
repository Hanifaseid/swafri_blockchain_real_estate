import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS as API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  Lease,
  LeaseEscrow,
  LeaseDispute,
  LeaseUser,
  LeaseListing,
  CreateLeasePayload,
  ResolveDisputePayload,
  EscrowVerification,
  LeaseTimeline,
} from '../types/lease.types';

export interface ApiSingleResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const ENDPOINTS = {
  BASE: '/leases',
  MINE: '/leases/mine',
  DETAIL: (id: string) => `/leases/${id}`,
  PROPOSE: (id: string) => `/leases/${id}/propose`,
  SIGN: (id: string) => `/leases/${id}/sign`,
  FUND: (id: string) => `/leases/${id}/fund`,
  ACTIVATE: (id: string) => `/leases/${id}/activate`,
  CANCEL: (id: string) => `/leases/${id}/cancel`,
  COMPLETE: (id: string) => `/leases/${id}/complete`,
  TERMINATE: (id: string) => `/leases/${id}/terminate`,
  DISPUTE: (id: string) => `/leases/${id}/dispute`,
  RESPOND_DISPUTE: (id: string) => `/leases/${id}/dispute/respond`,
  RESOLVE: (id: string) => `/leases/${id}/dispute/resolve`,
  ESCROW: (id: string) => `/leases/${id}/escrow`,
  TIMELINE: (id: string) => `/leases/${id}/timeline`,
};

// ─── Normalization ─────────────────────────────────────────────────────────

function normalizeUser(u: any): LeaseUser | string {
  if (!u) return '';
  if (typeof u === 'string') return u;
  return { id: u.id ?? u._id ?? '', name: u.name, email: u.email };
}

function normalizeListing(l: any): LeaseListing | string {
  if (!l) return '';
  if (typeof l === 'string') return l;
  return {
    id: l.id ?? l._id ?? '',
    title: l.title,
    listingType: l.listingType,
    monthlyRent: l.monthlyRent,
    currency: l.currency,
  };
}

function normalizeEscrow(e: any): LeaseEscrow {
  if (!e || typeof e !== 'object') return { state: 'none' };
  return {
    escrowId: e.escrowId,
    contractAddress: e.contractAddress,
    token: e.token,
    state: e.state ?? 'none',
    fundTxHash: e.fundTxHash,
    activateTxHash: e.activateTxHash,
    settleTxHash: e.settleTxHash,
    landlordWallet: e.landlordWallet,
    tenantWallet: e.tenantWallet,
  };
}

function normalizeDispute(d: any): LeaseDispute | undefined {
  if (!d || typeof d !== 'object') return undefined;
  return {
    openedBy: typeof d.openedBy === 'object' ? (d.openedBy?.id ?? d.openedBy?._id) : d.openedBy,
    openedAt: d.openedAt,
    reason: d.reason,
    response: d.response,
    respondedBy: typeof d.respondedBy === 'object' ? (d.respondedBy?.id ?? d.respondedBy?._id) : d.respondedBy,
    respondedAt: d.respondedAt,
  };
}

function normalizeLease(raw: any): Lease {
  return {
    ...raw,
    id: raw.id ?? raw._id ?? '',
    listing: normalizeListing(raw.listing),
    landlord: normalizeUser(raw.landlord),
    tenant: normalizeUser(raw.tenant),
    escrow: normalizeEscrow(raw.escrow),
    dispute: normalizeDispute(raw.dispute),
    monthlyRent: Number(raw.monthlyRent ?? 0),
    depositAmount: Number(raw.depositAmount ?? 0),
    escrowAmount: raw.escrowAmount != null ? Number(raw.escrowAmount) : undefined,
    terms: raw.terms ?? undefined,
    signedByTenantAt: raw.signedByTenantAt ?? undefined,
    createdAt: raw.createdAt ?? '',
    updatedAt: raw.updatedAt ?? raw.createdAt ?? '',
  };
}

function extractError(error: unknown, fallback: string): Error {
  const ax = error as { response?: { data?: { message?: string; errors?: Array<{ field?: string; message?: string }> } } };
  const errs = ax.response?.data?.errors?.map(e => e.message || e.field).filter(Boolean);
  if (errs?.length) return new Error(errs.join(', '));
  return new Error(ax.response?.data?.message || (error instanceof Error ? error.message : fallback));
}

// ─── Queries ──────────────────────────────────────────────────────────────

export async function getMyLeases(): Promise<Lease[]> {
  const { data } = await apiClient.get<any>(ENDPOINTS.MINE);
  if (!data.success) throw new Error(data.message || 'Failed to fetch leases');
  const raw = Array.isArray(data.data) ? data.data : data.data?.items ?? data.data?.leases ?? [];
  return raw.map(normalizeLease);
}

export async function getAllLeases(): Promise<Lease[]> {
  try {
    const { data } = await apiClient.get<any>(ENDPOINTS.BASE);
    if (!data.success) throw new Error(data.message || 'Failed to fetch leases');
    const raw = Array.isArray(data.data) ? data.data : data.data?.items ?? data.data?.leases ?? [];
    return raw.map(normalizeLease);
  } catch {
    return getMyLeases();
  }
}

export async function getLease(id: string): Promise<Lease> {
  const { data } = await apiClient.get<ApiSingleResponse<any>>(ENDPOINTS.DETAIL(id));
  if (!data.success) throw new Error(data.message || 'Failed to fetch lease');
  return normalizeLease(data.data);
}

export async function getEscrowVerification(id: string): Promise<EscrowVerification> {
  const { data } = await apiClient.get<ApiSingleResponse<EscrowVerification>>(ENDPOINTS.ESCROW(id));
  if (!data.success) throw new Error(data.message || 'Failed to verify escrow');
  return data.data;
}

export async function getLeaseTimeline(id: string): Promise<LeaseTimeline> {
  const { data } = await apiClient.get<any>(API_ENDPOINTS.LEASES.TIMELINE(id));
  if (data?.success === false) throw new Error(data.message || 'Failed to fetch timeline');
  const value = data?.data ?? data;
  if (Array.isArray(value)) {
    return { leaseId: id, currentStatus: 'unknown', escrowState: 'unknown', events: value };
  }
  return {
    leaseId: value?.leaseId ?? id,
    currentStatus: value?.currentStatus ?? value?.status ?? 'unknown',
    escrowState: value?.escrowState ?? 'unknown',
    events: Array.isArray(value?.events) ? value.events : [],
  };
}

// ─── Mutations ────────────────────────────────────────────────────────────

export async function createLease(payload: CreateLeasePayload): Promise<Lease> {
  try {
    const { data } = await apiClient.post<ApiSingleResponse<any>>(ENDPOINTS.BASE, payload);
    if (!data.success) throw new Error(data.message || 'Failed to create lease');
    return normalizeLease(data.data);
  } catch (error) {
    throw extractError(error, 'Failed to create lease');
  }
}

export async function proposeLease(id: string): Promise<Lease> {
  try {
    const { data } = await apiClient.post<ApiSingleResponse<any>>(ENDPOINTS.PROPOSE(id));
    if (!data.success) throw new Error(data.message || 'Failed to propose lease');
    return normalizeLease(data.data);
  } catch (error) {
    throw extractError(error, 'Failed to propose lease');
  }
}

export async function signLease(id: string, tenantSignature?: string): Promise<Lease> {
  try {
    const payload = tenantSignature ? { tenantSignature } : {};
    const { data } = await apiClient.post<ApiSingleResponse<any>>(ENDPOINTS.SIGN(id), payload);
    if (!data.success) throw new Error(data.message || 'Failed to sign lease');
    return normalizeLease(data.data);
  } catch (error) {
    throw extractError(error, 'Failed to sign lease');
  }
}

export async function fundLease(id: string): Promise<Lease> {
  try {
    const { data } = await apiClient.post<ApiSingleResponse<any>>(ENDPOINTS.FUND(id));
    if (!data.success) throw new Error(data.message || 'Failed to fund lease');
    return normalizeLease(data.data);
  } catch (error) {
    throw extractError(error, 'Failed to fund escrow');
  }
}

export async function activateLease(id: string): Promise<Lease> {
  try {
    const { data } = await apiClient.post<ApiSingleResponse<any>>(ENDPOINTS.ACTIVATE(id));
    if (!data.success) throw new Error(data.message || 'Failed to activate lease');
    return normalizeLease(data.data);
  } catch (error) {
    throw extractError(error, 'Failed to activate lease');
  }
}

export async function cancelLease(id: string): Promise<Lease> {
  try {
    const { data } = await apiClient.post<ApiSingleResponse<any>>(ENDPOINTS.CANCEL(id));
    if (!data.success) throw new Error(data.message || 'Failed to cancel lease');
    return normalizeLease(data.data);
  } catch (error) {
    throw extractError(error, 'Failed to cancel lease');
  }
}

export async function completeLease(id: string): Promise<Lease> {
  try {
    const { data } = await apiClient.post<ApiSingleResponse<any>>(ENDPOINTS.COMPLETE(id));
    if (!data.success) throw new Error(data.message || 'Failed to complete lease');
    return normalizeLease(data.data);
  } catch (error) {
    throw extractError(error, 'Failed to complete lease');
  }
}

export async function terminateLease(id: string): Promise<Lease> {
  try {
    const { data } = await apiClient.post<ApiSingleResponse<any>>(ENDPOINTS.TERMINATE(id));
    if (!data.success) throw new Error(data.message || 'Failed to terminate lease');
    return normalizeLease(data.data);
  } catch (error) {
    throw extractError(error, 'Failed to terminate lease');
  }
}

export async function disputeLease(id: string, reason?: string): Promise<Lease> {
  try {
    const payload = reason ? { reason } : {};
    const { data } = await apiClient.post<ApiSingleResponse<any>>(ENDPOINTS.DISPUTE(id), payload);
    if (!data.success) throw new Error(data.message || 'Failed to flag dispute');
    return normalizeLease(data.data);
  } catch (error) {
    throw extractError(error, 'Failed to flag dispute');
  }
}

export async function respondToDispute(id: string, response: string): Promise<Lease> {
  try {
    const { data } = await apiClient.post<ApiSingleResponse<any>>(
      ENDPOINTS.RESPOND_DISPUTE(id),
      { response }
    );
    if (!data.success) throw new Error(data.message || 'Failed to respond to dispute');
    return normalizeLease(data.data);
  } catch (error) {
    throw extractError(error, 'Failed to respond to dispute');
  }
}

export async function resolveDispute(id: string, payload: ResolveDisputePayload): Promise<Lease> {
  try {
    const { data } = await apiClient.post<ApiSingleResponse<any>>(ENDPOINTS.RESOLVE(id), payload);
    if (!data.success) throw new Error(data.message || 'Failed to resolve dispute');
    return normalizeLease(data.data);
  } catch (error) {
    throw extractError(error, 'Failed to resolve dispute');
  }
}
