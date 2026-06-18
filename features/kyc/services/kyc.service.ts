import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { updateSessionUser } from '@/lib/auth/session';
import { useAuthStore } from '@/stores/auth.store';

// ─── KYC Status shape from API ────────────────────────────────────────────────

export interface KycDocument {
  id: string;
  type: string;
  status: string;
  uploadedAt: string;
  reviewNote?: string;
}

export interface KycStatusData {
  kycStatus: string;
  accountStatus: string;
  reviewNote?: string;
  documents: KycDocument[];
}

interface KycResponse {
  success: boolean;
  message: string;
  data: KycStatusData;
}

// ─── getKycStatus ─────────────────────────────────────────────────────────────
// GET /kyc/me — own KYC status and documents

export async function getKycStatus(): Promise<KycStatusData | null> {
  try {
    const { data } = await apiClient.get<KycResponse | Record<string, any>>(ENDPOINTS.KYC.ME);
    if (!data.success) return null;

    const raw = data.data as any;
    
    let fetchedStatus = (raw?.kycStatus || raw?.status || 'not_started').toLowerCase();
    if (fetchedStatus === 'approved') fetchedStatus = 'verified';
    if (fetchedStatus === 'under_review') fetchedStatus = 'pending';

    const statusResult = {
      kycStatus: fetchedStatus,
      accountStatus: raw?.accountStatus || 'ACTIVE',
      reviewNote: raw?.reviewNote,
      documents: raw?.documents || []
    };

    // Synchronize the global user session whenever KYC status is successfully fetched
    if (typeof window !== 'undefined') {
      updateSessionUser({ kycStatus: statusResult.kycStatus as any });
      useAuthStore.getState().updateUser({ kycStatus: statusResult.kycStatus as any });
    }

    return statusResult;
  } catch {
    return null;
  }
}

// ─── submitKycDocuments ───────────────────────────────────────────────────────
// POST /kyc/documents — multipart/form-data upload

export async function submitKycDocuments(files: File[], documentType: string): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append('type', documentType);
    files.forEach((file) => formData.append('documents', file));

    const { data } = await apiClient.post<{ success: boolean; message: string }>(
      ENDPOINTS.KYC.SUBMIT,
      formData,
      { 
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 0 
      }
    );
    return data.success;
  } catch {
    return false;
  }
}
