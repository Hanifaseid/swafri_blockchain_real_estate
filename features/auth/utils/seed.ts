// ─── Dev Seed Credentials ─────────────────────────────────────────────────────
// These credentials are used by the dev QuickFillBar component only.
// They must match accounts that exist on the real backend.
// This file no longer manages any localStorage database.
//
// Quick-fill credentials (for dev use against real API):
//   superadmin@swafir.com / Admin@1234
//   admin@swafir.com      / Admin@1234
//   owner@swafir.com      / Owner@1234
//   tenant@swafir.com     / Tenant@1234

export const SEED_CREDENTIALS = [
  { role: 'SUPER_ADMIN',    email: 'superadmin@swafir.com', password: 'Admin@1234'  },
  { role: 'ADMIN',          email: 'admin@swafir.com',      password: 'Admin@1234'  },
  { role: 'PROPERTY_OWNER', email: 'owner@swafir.com',      password: 'Owner@1234'  },
  { role: 'TENANT',         email: 'tenant@swafir.com',     password: 'Tenant@1234' },
] as const;
