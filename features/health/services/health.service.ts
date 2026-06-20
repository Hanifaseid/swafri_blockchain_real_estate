import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { HealthResponse } from '../types/health.types';

export async function getLiveness(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>(ENDPOINTS.HEALTH.LIVENESS);
  return data;
}

export async function getReadiness(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>(ENDPOINTS.HEALTH.READINESS);
  return data;
}

export const healthService = {
  getLiveness,
  getReadiness,
};
