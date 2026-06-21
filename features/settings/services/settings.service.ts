import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { SystemSettings, UpdateSettingsPayload } from '../types/settings.types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

function normalize(raw: any): SystemSettings {
  return {
    id:                   raw._id ?? raw.id ?? '',
    platformName:         raw.platformName ?? 'EstateLedger',
    platformEmail:        raw.platformEmail ?? '',
    supportEmail:         raw.supportEmail ?? '',
    commissionRate:       Number(raw.commissionRate ?? 0),
    commissionType:       raw.commissionType ?? 'percentage',
    flatCommissionAmount: Number(raw.flatCommissionAmount ?? 0),
    commissionCurrency:   raw.commissionCurrency ?? 'USD',
    minTransactionAmount: Number(raw.minTransactionAmount ?? 0),
    maxTransactionAmount: Number(raw.maxTransactionAmount ?? 0),
    escrowEnabled:        raw.escrowEnabled ?? true,
    autoApproveListings:  raw.autoApproveListings ?? false,
    maintenanceMode:      raw.maintenanceMode ?? false,
    allowGuestBrowsing:   raw.allowGuestBrowsing ?? true,
    updatedBy:            raw.updatedBy,
    updatedAt:            raw.updatedAt ?? '',
    createdAt:            raw.createdAt ?? '',
  };
}

export async function getSystemSettings(): Promise<SystemSettings> {
  const { data } = await apiClient.get<ApiResponse<any>>(ENDPOINTS.SETTINGS.GET);
  if (!data.success) throw new Error(data.message || 'Failed to fetch settings');
  return normalize(data.data);
}

export async function updateSystemSettings(
  payload: UpdateSettingsPayload
): Promise<SystemSettings> {
  const { data } = await apiClient.put<ApiResponse<any>>(ENDPOINTS.SETTINGS.UPDATE, payload);
  if (!data.success) throw new Error(data.message || 'Failed to update settings');
  return normalize(data.data);
}
