// ─── Query Keys ───────────────────────────────────────────────────────────────
// Centralized factory for TanStack Query cache keys.
// Always use these instead of inline string arrays to avoid typos
// and make cache invalidation predictable.
//
// Usage:
//   useQuery({ queryKey: queryKeys.users.detail('usr-1'), ... })
//   queryClient.invalidateQueries({ queryKey: queryKeys.users.all })

export const queryKeys = {
  // ── Auth ────────────────────────────────────────────────────────────────
  auth: {
    me: () => ['auth', 'me'] as const,
  },

  // ── Users ────────────────────────────────────────────────────────────────
  users: {
    all: () => ['users'] as const,
    lists: () => ['users', 'list'] as const,
    list: (filters: Record<string, unknown>) => ['users', 'list', filters] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
    activity: (id: string) => ['users', 'activity', id] as const,
  },

  // ── KYC ──────────────────────────────────────────────────────────────────
  kyc: {
    own: () => ['kyc', 'own'] as const,
    all: () => ['kyc', 'all'] as const,
    detail: (userId: string) => ['kyc', 'detail', userId] as const,
  },

  // ── Properties ───────────────────────────────────────────────────────────
  properties: {
    all: () => ['properties'] as const,
    lists: () => ['properties', 'list'] as const,
    list: (filters: Record<string, unknown>) => ['properties', 'list', filters] as const,
    detail: (id: string) => ['properties', 'detail', id] as const,
    own: () => ['properties', 'own'] as const,
  },

  // ── Inquiries ────────────────────────────────────────────────────────────
  inquiries: {
    all: () => ['inquiries'] as const,
    own: () => ['inquiries', 'own'] as const,
    detail: (id: string) => ['inquiries', 'detail', id] as const,
  },

  // ── Wallet ───────────────────────────────────────────────────────────────
  wallet: {
    status: () => ['wallet', 'status'] as const,
  },

  // ── Favorites ─────────────────────────────────────────────────────────────
  favorites: {
    all: () => ['favorites'] as const,
  },

  // ── Dashboard ────────────────────────────────────────────────────────────
  dashboard: {
    stats: () => ['dashboard', 'stats'] as const,
    activity: () => ['dashboard', 'activity'] as const,
  },

  // ── Audit Logs ───────────────────────────────────────────────────────────
  audit: {
    all: () => ['audit', 'logs'] as const,
    list: (filters: Record<string, unknown>) => ['audit', 'logs', filters] as const,
  },
} as const;
