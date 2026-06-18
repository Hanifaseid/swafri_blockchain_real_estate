import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { 
  RentalApplication, 
  SubmitRentalApplicationPayload,
  ReviewApplicationPayload,
  ScreeningUpdatePayload,
  AppointmentUpdatePayload,
  CreateLeasePayload
} from '../types/rental-application.types';

interface ApiListResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    total: number;
  };
}

interface ApiSingleResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function submitRentalApplication(payload: SubmitRentalApplicationPayload): Promise<RentalApplication> {
  try {
    const { data } = await apiClient.post<ApiSingleResponse<RentalApplication>>(
      ENDPOINTS.RENTAL_APPS.SUBMIT,
      payload
    );
    if (!data.success) throw new Error(data.message || 'Failed to submit application');
    return data.data;
  } catch (error: any) {
    if (error.response?.data?.errors) {
      throw new Error(error.response.data.errors.map((e: any) => `${e.field}: ${e.message}`).join(', '));
    }
    throw new Error(error.response?.data?.message || error.message || 'Failed to submit application');
  }
}

export async function getMyRentalApplications(): Promise<RentalApplication[]> {
  const { data } = await apiClient.get<any>(
    ENDPOINTS.RENTAL_APPS.MINE
  );
  if (!data.success) throw new Error(data.message || 'Failed to get applications');
  
  if (Array.isArray(data.data)) {
    return data.data;
  }
  return data.data?.items || [];
}

export async function getRentalApplication(id: string): Promise<RentalApplication> {
  const { data } = await apiClient.get<ApiSingleResponse<RentalApplication>>(
    ENDPOINTS.RENTAL_APPS.DETAIL(id)
  );
  if (!data.success) throw new Error(data.message || 'Failed to get application');
  return data.data;
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
