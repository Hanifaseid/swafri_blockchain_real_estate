import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { Notification, NotificationsResponse } from '@/features/notifications/types/notification.types';

interface ApiResp<T> { success: boolean; message: string; data: T; }

function normalizeId(n: Record<string, unknown>): Notification {
  const id = (n.id ?? n._id ?? '') as string;
  return { ...(n as Notification), id };
}

// ─── getNotifications ────────────────────────────────────────────────────────
// GET /notifications

export async function getNotifications(): Promise<NotificationsResponse> {
  try {
    const { data } = await apiClient.get<ApiResp<unknown>>(ENDPOINTS.NOTIFICATIONS.LIST);
    if (!data.success) return { notifications: [], unreadCount: 0, total: 0 };

    const raw = data.data as Record<string, unknown>;

    // The API may return { notifications: [...], unreadCount: N } or just an array
    if (Array.isArray(raw)) {
      const notifications = (raw as Record<string, unknown>[]).map(normalizeId);
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
        total: notifications.length,
      };
    }

    const list = Array.isArray(raw?.notifications)
      ? (raw.notifications as Record<string, unknown>[]).map(normalizeId)
      : [];

    return {
      notifications: list,
      unreadCount: typeof raw?.unreadCount === 'number'
        ? raw.unreadCount
        : list.filter((n) => !n.isRead).length,
      total: typeof raw?.total === 'number' ? raw.total : list.length,
    };
  } catch {
    return { notifications: [], unreadCount: 0, total: 0 };
  }
}

// ─── markAllRead ──────────────────────────────────────────────────────────────
// POST /notifications/read-all

export async function markAllRead(): Promise<void> {
  await apiClient.post(ENDPOINTS.NOTIFICATIONS.READ_ALL).catch(() => {});
}

// ─── markOneRead ──────────────────────────────────────────────────────────────
// POST /notifications/{id}/read

export async function markOneRead(id: string): Promise<void> {
  if (!id) return;
  await apiClient.post(ENDPOINTS.NOTIFICATIONS.READ_ONE(id)).catch(() => {});
}
