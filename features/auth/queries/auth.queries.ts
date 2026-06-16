import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import {
  login,
  register,
  logout,
  getCurrentUser,
  createAdmin,
} from '@/features/auth/services/auth.service';
import type { LoginRequest, RegisterRequest } from '@/features/auth/types/auth.types';
import type { CreateAdminPayload } from '@/features/users/types/user.types';
import { useAuthStore } from '@/stores/auth.store';
import { queryKeys } from '@/lib/query/query-keys';
import { appConfig } from '@/config/app.config';

// ─── useCurrentUser ───────────────────────────────────────────────────────────
// Reads the active session and returns the current user.
// Used by AuthProvider on mount to hydrate the Zustand store.

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: getCurrentUser,
    // Don't retry if there's no session — null is a valid response
    retry: false,
    staleTime: Infinity,
  });
}

// ─── useLogin ─────────────────────────────────────────────────────────────────
// Submits login credentials, sets the Zustand store, and redirects.

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginRequest) => login(payload),

    onSuccess: (data) => {
      setUser(data.user);
      // Seed the query cache so useCurrentUser() is immediately satisfied
      queryClient.setQueryData(queryKeys.auth.me(), data.user);

      // Set auth cookies immediately so proxy.ts allows the redirect.
      // AuthProvider also sets these on mount, but we need them NOW before navigation.
      if (typeof document !== 'undefined') {
        const maxAge = 60 * 60 * 24 * 7; // 7 days
        document.cookie = `vex_authed=1; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `vex_user_role=${data.user.role}; path=/; max-age=${maxAge}; SameSite=Lax`;
      }

      // Role-based redirect
      router.push(appConfig.auth.loginRedirect);
    },
  });
}

// ─── useRegister ──────────────────────────────────────────────────────────────
// Submits registration, sets the Zustand store, and redirects.

export function useRegister() {
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterRequest) => register(payload),

    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(queryKeys.auth.me(), data.user);

      // Set auth cookies immediately so proxy.ts allows the redirect.
      if (typeof document !== 'undefined') {
        const maxAge = 60 * 60 * 24 * 7;
        document.cookie = `vex_authed=1; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `vex_user_role=${data.user.role}; path=/; max-age=${maxAge}; SameSite=Lax`;
      }

      router.push(appConfig.auth.loginRedirect);
    },
  });
}

// ─── useLogout ────────────────────────────────────────────────────────────────
// Logs out, clears the store and query cache, and redirects to home.

export function useLogout() {
  const clearUser = useAuthStore((s) => s.clearUser);
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,

    onSuccess: () => {
      clearUser();
      // Wipe all cached queries so stale data is not shown on next login
      queryClient.clear();
      router.push(appConfig.auth.logoutRedirect);
    },
  });
}

// ─── useCreateAdmin ───────────────────────────────────────────────────────────
// SUPER_ADMIN only — creates a new ADMIN account.
// Invalidates both the users list and the admins list cache.

export function useCreateAdmin() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAdminPayload) => {
      if (!currentUser) throw new Error('Not authenticated');
      return createAdmin(payload, currentUser);
    },

    onSuccess: () => {
      // Refresh both the users list and the admins list
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
}
