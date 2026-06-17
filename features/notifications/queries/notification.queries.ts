import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAllRead, markOneRead } from '@/features/notifications/services/notification.service';

const KEYS = {
  list: ['notifications', 'list'] as const,
};

// ─── useNotifications ────────────────────────────────────────────────────────
// Polls every 30 seconds for live updates

export function useNotifications() {
  return useQuery({
    queryKey: KEYS.list,
    queryFn: getNotifications,
    refetchInterval: 30_000, // poll every 30s
    staleTime: 20_000,
  });
}

// ─── useMarkAllRead ───────────────────────────────────────────────────────────

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllRead,
    // Optimistic update — instantly zero out the badge
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: KEYS.list });
      const prev = qc.getQueryData(KEYS.list);
      qc.setQueryData(KEYS.list, (old: ReturnType<typeof useNotifications>['data']) => {
        if (!old) return old;
        return {
          ...old,
          unreadCount: 0,
          notifications: old.notifications.map((n) => ({ ...n, isRead: true })),
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(KEYS.list, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEYS.list }),
  });
}

// ─── useMarkOneRead ───────────────────────────────────────────────────────────

export function useMarkOneRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markOneRead(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: KEYS.list });
      const prev = qc.getQueryData(KEYS.list);
      qc.setQueryData(KEYS.list, (old: ReturnType<typeof useNotifications>['data']) => {
        if (!old) return old;
        return {
          ...old,
          unreadCount: Math.max(0, old.unreadCount - 1),
          notifications: old.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(KEYS.list, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEYS.list }),
  });
}
