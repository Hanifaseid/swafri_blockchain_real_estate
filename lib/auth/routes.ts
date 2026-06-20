import type { UserRole } from "@/features/roles/types/role.types";

export const ADMIN_ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN"];

export function isAdminRole(role?: UserRole | null): boolean {
  return !!role && ADMIN_ROLES.includes(role);
}

export function getDefaultRouteForRole(role: UserRole): string {
  if (role === "SUPER_ADMIN" || role === "ADMIN") return "/admin/dashboard";
  return "/";
}

export function isAdminShellPath(pathname: string): boolean {
  return pathname.startsWith("/admin");
}
