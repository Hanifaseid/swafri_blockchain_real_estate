import type { UserRole } from "@/features/roles/types/role.types";

export interface RoutePermission {
  path: string;
  allowedRoles?: UserRole[];
}

export const protectedRoutes: RoutePermission[] = [
  // Admin routes — all under /admin
  { path: "/admin", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { path: "/admin/roles", allowedRoles: ["SUPER_ADMIN"] },
  { path: "/admin/permissions", allowedRoles: ["SUPER_ADMIN"] },

  // Account routes — tenant/owner self-service
  { path: "/account", allowedRoles: ["PROPERTY_OWNER", "TENANT"] },
];

export const publicRoutes: string[] = [
  "/",
  "/about",
  "/contact",
  "/properties",
  "/listings",
];

export const authRoutes: string[] = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
];

export function canAccessRoute(path: string, role: UserRole): boolean {
  const matched = protectedRoutes
    .filter((r) => path === r.path || path.startsWith(r.path + "/"))
    .sort((a, b) => b.path.length - a.path.length)[0];

  if (!matched?.allowedRoles) return true;
  return matched.allowedRoles.includes(role);
}
