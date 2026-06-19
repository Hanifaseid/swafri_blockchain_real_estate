import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  Notification,
  NotificationsResponse,
  NotificationsParams,
} from '@/features/notifications/types/notification.types';

interface ApiResp<T> { success: boolean; message: string; data: T; }

function normalizeId(n: Record<string, unknown>): Notification {
  const id = (n.id ?? n._id ?? '') as string;
  return { ...(n as unknown as Notification), id };
}

// ─── getNotifications ─────────────────────────────────────────────────────────
// GET /notifications?unreadOnly=false&page=1&limit=20

export async function getNotifications(
  params: NotificationsParams = {}
): Promise<NotificationsResponse> {
  try {
    const { data } = await apiClient.get<ApiResp<unknown>>(
      ENDPOINTS.NOTIFICATIONS.LIST,
      {
        params: {
          unreadOnly: params.unreadOnly ?? false,
          page:       params.page  ?? 1,
          limit:      params.limit ?? 20,
        },
      }
    );

    if (!data.success) return { notifications: [], unreadCount: 0, total: 0 };

    const raw = data.data as Record<string, unknown>;

    // Shape A: data is a plain array
    if (Array.isArray(raw)) {
      const notifications = (raw as Record<string, unknown>[]).map(normalizeId);
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
        total: notifications.length,
      };
    }

    // Shape B (actual API): { items: [...], unread: N, total: N, page: N, limit: N }
    // Shape C (fallback):   { notifications: [...], unreadCount: N, total: N }
    const rawItems =
      Array.isArray(raw?.items)         ? (raw.items as Record<string, unknown>[])
      : Array.isArray(raw?.notifications) ? (raw.notifications as Record<string, unknown>[])
      : [];

    const list = rawItems.map(normalizeId);

    const unreadCount =
      typeof raw?.unread      === 'number' ? raw.unread      :
      typeof raw?.unreadCount === 'number' ? raw.unreadCount :
      list.filter((n) => !n.isRead).length;

    return {
      notifications: list,
      unreadCount,
      total: typeof raw?.total === 'number' ? raw.total : list.length,
    };
  } catch (err: any) {
    // Handle rate limiting gracefully - return empty data instead of throwing
    if (err?.response?.status === 429) {
      console.warn('[Notifications API] Rate limit hit, will retry later');
      return { notifications: [], unreadCount: 0, total: 0 };
    }
    console.error('[Notifications API] error:', err);
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
