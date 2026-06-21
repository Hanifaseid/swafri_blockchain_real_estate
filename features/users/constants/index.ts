import type {
  AccountStatus,
  KycStatus,
  WalletStatus,
} from "@/features/users/types/user.types";
import type { UserRole } from "@/features/roles/types/role.types";

// ─── Account Status ───────────────────────────────────────────────────────────

export const ACCOUNT_STATUS_BADGE: Record<
  AccountStatus,
  { label: string; color: string }
> = {
  ACTIVE: { label: "Active", color: "bg-emerald-950/10 text-emerald-600" },
  PENDING: { label: "Pending", color: "bg-amber-950/10 text-amber-600" },
  SUSPENDED: { label: "Suspended", color: "bg-orange-950/10 text-orange-600" },
  BLOCKED: { label: "Blocked", color: "bg-red-950/10 text-red-600" },
  REJECTED: { label: "Rejected", color: "bg-red-950/10 text-red-700" },
};

// ─── KYC Status ───────────────────────────────────────────────────────────────

export const KYC_STATUS_BADGE: Record<
  KycStatus,
  { label: string; color: string }
> = {
  not_started:  { label: "Not Started",  color: "bg-white/5 text-black/60" },
  pending:      { label: "Pending",      color: "bg-amber-950/40 text-amber-900" },
  under_review: { label: "Under Review", color: "bg-blue-950/40 text-blue-700" },
  verified:     { label: "Verified",     color: "bg-emerald-950/40 text-emerald-700" },
  rejected:     { label: "Rejected",     color: "bg-red-950/40 text-red-700" },
  expired:      { label: "Expired",      color: "bg-gray-900/60 text-gray-500" },
};

// ─── Wallet Status ────────────────────────────────────────────────────────────

export const WALLET_STATUS_BADGE: Record<
  WalletStatus,
  { label: string; color: string }
> = {
  NOT_LINKED: { label: "Not Linked", color: "bg-slate-100 text-slate-700" },
  PENDING_SIGNATURE: { label: "Pending Signature", color: "bg-amber-950/40 text-amber-300" },
  LINKED: { label: "Linked", color: "bg-blue-950/40 text-blue-400" },
  VERIFIED: { label: "Verified", color: "bg-emerald-950/40 text-emerald-400" },
  REVOKED: { label: "Revoked", color: "bg-red-950/40 text-red-400" },
};

// ─── Role Badge ───────────────────────────────────────────────────────────────

export const ROLE_BADGE: Record<UserRole, { label: string; color: string }> = {
  SUPER_ADMIN: { label: "Super Admin", color: "bg-emerald-950/10 text-black" },
  ADMIN: { label: "Admin", color: "bg-emerald-950/10 text-black" },
  PROPERTY_OWNER: {
    label: "Property Owner",
    color: "bg-emerald-950/10 text-black",
  },
  TENANT: { label: "Tenant", color: "bg-emerald-950/10 text-black" },
};

// ─── Filter Options ───────────────────────────────────────────────────────────

export const ROLE_FILTER_OPTIONS: { value: UserRole | "ALL"; label: string }[] =
  [
    { value: "ALL", label: "All Roles" },
    { value: "TENANT", label: "Tenant" },
    { value: "PROPERTY_OWNER", label: "Property Owner" },
    { value: "ADMIN", label: "Admin" },
    { value: "SUPER_ADMIN", label: "Super Admin" },
  ];

export const STATUS_FILTER_OPTIONS: {
  value: AccountStatus | "ALL";
  label: string;
}[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "PENDING", label: "Pending" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "REJECTED", label: "Rejected" },
];
