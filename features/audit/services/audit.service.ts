import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';

export type AuditLog = {
  id: string;
  timestamp: string;
  user: string;
  email: string;
  action: string;
  // optional fields if backend provides them
  nodeId?: string;
  blockHeight?: string;
  txHash?: string;
  witnessKey?: string;
  consensusStatus?: string;
};

export async function getAuditLogs(): Promise<AuditLog[]> {
  const { data } = await apiClient.get<{ success: boolean; message: string; data: AuditLog[] }>(
    ENDPOINTS.ADMIN.AUDIT_LOGS
  );
  if (!data.success) {
    throw new Error(data.message ?? 'Failed to load audit logs');
  }
  return data.data;
}
