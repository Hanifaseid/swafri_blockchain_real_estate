import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { useAuthStore } from '@/stores/auth.store';

// ─── KYC Status shape from API ────────────────────────────────────────────────

export interface KycDocument {
  id: string;
  type: string;
  status: string;
  uploadedAt: string;
  reviewNote?: string;
  hash?: string;
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

export async function getKycDocumentUrl(docId: string): Promise<string | null> {
  try {
    const { data } = await apiClient.get<any>(ENDPOINTS.KYC.DOC_URL(docId));
    if (data.success && data.data?.url) {
      return data.data.url;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── getKycStatus ─────────────────────────────────────────────────────────────
// GET /kyc/me — own KYC status and documents

export async function getKycStatus(): Promise<KycStatusData | null> {
  try {
    const { data } = await apiClient.get<KycResponse | Record<string, any>>(ENDPOINTS.KYC.ME);
    if (!data.success) return null;

    const raw = data.data as any;
    
    // Normalise only 'approved' → 'verified'. Keep 'under_review' as-is.
    let fetchedStatus = (raw?.kycStatus || raw?.status || 'not_started').toLowerCase();
    if (fetchedStatus === 'approved') fetchedStatus = 'verified';

    const statusResult: KycStatusData = {
      kycStatus: fetchedStatus,
      accountStatus: raw?.accountStatus || 'ACTIVE',
      reviewNote: raw?.reviewNote,
      documents: raw?.documents || []
    };

    // Synchronize the global user session whenever KYC status is successfully fetched
    if (typeof window !== 'undefined') {
      useAuthStore.getState().updateUser({ kycStatus: statusResult.kycStatus as any });
    }

    return statusResult;
  } catch {
    return null;
  }
}

// ─── submitKycDocuments ───────────────────────────────────────────────────────
// POST /kyc/documents — multipart/form-data upload

export async function submitKycDocuments(files: File[], documentType: string): Promise<KycStatusData> {
  const formData = new FormData();
  formData.append('type', documentType);
  files.forEach((file) => formData.append('documents', file));

  const { data } = await apiClient.post<{ success: boolean; message: string; data: any }>(
    ENDPOINTS.KYC.SUBMIT,
    formData,
    { 
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 0 
    }
  );

  if (!data.success) throw new Error(data.message || 'Failed to submit documents');

  const raw = data.data;
  let fetchedStatus = (raw?.kycStatus || 'pending').toLowerCase();
  if (fetchedStatus === 'approved') fetchedStatus = 'verified';

  return {
    kycStatus: fetchedStatus,
    accountStatus: raw?.accountStatus || 'ACTIVE',
    reviewNote: raw?.reviewNote,
    documents: raw?.documents || []
  };
}
