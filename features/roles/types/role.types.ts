// ─── User Roles ──────────────────────────────────────────────────────────────
// These are the four roles supported by the Swafir platform.
// SUPER_ADMIN and ADMIN cannot be created via public registration.

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'PROPERTY_OWNER' | 'TENANT';

// Roles that are allowed to register publicly
export const PUBLIC_REGISTRATION_ROLES: UserRole[] = ['PROPERTY_OWNER', 'TENANT'];

// Human-readable labels for each role
export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  PROPERTY_OWNER: 'Property Owner',
  TENANT: 'Tenant',
};

// Role hierarchy — higher number = more privilege
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  TENANT: 1,
  PROPERTY_OWNER: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

// Dashboard route each role lands on after login
export const ROLE_DEFAULT_ROUTES: Record<UserRole, string> = {
  SUPER_ADMIN: '/dashboard',
  ADMIN: '/dashboard',
  PROPERTY_OWNER: '/',
  TENANT: '/',
};
