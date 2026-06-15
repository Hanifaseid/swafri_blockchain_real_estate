import type { UserAccountWithPassword } from '@/features/users/types/user.types';
import { SESSION_KEYS } from '@/lib/auth/session';

// ─── Seed Users ───────────────────────────────────────────────────────────────
// The 4 default accounts used in mock/dev mode.
// SUPER_ADMIN and ADMIN are created here — they cannot register publicly.
// Passwords are stored as plain text intentionally for mock/prototype mode.
// When the real backend is connected, this file is no longer used.
//
// Quick-fill credentials (for dev use):
//   superadmin@swafir.com / Admin@1234
//   admin@swafir.com      / Admin@1234
//   owner@swafir.com      / Owner@1234
//   tenant@swafir.com     / Tenant@1234

export const SEED_USERS: UserAccountWithPassword[] = [
  {
    id: 'usr-1',
    name: 'Serena Vance',
    email: 'superadmin@swafir.com',
    passwordHash: 'Admin@1234',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    kycStatus: 'APPROVED',
    walletStatus: 'VERIFIED',
    linkedWalletAddress: '0xSuperAdminWalletMock001',
    createdAt: '2024-01-10T12:00:00Z',
    updatedAt: '2024-01-10T12:00:00Z',
  },
  {
    id: 'usr-2',
    name: 'Darius Thorne',
    email: 'admin@swafir.com',
    passwordHash: 'Admin@1234',
    role: 'ADMIN',
    status: 'ACTIVE',
    kycStatus: 'APPROVED',
    walletStatus: 'VERIFIED',
    linkedWalletAddress: '0xAdminWalletMock002',
    createdAt: '2024-02-15T09:30:00Z',
    updatedAt: '2024-02-15T09:30:00Z',
  },
  {
    id: 'usr-3',
    name: 'Lord Sterling',
    email: 'owner@swafir.com',
    passwordHash: 'Owner@1234',
    role: 'PROPERTY_OWNER',
    status: 'ACTIVE',
    kycStatus: 'PENDING',
    walletStatus: 'LINKED',
    linkedWalletAddress: '0xOwnerWalletMock003',
    phone: '+41 79 123 4567',
    createdAt: '2024-03-20T14:45:00Z',
    updatedAt: '2024-03-20T14:45:00Z',
  },
  {
    id: 'usr-4',
    name: 'Julian Carter',
    email: 'tenant@swafir.com',
    passwordHash: 'Tenant@1234',
    role: 'TENANT',
    status: 'ACTIVE',
    kycStatus: 'APPROVED',
    walletStatus: 'VERIFIED',
    linkedWalletAddress: '0xTenantWalletMock004',
    phone: '+1 (555) 765-4321',
    createdAt: '2024-04-01T11:15:00Z',
    updatedAt: '2024-04-01T11:15:00Z',
  },
];

// ─── Seed Init ────────────────────────────────────────────────────────────────
// Call once on app start (in AuthProvider) to populate localStorage
// if the users database does not exist yet.

export function initSeedUsers(): void {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem(SESSION_KEYS.USERS_DB);
  if (!stored) {
    localStorage.setItem(SESSION_KEYS.USERS_DB, JSON.stringify(SEED_USERS));
  }
}

// ─── Get All Users ────────────────────────────────────────────────────────────
// Reads the mock users database from localStorage.

export function getMockUsers(): UserAccountWithPassword[] {
  if (typeof window === 'undefined') return SEED_USERS;
  const raw = localStorage.getItem(SESSION_KEYS.USERS_DB);
  if (!raw) return SEED_USERS;
  try {
    return JSON.parse(raw) as UserAccountWithPassword[];
  } catch {
    return SEED_USERS;
  }
}

// ─── Save All Users ───────────────────────────────────────────────────────────
// Writes the mock users database to localStorage.

export function saveMockUsers(users: UserAccountWithPassword[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEYS.USERS_DB, JSON.stringify(users));
}
