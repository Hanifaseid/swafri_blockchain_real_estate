import { SESSION_KEYS } from "@/lib/auth/session";

// ─── App Config ───────────────────────────────────────────────────────────────
// Central config for app-wide constants.
// Import from here instead of hardcoding strings in components.

export const appConfig = {
  name: "EstateLedger Real Estate Blockchain Portal",
  shortName: "EstateLedger",
  version: "0.1.0",
  locale: "en",

  // ── Storage Keys ────────────────────────────────────────────────────────
  // Re-exported from session.ts for convenience — single source of truth.
  storageKeys: SESSION_KEYS,

  // ── Auth Redirects ───────────────────────────────────────────────────────
  auth: {
    // Fallback only. Role-specific redirects live in lib/auth/routes.ts.
    loginRedirect: "/",
    // Where to send users after logout
    logoutRedirect: "/",
    // Public routes that do NOT require authentication
    publicRoutes: ["/", "/about", "/contact"],
    // Auth routes — redirect away if already logged in
    authRoutes: ["/auth/login", "/auth/register"],
  },

  // ── Pagination Defaults ──────────────────────────────────────────────────
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 25, 50],
  },

  // ── Feature Flags ────────────────────────────────────────────────────────
  // These mirror the env vars but provide safe defaults for mock mode.
  features: {
    walletLinking: process.env.NEXT_PUBLIC_ENABLE_WALLET === "true",
    kycRestrictions: process.env.NEXT_PUBLIC_ENABLE_KYC === "true",
  },
  // ── Upload limits used by image/document upload components.
  upload: {
    maxFileSizeBytes: 10 * 1024 * 1024,
    maxPhotos: 20,
  },
  // ── Mock Mode ────────────────────────────────────────────────────────────
  // true = use localStorage mock services (no backend needed)
  // false = use real API via axios-client
  isMockMode: !process.env.NEXT_PUBLIC_API_URL,
} as const;
