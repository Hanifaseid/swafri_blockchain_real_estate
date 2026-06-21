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

// ─── Local endpoint map ───────────────────────────────────────────────────────
// Kept local so this service file is self-contained and doesn't have to rely
// on the global ENDPOINTS constant for every lease sub-path.

const ENDPOINTS = {
  BASE:            '/leases',
  MINE:            '/leases/mine',
  DETAIL:          (id: string) => `/leases/${id}`,
  PROPOSE:         (id: string) => `/leases/${id}/propose`,
  SIGN:            (id: string) => `/leases/${id}/sign`,
  FUND:            (id: string) => `/leases/${id}/fund`,
  ACTIVATE:        (id: string) => `/leases/${id}/activate`,
  CANCEL:          (id: string) => `/leases/${id}/cancel`,
  COMPLETE:        (id: string) => `/leases/${id}/complete`,
  TERMINATE:       (id: string) => `/leases/${id}/terminate`,
  DISPUTE:         (id: string) => `/leases/${id}/dispute`,
  RESPOND_DISPUTE: (id: string) => `/leases/${id}/dispute/respond`,
  RESOLVE:         (id: string) => `/leases/${id}/dispute/resolve`,
  ESCROW:          (id: string) => `/leases/${id}/escrow`,
  TIMELINE:        (id: string) => `/leases/${id}/timeline`,
};

// ─── Normalization helpers ────────────────────────────────────────────────────

function normalizeUser(u: unknown): LeaseUser | string {
  if (!u) return '';
  if (typeof u === 'string') return u;
  const obj = u as Record<string, unknown>;
  return { id: (obj.id ?? obj._id ?? '') as string, name: obj.name as string | undefined, email: obj.email as string | undefined };
}

function normalizeListing(l: unknown): LeaseListing | string {
  if (!l) return '';
  if (typeof l === 'string') return l;
  const obj = l as Record<string, unknown>;
  return {
    id: (obj.id ?? obj._id ?? '') as string,
    title: obj.title as string | undefined,
    listingType: obj.listingType as string | undefined,
    monthlyRent: obj.monthlyRent as number | undefined,
    currency: obj.currency as string | undefined,
  };
}

function normalizeEscrow(e: unknown): LeaseEscrow {
  if (!e || typeof e !== 'object') return { state: 'none' };
  const obj = e as Record<string, unknown>;
  return {
    escrowId: obj.escrowId as string | undefined,
    contractAddress: obj.contractAddress as string | undefined,
    token: obj.token as string | undefined,
    state: (obj.state ?? 'none') as LeaseEscrow['state'],
    fundTxHash: obj.fundTxHash as string | undefined,
    activateTxHash: obj.activateTxHash as string | undefined,
    settleTxHash: obj.settleTxHash as string | undefined,
    landlordWallet: obj.landlordWallet as string | undefined,
    tenantWallet: obj.tenantWallet as string | undefined,
  };
}

function normalizeDispute(d: unknown): LeaseDispute | undefined {
  if (!d || typeof d !== 'object') return undefined;
  const obj = d as Record<string, unknown>;
  const toId = (v: unknown): string | undefined => {
    if (!v) return undefined;
    if (typeof v === 'string') return v;
    const o = v as Record<string, unknown>;
    return (o.id ?? o._id) as string | undefined;
  };
  return {
    openedBy: toId(obj.openedBy),
    openedAt: obj.openedAt as string | undefined,
    reason: obj.reason as string | undefined,
    response: obj.response as string | undefined,
    respondedBy: toId(obj.respondedBy),
    respondedAt: obj.respondedAt as string | undefined,
  };
}

function normalizeLease(raw: Record<string, unknown>): Lease {
  return {
    ...(raw as unknown as Lease),
    id: (raw.id ?? raw._id ?? '') as string,
    listing: normalizeListing(raw.listing),
    landlord: normalizeUser(raw.landlord),
    tenant: normalizeUser(raw.tenant),
    escrow: normalizeEscrow(raw.escrow),
    dispute: normalizeDispute(raw.dispute),
    monthlyRent: Number(raw.monthlyRent ?? 0),
    depositAmount: Number(raw.depositAmount ?? 0),
    escrowAmount: raw.escrowAmount != null ? Number(raw.escrowAmount) : undefined,
    terms: raw.terms as string | undefined,
    signedByTenantAt: raw.signedByTenantAt as string | undefined,
    createdAt: (raw.createdAt ?? '') as string,
    updatedAt: (raw.updatedAt ?? raw.createdAt ?? '') as string,
  };
}

function extractError(error: unknown, fallback: string): Error {
  const ax = error as { response?: { data?: { message?: string; errors?: Array<{ field?: string; message?: string }> } } };
  const errs = ax.response?.data?.errors?.map((e) => e.message || e.field).filter(Boolean);
  if (errs?.length) return new Error(errs.join(', '));
  return new Error(ax.response?.data?.message || (error instanceof Error ? error.message : fallback));
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getMyLeases(): Promise<Lease[]> {
  const { data } = await apiClient.get<Record<string, unknown>>(ENDPOINTS.MINE);
  if (!data.success) throw new Error((data.message as string) || 'Failed to fetch leases');
  const raw = Array.isArray(data.data) ? data.data : (data.data as any)?.items ?? (data.data as any)?.leases ?? [];
  return (raw as Record<string, unknown>[]).map(normalizeLease);
}

export async function getAllLeases(): Promise<Lease[]> {
  // NOTE: The backend has no GET /leases admin endpoint per OpenAPI spec.
  // /leases/mine returns leases where caller is landlord or tenant.
  // Admins can look up individual leases by ID via getLease(id).
  return getMyLeases();
}

export async function getLease(id: string): Promise<Lease> {
  const { data } = await apiClient.get<ApiSingleResponse<Record<string, unknown>>>(ENDPOINTS.DETAIL(id));
  if (!data.success) throw new Error(data.message || 'Failed to fetch lease');
  return normalizeLease(data.data);
}

export async function getEscrowVerification(id: string): Promise<EscrowVerification> {
  const { data } = await apiClient.get<ApiSingleResponse<EscrowVerification>>(ENDPOINTS.ESCROW(id));
  if (!data.success) throw new Error(data.message || 'Failed to verify escrow');
  return data.data;
}

export async function getLeaseTimeline(id: string): Promise<LeaseTimeline> {
  const { data } = await apiClient.get<Record<string, unknown>>(API_ENDPOINTS.LEASES.TIMELINE(id));
  if ((data as any)?.success === false) throw new Error((data as any).message || 'Failed to fetch timeline');
  const value = (data as any)?.data ?? data;
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

// ─── Mutations ────────────────────────────────────────────────────────────────
// Added from main branch — full CRUD lifecycle for leases.

export async function createLease(payload: CreateLeasePayload): Promise<Lease> {
  try {
    const { data } = await apiClient.post<ApiSingleResponse<Record<string, unknown>>>(ENDPOINTS.BASE, payload);
    if (!data.success) throw new Error(data.message || 'Failed to create lease');
    return normalizeLease(data.data);
  } catch (error) {
    throw extractError(error, 'Failed to create lease');
  }
}

export async function proposeLease(id: string): Promise<Lease> {
  try {
    const { data } = await apiClient.post<ApiSingleResponse<Record<string, unknown>>>(ENDPOINTS.PROPOSE(id));
    if (!data.success) throw new Error(data.message || 'Failed to propose lease');
    return normalizeLease(data.data);
  } catch (error) {
    throw extractError(error, 'Failed to propose lease');
  }
}

export async function signLease(id: string, tenantSignature?: string): Promise<Lease> {
  try {
    const payload = tenantSignature ? { tenantSignature } : {};
    const { data } = await apiClient.post<ApiSingleResponse<Record<string, unknown>>>(ENDPOINTS.SIGN(id), payload);
    if (!data.success) throw new Error(data.message || 'Failed to sign lease');
    return normalizeLease(data.data);
  } catch (error) {
    throw extractError(error, 'Failed to sign lease');
  }
}

export async function fundLease(id: string): Promise<Lease> {
  try {
    const { data } = await apiClient.post<ApiSingleResponse<Record<string, unknown>>>(ENDPOINTS.FUND(id));
    if (!data.success) throw new Error(data.message || 'Failed to fund lease');
    return normalizeLease(data.data);
  } catch (error) {
    throw extractError(error, 'Failed to fund escrow');
  }
}

export async function activateLease(id: string): Promise<Lease> {
  try {
    const { data } = await apiClient.post<ApiSingleResponse<Record<string, unknown>>>(ENDPOINTS.ACTIVATE(id));
    if (!data.success) throw new Error(data.message || 'Failed to activate lease');
    return normalizeLease(data.data);
  } catch (error) {
    throw extractError(error, 'Failed to activate lease');
  }
}

export async function cancelLease(id: string): Promise<Lease> {
  try {
    const { data } = await apiClient.post<ApiSingleResponse<Record<string, unknown>>>(ENDPOINTS.CANCEL(id));
    if (!data.success) throw new Error(data.message || 'Failed to cancel lease');
    return normalizeLease(data.data);
  } catch (error) {
    throw extractError(error, 'Failed to cancel lease');
  }
}

export async function completeLease(id: string): Promise<Lease> {
  try {
    const { data } = await apiClient.post<ApiSingleResponse<Record<string, unknown>>>(ENDPOINTS.COMPLETE(id));
    if (!data.success) throw new Error(data.message || 'Failed to complete lease');
    return normalizeLease(data.data);
  } catch (error) {
    throw extractError(error, 'Failed to complete lease');
  }
}

export async function terminateLease(id: string): Promise<Lease> {
  try {
    const { data } = await apiClient.post<ApiSingleResponse<Record<string, unknown>>>(ENDPOINTS.TERMINATE(id));
    if (!data.success) throw new Error(data.message || 'Failed to terminate lease');
    return normalizeLease(data.data);
  } catch (error) {
    throw extractError(error, 'Failed to terminate lease');
  }
}

export async function disputeLease(id: string, reason?: string): Promise<Lease> {
  try {
    const payload = reason ? { reason } : {};
    const { data } = await apiClient.post<ApiSingleResponse<Record<string, unknown>>>(ENDPOINTS.DISPUTE(id), payload);
    if (!data.success) throw new Error(data.message || 'Failed to flag dispute');
    return normalizeLease(data.data);
  } catch (error) {
    throw extractError(error, 'Failed to flag dispute');
  }
}

export async function respondToDispute(id: string, response: string): Promise<Lease> {
  try {
    const { data } = await apiClient.post<ApiSingleResponse<Record<string, unknown>>>(
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
    const { data } = await apiClient.post<ApiSingleResponse<Record<string, unknown>>>(ENDPOINTS.RESOLVE(id), payload);
    if (!data.success) throw new Error(data.message || 'Failed to resolve dispute');
    return normalizeLease(data.data);
  } catch (error) {
    throw extractError(error, 'Failed to resolve dispute');
  }
}

// ─── getTenantRoster ──────────────────────────────────────────────────────────
// GET /leases/tenants — Returns distinct tenants across all leases where the
// caller is landlord (property_owner, admin, super_admin).
// Response shape: { success, data: [{ id, name, email, phone }] }

export interface TenantRosterEntry {
  tenantId: string;
  tenantName?: string;
  tenantEmail?: string;
  tenantPhone?: string;
  leaseId: string;
  listingTitle?: string;
  status: string;
  startDate?: string;
  endDate?: string;
}

export async function getTenantRoster(
  params?: { ownerId?: string; page?: number; limit?: number }
): Promise<TenantRosterEntry[]> {
  try {
    const { data } = await apiClient.get<Record<string, unknown>>(
      API_ENDPOINTS.LEASES.TENANTS,
      { params: { page: 1, limit: 50, ...params } }
    );
    if (!(data as any).success) throw new Error((data as any).message || 'Failed to fetch tenant roster');
    const d = (data as any).data;
    const raw: any[] = Array.isArray(d) ? d : d?.items ?? d?.tenants ?? [];

    // API returns populated user objects: { id, name, email, phone }
    return raw.map((t: any) => ({
      tenantId:    t.id ?? t._id ?? '',
      tenantName:  t.name   ?? undefined,
      tenantEmail: t.email  ?? undefined,
      tenantPhone: t.phone  ?? undefined,
      // These fields are not returned by this endpoint —
      // the roster tab uses leaseId as a fallback display
      leaseId:     t.id ?? t._id ?? '',
      listingTitle: undefined,
      status:      t.status ?? 'active',
      endDate:     undefined,
    }));
  } catch {
    return [];
  }
}
