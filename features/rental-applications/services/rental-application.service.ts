import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  RentalApplication,
  RentalApplicationAppointment,
  RentalApplicationScreening,
  RentalApplicationStatus,
  SubmitRentalApplicationPayload,
  ReviewApplicationPayload,
  ScreeningUpdatePayload,
  AppointmentUpdatePayload,
  CreateLeasePayload,
} from '../types/rental-application.types';

interface ApiListResponse<T> {
  success: boolean;
  message: string;
  data: T[] | { items: T[]; total?: number; page?: number; limit?: number };
}

interface ApiSingleResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

type RawRentalApplication = Record<string, any>;

const LEGACY_STATUS_MAP: Record<string, RentalApplicationStatus> = {
  PENDING: 'submitted',
  SCREENING: 'screening',
  APPOINTMENT_REQUESTED: 'screening',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
  LEASE_CREATED: 'lease_created',
};

function normalizeStatus(rawStatus: unknown, hasLease: boolean): RentalApplicationStatus {
  const status = typeof rawStatus === 'string' ? rawStatus : '';
  const mapped = LEGACY_STATUS_MAP[status] ?? (status.toLowerCase() as RentalApplicationStatus | '');

  if (mapped === 'approved' && hasLease) return 'lease_created';
  if (mapped) return mapped;
  return hasLease ? 'lease_created' : 'submitted';
}

function normalizeScreening(app: RawRentalApplication): RentalApplicationScreening | undefined {
  const nested = app.screening && typeof app.screening === 'object' ? app.screening : {};

  const screening: RentalApplicationScreening = {
    status: nested.status ?? app.screeningStatus,
    provider: nested.provider ?? app.screeningProvider,
    reference: nested.reference ?? app.screeningReference,
    score: nested.score ?? app.screeningScore,
    notes: nested.notes ?? app.screeningNotes,
  };

  if (Object.values(screening).every((value) => value == null || value === '')) {
    return undefined;
  }

  return screening;
}

function normalizeAppointment(app: RawRentalApplication): RentalApplicationAppointment | undefined {
  const nested = app.appointment && typeof app.appointment === 'object' ? app.appointment : {};

  const appointment: RentalApplicationAppointment = {
    status: nested.status ?? app.appointmentStatus,
    scheduledFor: nested.scheduledFor ?? app.scheduledFor ?? app.appointmentDate,
    locationNote: nested.locationNote ?? app.locationNote ?? app.appointmentLocationNote,
    note: nested.note ?? app.appointmentNote,
  };

  if (Object.values(appointment).every((value) => value == null || value === '')) {
    return undefined;
  }

  if (!appointment.status && appointment.scheduledFor) {
    appointment.status = 'scheduled';
  }

  return appointment;
}

function normalizeRentalApplication(app: RawRentalApplication): RentalApplication {
  const listingRef = app.listing ?? app.property;
  const leaseRef = app.lease ?? (app.leaseId ? { id: app.leaseId } : undefined);
  const hasLease = Boolean(leaseRef && (typeof leaseRef === 'string' ? leaseRef : leaseRef.id));

  return {
    id: app.id ?? app._id ?? '',
    listingId:
      app.listingId ??
      app.propertyId ??
      (typeof listingRef === 'string' ? listingRef : listingRef?.id) ??
      '',
    listing: listingRef,
    tenantId: app.tenantId ?? (typeof app.tenant === 'string' ? app.tenant : app.tenant?.id),
    tenant: app.tenant,
    landlordId:
      app.landlordId ??
      app.ownerId ??
      (typeof app.landlord === 'string' ? app.landlord : app.landlord?.id) ??
      (typeof app.owner === 'string' ? app.owner : app.owner?.id),
    landlord: app.landlord ?? app.owner,
    desiredStartDate: app.desiredStartDate ?? '',
    desiredEndDate: app.desiredEndDate ?? '',
    occupants: Number(app.occupants ?? 0),
    monthlyIncome: Number(app.monthlyIncome ?? 0),
    employer: app.employer ?? undefined,
    message: app.message ?? undefined,
    status: normalizeStatus(app.status, hasLease),
    screening: normalizeScreening(app),
    appointment: normalizeAppointment(app),
    lease: typeof leaseRef === 'string' ? { id: leaseRef } : leaseRef,
    reviewNote: app.reviewNote ?? app.adminNote ?? undefined,
    reviewedBy: app.reviewedBy ?? undefined,
    reviewedAt: app.reviewedAt ?? undefined,
    createdAt: app.createdAt ?? '',
    updatedAt: app.updatedAt ?? app.createdAt ?? '',
  };
}

function normalizeListPayload<T>(payload: T[] | { items: T[] } | undefined): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object' && Array.isArray((payload as { items?: T[] }).items)) {
    return (payload as { items: T[] }).items;
  }
  return [];
}

export async function submitRentalApplication(payload: SubmitRentalApplicationPayload): Promise<RentalApplication> {
  try {
    const { data } = await apiClient.post<ApiSingleResponse<RentalApplication>>(
      ENDPOINTS.RENTAL_APPS.SUBMIT,
      payload
    );
    if (!data.success) throw new Error(data.message || 'Failed to submit application');
    return normalizeRentalApplication(data.data as RawRentalApplication);
  } catch (error: any) {
    if (error.response?.data?.errors) {
      throw new Error(error.response.data.errors.map((e: any) => `${e.field}: ${e.message}`).join(', '));
    }
    throw new Error(error.response?.data?.message || error.message || 'Failed to submit application');
  }
}

export async function getMyRentalApplications(): Promise<RentalApplication[]> {
  const { data } = await apiClient.get<ApiListResponse<RentalApplication>>(ENDPOINTS.RENTAL_APPS.MINE);
  if (!data.success) throw new Error(data.message || 'Failed to get applications');
  return normalizeListPayload(data.data).map((app) => normalizeRentalApplication(app as RawRentalApplication));
}

export async function getRentalApplication(id: string): Promise<RentalApplication> {
  const { data } = await apiClient.get<ApiSingleResponse<RentalApplication>>(
    ENDPOINTS.RENTAL_APPS.DETAIL(id)
  );
  if (!data.success) throw new Error(data.message || 'Failed to get application');
  return normalizeRentalApplication(data.data as RawRentalApplication);
}

export async function withdrawRentalApplication(id: string): Promise<void> {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(
    ENDPOINTS.RENTAL_APPS.WITHDRAW(id)
  );
  if (!data.success) throw new Error(data.message || 'Failed to withdraw application');
}

export async function reviewRentalApplication(id: string, payload: ReviewApplicationPayload): Promise<void> {
  try {
    const { data } = await apiClient.patch<{ success: boolean; message: string }>(
      ENDPOINTS.RENTAL_APPS.REVIEW(id),
      payload
    );
    if (!data.success) throw new Error(data.message || 'Failed to review application');
  } catch (error: any) {
    if (error.response?.data?.errors) {
      throw new Error(error.response.data.errors.map((e: any) => `${e.field}: ${e.message}`).join(', '));
    }
    throw new Error(error.response?.data?.message || error.message || 'Failed to review application');
  }
}

export async function updateScreening(id: string, payload: ScreeningUpdatePayload): Promise<void> {
  try {
    const { data } = await apiClient.patch<{ success: boolean; message: string }>(
      ENDPOINTS.RENTAL_APPS.SCREENING(id),
      payload
    );
    if (!data.success) throw new Error(data.message || 'Failed to update screening');
  } catch (error: any) {
    if (error.response?.data?.errors) {
      const errs = error.response.data.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
      throw new Error(`Validation failed: ${errs}`);
    }
    throw new Error(error.response?.data?.message || error.message || 'Failed to update screening');
  }
}

export async function updateAppointment(id: string, payload: AppointmentUpdatePayload): Promise<void> {
  const { data } = await apiClient.patch<{ success: boolean; message: string }>(
    ENDPOINTS.RENTAL_APPS.APPOINTMENT(id),
    payload
  );
  if (!data.success) throw new Error(data.message || 'Failed to update appointment');
}

export async function createLeaseFromApplication(id: string, payload: CreateLeasePayload): Promise<{ id: string }> {
  try {
    const { data } = await apiClient.post<{ success: boolean; message: string; data: { id: string } }>(
      ENDPOINTS.RENTAL_APPS.CREATE_LEASE(id),
      payload
    );
    if (!data.success) throw new Error(data.message || 'Failed to create lease');
    return data.data;
  } catch (error: any) {
    if (error.response?.data?.errors) {
      throw new Error(error.response.data.errors.map((e: any) => `${e.field}: ${e.message}`).join(', '));
    }
    throw new Error(error.response?.data?.message || error.message || 'Failed to create lease');
  }
}
