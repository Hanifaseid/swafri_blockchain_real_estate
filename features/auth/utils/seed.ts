// ─── Dev Credentials ──────────────────────────────────────────────────────────
// Real API credentials for the dev QuickFillBar.
// Only rendered in development mode (process.env.NODE_ENV !== 'production').

export const SEED_CREDENTIALS = [
  {
    role:     'SUPER_ADMIN',
    label:    'SUPERADMIN',
    email:    'superadmin@realestate.dev',
    password: 'SuperAdmin1!',
  },
  {
    role:     'TENANT',
    label:    'TENANT',
    email:    'test@swafir.com',
    password: 'Test@1234',
  },
  {
    role:     'PROPERTY_OWNER',
    label:    'OWNER',
    email:    'owner.test2@swafir.com',
    password: 'Owner@1234',
  },
] as const;
