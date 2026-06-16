import { create } from 'zustand';
import type { UserAccount } from '@/features/users/types/user.types';

// ─── Auth Store ───────────────────────────────────────────────────────────────
// Single source of truth for the current user in React.
// No component should read from localStorage directly — read from this store.
//
// Initialization:
//   AuthProvider (components/providers/AuthProvider.tsx) reads the session
//   from localStorage on mount and calls setUser() to hydrate this store.
//
// Usage:
//   const { currentUser, isAuthenticated } = useAuthStore();
//   const setUser = useAuthStore((s) => s.setUser);

interface AuthStore {
  // ── State ──────────────────────────────────────────────────────────────
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  // true while AuthProvider is reading the session on first mount
  isLoading: boolean;

  // ── Actions ────────────────────────────────────────────────────────────
  setUser: (user: UserAccount) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  // Call after a profile update to keep the store in sync with localStorage
  updateUser: (partial: Partial<UserAccount>) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  currentUser: null,
  isAuthenticated: false,
  isLoading: true, // starts true — AuthProvider resolves it on mount

  setUser: (user) =>
    set({
      currentUser: user,
      isAuthenticated: true,
      isLoading: false,
    }),

  clearUser: () =>
    set({
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  updateUser: (partial) => {
    const current = get().currentUser;
    if (!current) return;
    set({ currentUser: { ...current, ...partial } });
  },
}));
