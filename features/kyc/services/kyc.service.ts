import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';

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
    const { data } = await apiClient.get<KycResponse>(ENDPOINTS.KYC.ME);
    if (!data.success) return null;
    return data.data;
  } catch {
    return null;
  }
}

// ─── submitKycDocuments ───────────────────────────────────────────────────────
// POST /kyc/documents — multipart/form-data upload

export async function submitKycDocuments(files: File[], documentType: string): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append('documentType', documentType);
    files.forEach((file) => formData.append('documents', file));

    const { data } = await apiClient.post<{ success: boolean; message: string }>(
      ENDPOINTS.KYC.SUBMIT,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data.success;
  } catch {
    return false;
  }
}
