import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { KycStatusData } from '@/features/kyc/services/kyc.service';

interface ApiResp<T> { success: boolean; message: string; data: T; }

// ─── getUserKycDetails ────────────────────────────────────────────────────────
// GET /admin/users/{id}/kyc

export async function getUserKycDetails(id: string): Promise<KycStatusData | null> {
  try {
    const { data } = await apiClient.get<ApiResp<KycStatusData>>(ENDPOINTS.ADMIN.USER_KYC(id));
    if (!data.success) return null;
    return data.data;
  } catch {
    return null;
  }
}

// ─── reviewUserKyc ────────────────────────────────────────────────────────────
// POST /admin/users/{id}/kyc/review

export async function reviewUserKyc(
  id: string,
  decision: 'approve' | 'reject',
  note?: string
): Promise<void> {
  const payload: Record<string, string> = { decision };
  if (note && note.trim().length > 0) {
    payload.note = note.trim();
  }
  
  const { data } = await apiClient.post<ApiResp<void>>(
    ENDPOINTS.ADMIN.USER_KYC_REVIEW(id),
    payload
  );
  if (!data.success) {
    throw new Error(data.message || `Failed to ${decision} KYC`);
  }
}

// ─── getUserKycDocUrl ─────────────────────────────────────────────────────────
// GET /admin/users/{id}/kyc/documents/{docId}/url

export async function getUserKycDocUrl(id: string, docId: string): Promise<string | null> {
  try {
    const { data } = await apiClient.get<ApiResp<{ url: string }>>(
      ENDPOINTS.ADMIN.USER_KYC_DOC_URL(id, docId)
    );
    if (!data.success) return null;
    return data.data.url;
  } catch {
    return null;
  }
}
