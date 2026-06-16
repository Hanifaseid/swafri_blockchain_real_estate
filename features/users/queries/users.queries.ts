import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import type { UserFilters } from '@/features/users/types/user.types';
import {
  getUsers,
  getUserById,
  suspendUser,
  blockUser,
  reactivateUser,
} from '@/features/users/services/users.service';
import { useAuthStore } from '@/stores/auth.store';
import { queryKeys } from '@/lib/query/query-keys';

// ─── useUsers ─────────────────────────────────────────────────────────────────

export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: queryKeys.users.list(filters ?? {}),
    queryFn: () => getUsers(filters),
  });
}

// ─── useUser ──────────────────────────────────────────────────────────────────

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => getUserById(id),
    enabled: !!id,
  });
}

// ─── useSuspendUser ───────────────────────────────────────────────────────────

export function useSuspendUser() {
  const qc = useQueryClient();
  const actor = useAuthStore((s) => s.currentUser);

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) => {
      if (!actor) throw new Error('Not authenticated');
      return suspendUser(userId, actor, reason);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all() });
      toast.success('User suspended.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ─── useBlockUser ─────────────────────────────────────────────────────────────

export function useBlockUser() {
  const qc = useQueryClient();
  const actor = useAuthStore((s) => s.currentUser);

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) => {
      if (!actor) throw new Error('Not authenticated');
      return blockUser(userId, actor, reason);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all() });
      toast.success('User blocked.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ─── useReactivateUser ────────────────────────────────────────────────────────

export function useReactivateUser() {
  const qc = useQueryClient();
  const actor = useAuthStore((s) => s.currentUser);

  return useMutation({
    mutationFn: (userId: string) => {
      if (!actor) throw new Error('Not authenticated');
      return reactivateUser(userId, actor);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all() });
      toast.success('User reactivated.');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
