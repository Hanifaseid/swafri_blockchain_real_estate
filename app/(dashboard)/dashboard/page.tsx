"use client";

import { useAuthStore } from "@/stores/auth.store";
import { ROLE_LABELS } from "@/features/roles/types/role.types";
import {
  ACCOUNT_STATUS_LABELS,
  KYC_STATUS_LABELS,
  WALLET_STATUS_LABELS,
} from "@/features/users/types/user.types";
import {
  Users,
  Building2,
  BadgeCheck,
  Wallet,
  Activity,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from "lucide-react";
import HealthPanel from "@/components/health/HealthPanel";

// Dashboard overview page — role-aware content.
// Each role sees their own summary cards.
// Full chart + stats components (from /components/charts/) wired in later.

export default function DashboardPage() {
  const { currentUser, isLoading } = useAuthStore();

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  const role = currentUser.role;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-black/40 mb-1">
          {ROLE_LABELS[role]} Dashboard
        </p>
        <h1 className="text-2xl font-light text-[#0f172a] tracking-tight">
          Welcome back, {currentUser.name.split(" ")[0]}
        </h1>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="dash-card p-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-2">
            Role
          </div>
          <div className="text-sm font-semibold text-[#0f172a]">
            {ROLE_LABELS[role]}
          </div>
        </div>

        <div className="dash-card p-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-2">
            Account
          </div>
          <div
            className={`text-sm font-semibold status-${currentUser.status.toLowerCase()}`}
          >
            {ACCOUNT_STATUS_LABELS[currentUser.status]}
          </div>
        </div>

        <div className="dash-card p-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-2">
            KYC
          </div>
          <div
            className="text-sm font-semibold"
            style={{ color: getKycColor(currentUser.kycStatus) }}
          >
            {KYC_STATUS_LABELS[currentUser.kycStatus]}
          </div>
        </div>

        <div className="dash-card p-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-2">
            Wallet
          </div>
          <div className="text-sm font-semibold text-black/70">
            {WALLET_STATUS_LABELS[currentUser.walletStatus]}
          </div>
        </div>
      </div>

      {/* Role-specific quick actions */}
      {role === "TENANT" && <TenantOverview />}
      {role === "PROPERTY_OWNER" && <OwnerOverview />}
      {role === "ADMIN" && <AdminOverview />}
      {role === "SUPER_ADMIN" && <SuperAdminOverview />}
    </div>
  );
}

// ─── Role Overview Panels ─────────────────────────────────────────────────────

function TenantOverview() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <QuickCard
        icon={<Building2 className="w-5 h-5 text-emerald-400" />}
        title="Browse Properties"
        desc="Discover verified listings for rent and sale"
        href="/properties"
      />
      <QuickCard
        icon={<BadgeCheck className="w-5 h-5 text-emerald-400" />}
        title="Complete KYC"
        desc="Verify your identity to unlock full access"
        href="/kyc"
      />
      <QuickCard
        icon={<Wallet className="w-5 h-5 text-emerald-400" />}
        title="Link Wallet"
        desc="Connect your wallet for blockchain transactions"
        href="/kyc"
      />
    </div>
  );
}

function OwnerOverview() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <QuickCard
        icon={<Building2 className="w-5 h-5 text-purple-400" />}
        title="My Properties"
        desc="Manage your listed and draft properties"
        href="/dashboard/properties"
      />
      <QuickCard
        icon={<Activity className="w-5 h-5 text-purple-400" />}
        title="Inquiries"
        desc="View and respond to tenant inquiries"
        href="/dashboard/inquiries"
      />
      <QuickCard
        icon={<BadgeCheck className="w-5 h-5 text-purple-400" />}
        title="KYC & Wallet"
        desc="Complete verification to publish properties"
        href="/dashboard/kyc"
      />
    </div>
  );
}

function AdminOverview() {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <QuickCard
          icon={<Users className="w-5 h-5 text-blue-400" />}
          title="Manage Users"
          desc="Review, suspend or reactivate user accounts"
          href="/dashboard/users"
        />
        <QuickCard
          icon={<BadgeCheck className="w-5 h-5 text-blue-400" />}
          title="KYC Review"
          desc="Review pending KYC submissions"
          href="/dashboard/kyc"
        />
        <QuickCard
          icon={<Activity className="w-5 h-5 text-blue-400" />}
          title="Audit Logs"
          desc="Monitor platform activity and actions"
          href="/dashboard/audit"
        />
      </div>
      <HealthPanel />
    </div>
  );
}

function SuperAdminOverview() {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <QuickCard
          icon={<ShieldCheck className="w-5 h-5 text-amber-400" />}
          title="Manage Admins"
          desc="Create and manage admin accounts"
          href="/dashboard/users?role=ADMIN"
        />
        <QuickCard
          icon={<Users className="w-5 h-5 text-amber-400" />}
          title="All Users"
          desc="View and control all platform users"
          href="/dashboard/users"
        />
        <QuickCard
          icon={<Clock className="w-5 h-5 text-amber-400" />}
          title="Audit Logs"
          desc="Full platform activity history"
          href="/dashboard/audit"
        />
      </div>
      <HealthPanel />
    </div>
  );
}

function QuickCard({
  icon,
  title,
  desc,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="dash-card p-5 hover:border-black/20 transition-all group block"
    >
      <div className="w-9 h-9 rounded-xl bg-black/5 border border-black/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <div className="text-sm font-semibold text-[#0f172a] mb-1">{title}</div>
      <div className="text-xs text-black/45 leading-relaxed font-light">
        {desc}
      </div>
    </a>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getKycColor(status: string): string {
  const map: Record<string, string> = {
    not_started: "#475569",
    pending: "#f59e0b",
    verified: "#10b981",
    rejected: "#ef4444",
  };
  return map[status] ?? "#475569";
}
