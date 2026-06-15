export type Role =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "PROPERTY_OWNER"
  | "TENANT";

export type NavItem = {
  label: string;
  href: string;
  icon?: string;
};