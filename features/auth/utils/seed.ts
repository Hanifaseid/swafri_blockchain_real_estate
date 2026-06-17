// ─── Dev Credentials ──────────────────────────────────────────────────────────
// Real seeded accounts from the backend (npm run seed:users).
// Only shown in development mode.

export const SEED_CREDENTIALS = [
  { role: 'SUPER_ADMIN',    label: 'SUPERADMIN', email: 'superadmin@realestate.dev', password: 'SuperAdmin1!'    },
  { role: 'ADMIN',          label: 'ADMIN',      email: 'admin@realestate.dev',      password: 'PlatformAdmin1!' },
  { role: 'PROPERTY_OWNER', label: 'OWNER',      email: 'owner@realestate.dev',      password: 'PropertyOwner1!' },
  { role: 'TENANT',         label: 'TENANT',     email: 'tenant@realestate.dev',     password: 'TenantUser1!'    },
] as const;
