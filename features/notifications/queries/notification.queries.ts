import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { NotificationsParams, NotificationsResponse } from '@/features/notifications/types/notification.types';
import { getNotifications, markAllRead, markOneRead } from '@/features/notifications/services/notification.service';

const KEYS = {
  list: (params?: NotificationsParams) => ['notifications', 'list', params] as const,
};

// ─── useNotifications ─────────────────────────────────────────────────────────
// Polls every 30s. Accepts unreadOnly / page / limit filter params.

export function useNotifications(params: NotificationsParams = {}) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => getNotifications(params),
    refetchInterval: 30_000,
    staleTime: 20_000,
  });
}

// ─── useMarkAllRead ───────────────────────────────────────────────────────────
// POST /notifications/read-all  (optimistic — zeroes badge instantly)

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllRead,
    onMutate: async () => {
      // cancel in-flight refetches
      await qc.cancelQueries({ queryKey: ['notifications', 'list'] });

      // snapshot for rollback
      const snapshots = qc.getQueriesData<NotificationsResponse>({ queryKey: ['notifications', 'list'] });

      // optimistic: zero out unread everywhere
      qc.setQueriesData<NotificationsResponse>(
        { queryKey: ['notifications', 'list'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            unreadCount: 0,
            notifications: old.notifications.map((n) => ({ ...n, isRead: true })),
          };
        }
      );
      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      // rollback on error
      ctx?.snapshots?.forEach(([key, val]) => qc.setQueryData(key, val));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['notifications', 'list'] });
    },
  });
}

// ─── useMarkOneRead ───────────────────────────────────────────────────────────
// POST /notifications/{id}/read  (optimistic)

export function useMarkOneRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markOneRead(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['notifications', 'list'] });
      const snapshots = qc.getQueriesData<NotificationsResponse>({ queryKey: ['notifications', 'list'] });

      qc.setQueriesData<NotificationsResponse>(
        { queryKey: ['notifications', 'list'] },
        (old) => {
          if (!old) return old;
          const wasUnread = old.notifications.find((n) => n.id === id && !n.isRead);
          return {
            ...old,
            unreadCount: wasUnread ? Math.max(0, old.unreadCount - 1) : old.unreadCount,
            notifications: old.notifications.map((n) =>
              n.id === id ? { ...n, isRead: true } : n
            ),
          };
        }
      );
      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots?.forEach(([key, val]) => qc.setQueryData(key, val));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['notifications', 'list'] });
    },
  });
}
