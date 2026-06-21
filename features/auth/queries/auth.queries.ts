import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import {
  login,
  register,
  logout,
  getCurrentUser,
  createAdmin,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
  requestWalletChallenge,
  linkWallet,
  unlinkWallet,
} from '@/features/auth/services/auth.service';
import type { LoginRequest, RegisterRequest } from '@/features/auth/types/auth.types';
import type { CreateAdminPayload } from '@/features/users/types/user.types';
import { useAuthStore } from '@/stores/auth.store';
import { queryKeys } from '@/lib/query/query-keys';
import { appConfig } from '@/config/app.config';
import { getDefaultRouteForRole, isAdminRole } from '@/lib/auth/routes';

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
      queryClient.setQueryData(queryKeys.auth.me(), data.user);

      if (typeof document !== 'undefined') {
        const maxAge = 60 * 60 * 24 * 7;
        document.cookie = `vex_authed=1; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `vex_user_role=${data.user.role}; path=/; max-age=${maxAge}; SameSite=Lax`;
      }

      // If admin assigned a temporary password, force change before dashboard access
      const mustReset = typeof window !== 'undefined' && localStorage.getItem('vex_must_reset_password') === '1';
      if (mustReset) {
        router.push(isAdminRole(data.user.role) ? '/admin/profile?mustReset=1' : '/account/profile?mustReset=1');
      } else {
        router.push(getDefaultRouteForRole(data.user.role));
      }
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

      router.push(getDefaultRouteForRole(data.user.role));
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
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
}

// ─── useForgotPassword ────────────────────────────────────────────────────────

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
  });
}

// ─── useResetPassword ─────────────────────────────────────────────────────────

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      resetPassword(token, newPassword),
  });
}

// ─── useChangePassword ────────────────────────────────────────────────────────

export function useChangePassword() {
  const clearUser = useAuthStore((s) => s.clearUser);
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      changePassword(currentPassword, newPassword),

    onSuccess: () => {
      clearUser();
      queryClient.clear();
      // Clear auth cookies
      if (typeof document !== 'undefined') {
        document.cookie = 'vex_authed=; path=/; max-age=0';
        document.cookie = 'vex_user_role=; path=/; max-age=0';
      }
      router.push('/auth/login');
    },
  });
}

// ─── useUpdateProfile ─────────────────────────────────────────────────────────

export function useUpdateProfile() {
  const updateUser = useAuthStore((s) => s.updateUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { name?: string; phone?: string }) => updateProfile(payload),
    onSuccess: (user) => {
      updateUser({ name: user.name, phone: user.phone });
      queryClient.setQueryData(queryKeys.auth.me(), user);
    },
  });
}

// ─── useWalletChallenge ───────────────────────────────────────────────────────

export function useWalletChallenge() {
  return useMutation({
    mutationFn: (walletAddress: string) => requestWalletChallenge(walletAddress),
  });
}

// ─── useLinkWallet ────────────────────────────────────────────────────────────

export function useLinkWallet() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: ({ walletAddress, signature }: { walletAddress: string; signature: string }) => {
      if (!currentUser) throw new Error('Not authenticated');
      return linkWallet(walletAddress, signature, currentUser);
    },
    onSuccess: (updated) => {
      updateUser({ walletStatus: updated.walletStatus, linkedWalletAddress: updated.linkedWalletAddress });
    },
  });
}

// ─── useUnlinkWallet ──────────────────────────────────────────────────────────

export function useUnlinkWallet() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: () => {
      if (!currentUser) throw new Error('Not authenticated');
      return unlinkWallet(currentUser);
    },
    onSuccess: (updated) => {
      updateUser({ walletStatus: updated.walletStatus, linkedWalletAddress: undefined });
    },
  });
}