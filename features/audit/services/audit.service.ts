import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';

export type AuditLog = {
  id: string;
  timestamp: string;
  /** Actor display — role + short ID since API only returns actor ID */
  user: string;
  email: string;
  action: string;
  /** Raw actor ID from the API */
  actorId?: string;
  actorRole?: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
};

// ─── normalizeAuditLog ────────────────────────────────────────────────────────
// API shape: { _id, actor (ID string), actorRole, action, createdAt, metadata }

function normalizeAuditLog(raw: Record<string, any>): AuditLog {
  // Date — API uses createdAt
  const rawDate = raw.createdAt ?? raw.timestamp ?? raw.created_at ?? raw.date;
  let timestamp: string;
  if (typeof rawDate === 'number') {
    timestamp = new Date(rawDate < 1e12 ? rawDate * 1000 : rawDate).toISOString();
  } else if (rawDate) {
    timestamp = rawDate;
  } else {
    timestamp = new Date().toISOString();
  }

  // Actor — API returns actor as a plain ID string + actorRole
  const actorId: string = typeof raw.actor === 'string'
    ? raw.actor
    : raw.actor?.id ?? raw.actor?._id ?? '';

  const actorRole: string = raw.actorRole ?? raw.actor?.role ?? '';

  // Build a human-readable label: "admin" or "tenant" + short ID
  const roleLabel = actorRole ? actorRole.replace(/_/g, ' ') : 'system';
  const shortId = actorId ? `…${actorId.slice(-6)}` : '';
  const user = actorId ? `${roleLabel} ${shortId}` : roleLabel || 'System';

  return {
    id: raw._id ?? raw.id ?? String(Math.random()),
    timestamp,
    user,
    email: actorRole ?? '',   // repurpose email row to show role label
    action: raw.action ?? raw.event ?? raw.type ?? 'unknown',
    actorId,
    actorRole,
    targetType: raw.targetType,
    targetId: raw.targetId,
    metadata: raw.metadata,
  };
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const { data } = await apiClient.get<{ success: boolean; message: string; data: any }>(
    ENDPOINTS.ADMIN.AUDIT_LOGS
  );
  if (!data.success) {
    throw new Error(data.message ?? 'Failed to load audit logs');
  }

  const raw: Record<string, any>[] = Array.isArray(data.data)
    ? data.data
    : Array.isArray(data.data?.items)
    ? data.data.items
    : Array.isArray(data.data?.logs)
    ? data.data.logs
    : [];

  return raw.map(normalizeAuditLog);
}
