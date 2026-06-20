import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS as API_ENDPOINTS } from '@/lib/api/endpoints';
import { Lease, CreateLeasePayload, ResolveDisputePayload, EscrowVerification, LeaseTimeline } from '../types/lease.types';

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
  RESOLVE: (id: string) => `/leases/${id}/dispute/resolve`,
  ESCROW: (id: string) => `/leases/${id}/escrow`,
  TIMELINE: (id: string) => `/leases/${id}/timeline`,
};

export async function createLease(payload: CreateLeasePayload): Promise<Lease> {
  try {
    const { data } = await apiClient.post<ApiSingleResponse<Lease>>(ENDPOINTS.BASE, payload);
    if (!data.success) throw new Error(data.message || 'Failed to create lease');
    return data.data;
  } catch (error: any) {
    if (error.response?.data?.errors) {
      throw new Error(error.response.data.errors.map((e: any) => `${e.field}: ${e.message}`).join(', '));
    }
    throw new Error(error.response?.data?.message || error.message || 'Failed to create lease');
  }
}

export async function getMyLeases(): Promise<Lease[]> {
  const { data } = await apiClient.get<any>(ENDPOINTS.MINE);
  if (!data.success) throw new Error(data.message || 'Failed to fetch leases');
  if (Array.isArray(data.data)) return data.data;
  return data.data?.items || data.data?.leases || [];
}

// For ADMIN / SUPER_ADMIN — tries the base /leases endpoint which may return all leases
export async function getAllLeases(): Promise<Lease[]> {
  try {
    const { data } = await apiClient.get<any>(ENDPOINTS.BASE);
    if (!data.success) throw new Error(data.message || 'Failed to fetch leases');
    if (Array.isArray(data.data)) return data.data;
    return data.data?.items || data.data?.leases || [];
  } catch {
    // Fallback to /leases/mine if /leases is not available for this admin
    return getMyLeases();
  }
}

export async function getLease(id: string): Promise<Lease> {
  const { data } = await apiClient.get<ApiSingleResponse<Lease>>(ENDPOINTS.DETAIL(id));
  if (!data.success) throw new Error(data.message || 'Failed to fetch lease');
  return data.data;
}

export async function proposeLease(id: string): Promise<Lease> {
  try {
    const { data } = await apiClient.post<ApiSingleResponse<Lease>>(ENDPOINTS.PROPOSE(id));
    if (!data.success) throw new Error(data.message || 'Failed to propose lease');
    return data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to propose lease');
  }
}

export async function signLease(id: string): Promise<Lease> {
  try {
    const { data } = await apiClient.post<ApiSingleResponse<Lease>>(ENDPOINTS.SIGN(id));
    if (!data.success) throw new Error(data.message || 'Failed to sign lease');
    return data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to sign lease');
  }
}

export async function fundLease(id: string): Promise<Lease> {
  try {
    const { data } = await apiClient.post<ApiSingleResponse<Lease>>(ENDPOINTS.FUND(id));
    if (!data.success) throw new Error(data.message || 'Failed to fund lease');
    return data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fund lease');
  }
}

export async function activateLease(id: string): Promise<Lease> {
  try {
    const { data } = await apiClient.post<ApiSingleResponse<Lease>>(ENDPOINTS.ACTIVATE(id));
    if (!data.success) throw new Error(data.message || 'Failed to activate lease');
    return data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to activate lease');
  }
}

export async function cancelLease(id: string): Promise<Lease> {
  try {
    const { data } = await apiClient.post<ApiSingleResponse<Lease>>(ENDPOINTS.CANCEL(id));
    if (!data.success) throw new Error(data.message || 'Failed to cancel lease');
    return data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to cancel lease');
  }
}

export async function completeLease(id: string): Promise<Lease> {
  try {
    const { data } = await apiClient.post<ApiSingleResponse<Lease>>(ENDPOINTS.COMPLETE(id));
    if (!data.success) throw new Error(data.message || 'Failed to complete lease');
    return data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to complete lease');
  }
}

export async function terminateLease(id: string): Promise<Lease> {
  try {
    const { data } = await apiClient.post<ApiSingleResponse<Lease>>(ENDPOINTS.TERMINATE(id));
    if (!data.success) throw new Error(data.message || 'Failed to terminate lease');
    return data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to terminate lease');
  }
}

export async function disputeLease(id: string): Promise<Lease> {
  try {
    const { data } = await apiClient.post<ApiSingleResponse<Lease>>(ENDPOINTS.DISPUTE(id));
    if (!data.success) throw new Error(data.message || 'Failed to flag dispute');
    return data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to flag dispute');
  }
}

export async function resolveDispute(id: string, payload: ResolveDisputePayload): Promise<Lease> {
  try {
    const { data } = await apiClient.post<ApiSingleResponse<Lease>>(ENDPOINTS.RESOLVE(id), payload);
    if (!data.success) throw new Error(data.message || 'Failed to resolve dispute');
    return data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to resolve dispute');
  }
}

export async function getEscrowVerification(id: string): Promise<EscrowVerification> {
  const { data } = await apiClient.get<ApiSingleResponse<EscrowVerification>>(ENDPOINTS.ESCROW(id));
  if (!data.success) throw new Error(data.message || 'Failed to verify escrow');
  return data.data;
}

export async function getLeaseTimeline(id: string): Promise<LeaseTimeline> {
  const { data } = await apiClient.get<any>(API_ENDPOINTS.LEASES.TIMELINE(id));
  if (data?.success === false) throw new Error(data.message || 'Failed to fetch lease timeline');
  const value = data?.data ?? data;
  if (Array.isArray(value)) return { leaseId: id, events: value };
  return {
    leaseId: value?.leaseId ?? id,
    events: Array.isArray(value?.events) ? value.events : [],
  };
}
