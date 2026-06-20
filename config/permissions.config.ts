import type { UserRole } from "@/features/roles/types/role.types";

export interface RoutePermission {
  path: string;
  allowedRoles?: UserRole[];
}

export const protectedRoutes: RoutePermission[] = [
  { path: "/dashboard", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { path: "/users", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { path: "/roles", allowedRoles: ["SUPER_ADMIN"] },
  { path: "/permissions", allowedRoles: ["SUPER_ADMIN"] },
  { path: "/audit", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { path: "/compliance", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { path: "/transactions", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { path: "/chain-transactions", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { path: "/settings", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { path: "/kyc", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { path: "/profile", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { path: "/inquiries", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { path: "/offers", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { path: "/leases", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { path: "/applications", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { path: "/saved", allowedRoles: ["TENANT"] },
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
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export function canAccessRoute(path: string, role: UserRole): boolean {
  const matched = protectedRoutes
    .filter((r) => path === r.path || path.startsWith(r.path + "/"))
    .sort((a, b) => b.path.length - a.path.length)[0];

  if (!matched?.allowedRoles) return true;
  return matched.allowedRoles.includes(role);
}
