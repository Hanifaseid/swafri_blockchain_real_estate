export const PERMISSIONS = {
  SUPER_ADMIN: [
    "manage_users",
    "manage_admins",
    "view_audit_logs",
    "override_actions",
  ],

  ADMIN: [
    "review_users",
    "review_kyc",
    "suspend_users",
  ],

  PROPERTY_OWNER: [
    "create_listing",
    "edit_listing",
    "view_inquiries",
  ],

  TENANT: [
    "browse_properties",
    "save_favorites",
    "send_inquiries",
  ],
} as const;

export type Role = keyof typeof PERMISSIONS;

export function hasPermission(role: Role, permission: string) {
  return PERMISSIONS[role]?.includes(permission as any);
}