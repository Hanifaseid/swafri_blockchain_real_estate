// ─── API Endpoints ────────────────────────────────────────────────────────────
// All API route strings. Base URL is set in axios-client.ts via NEXT_PUBLIC_API_URL.
// Confirmed against: https://real-estate-management-backend-grl9.onrender.com/api/v1

export const ENDPOINTS = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  AUTH: {
    LOGIN:           '/auth/login',
    REGISTER:        '/auth/register',
    LOGOUT:          '/auth/logout',
    ME:              '/auth/me',
    REFRESH:         '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD:  '/auth/reset-password',
  },

  // ── Users ─────────────────────────────────────────────────────────────────
  USERS: {
    LIST:       '/users',
    DETAIL:     (id: string) => `/users/${id}`,
    UPDATE:     (id: string) => `/users/${id}`,
    SUSPEND:    (id: string) => `/users/${id}/suspend`,
    BLOCK:      (id: string) => `/users/${id}/block`,
    REACTIVATE: (id: string) => `/users/${id}/reactivate`,
    ACTIVITY:   (id: string) => `/users/${id}/activity`,
  },

  // ── KYC ───────────────────────────────────────────────────────────────────
  KYC: {
    SUBMIT:  '/kyc/submit',
    STATUS:  '/kyc/status',
    REVIEW:  (userId: string) => `/kyc/${userId}/review`,
    APPROVE: (userId: string) => `/kyc/${userId}/approve`,
    REJECT:  (userId: string) => `/kyc/${userId}/reject`,
  },

  // ── Properties ────────────────────────────────────────────────────────────
  PROPERTIES: {
    LIST:          '/properties',
    DETAIL:        (id: string) => `/properties/${id}`,
    CREATE:        '/properties',
    UPDATE:        (id: string) => `/properties/${id}`,
    DELETE:        (id: string) => `/properties/${id}`,
    SUBMIT_REVIEW: (id: string) => `/properties/${id}/submit`,
    APPROVE:       (id: string) => `/properties/${id}/approve`,
    REJECT:        (id: string) => `/properties/${id}/reject`,
  },

  // ── Inquiries ─────────────────────────────────────────────────────────────
  INQUIRIES: {
    LIST:    '/inquiries',
    CREATE:  '/inquiries',
    DETAIL:  (id: string) => `/inquiries/${id}`,
    RESPOND: (id: string) => `/inquiries/${id}/respond`,
    CLOSE:   (id: string) => `/inquiries/${id}/close`,
  },

  // ── Wallet ────────────────────────────────────────────────────────────────
  WALLET: {
    LINK:   '/wallet/link',
    VERIFY: '/wallet/verify',
    STATUS: '/wallet/status',
    REVOKE: '/wallet/revoke',
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  DASHBOARD: {
    STATS:    '/dashboard/stats',
    ACTIVITY: '/dashboard/activity',
  },

  // ── Audit ─────────────────────────────────────────────────────────────────
  AUDIT: {
    LIST:   '/audit/logs',
    DETAIL: (id: string) => `/audit/logs/${id}`,
  },
} as const;
