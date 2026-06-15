import { z } from 'zod';

// ─── Environment Variable Schema ──────────────────────────────────────────────
// Validates env vars at startup. Any missing required var will throw at build time.
// All NEXT_PUBLIC_* vars are optional while running with mock data (no real backend).

const envSchema = z.object({
  // API — optional while using mock services; required when backend is live
  NEXT_PUBLIC_API_URL: z
    .string()
    .url('NEXT_PUBLIC_API_URL must be a valid URL')
    .optional(),

  // App
  NEXT_PUBLIC_APP_NAME: z.string().default('Swafir Real Estate'),
  NEXT_PUBLIC_APP_ENV: z
    .enum(['development', 'staging', 'production'])
    .default('development'),

  // Feature flags — safe to leave undefined in dev
  NEXT_PUBLIC_ENABLE_WALLET: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  NEXT_PUBLIC_ENABLE_KYC: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
});

// Parse and export — will throw a clear error if anything is wrong
export const env = envSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  NEXT_PUBLIC_ENABLE_WALLET: process.env.NEXT_PUBLIC_ENABLE_WALLET,
  NEXT_PUBLIC_ENABLE_KYC: process.env.NEXT_PUBLIC_ENABLE_KYC,
});

export type Env = z.infer<typeof envSchema>;
