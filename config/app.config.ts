import { SESSION_KEYS } from '@/lib/auth/session';

// ─── App Config ───────────────────────────────────────────────────────────────
// Central config for app-wide constants.
// Import from here instead of hardcoding strings in components.

export const appConfig = {
  name: "VEX Real Estate Blockchain Portal",
  shortName: 'VEX',
  version: '0.1.0',
  locale: 'en',

  // ── Storage Keys ────────────────────────────────────────────────────────
  // Re-exported from session.ts for convenience — single source of truth.
  storageKeys: SESSION_KEYS,

  // ── Auth Redirects ───────────────────────────────────────────────────────
  auth: {
    // Where to send users after login (role-specific redirect is done in middleware)
    loginRedirect: '/dashboard',
    // Where to send users after logout
    logoutRedirect: '/',
    // Public routes that do NOT require authentication
    publicRoutes: ['/', '/about', '/contact'],
    // Auth routes — redirect away if already logged in
    authRoutes: ['/login', '/register'],
  },

  // ── Pagination Defaults ──────────────────────────────────────────────────
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 25, 50],
  },

  // ── Feature Flags ────────────────────────────────────────────────────────
  // These mirror the env vars but provide safe defaults for mock mode.
  features: {
    walletLinking: process.env.NEXT_PUBLIC_ENABLE_WALLET === 'true',
    kycRestrictions: process.env.NEXT_PUBLIC_ENABLE_KYC === 'true',
  },

  // ── Mock Mode ────────────────────────────────────────────────────────────
  // true = use localStorage mock services (no backend needed)
  // false = use real API via axios-client
  isMockMode: !process.env.NEXT_PUBLIC_API_URL,
} as const;
