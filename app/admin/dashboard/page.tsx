"use client";

import { useAuthStore } from "@/stores/auth.store";
import { ROLE_LABELS } from "@/features/roles/types/role.types";
import { Users, Building2, BadgeCheck, Wallet, Activity, ShieldCheck, Clock, LayoutDashboard } from "lucide-react";
import HealthPanel from "@/components/health/HealthPanel";
import { AdminPageLayout, AdminStatCard, AdminEmptyState } from "@/components/admin/ui";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import Link from "next/link";

export default function DashboardPage() {
  const { currentUser, isLoading } = useAuthStore();

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const role = currentUser.role;

  return (
    <AdminPageLayout
      icon={LayoutDashboard}
      label={`${ROLE_LABELS[role]} Dashboard`}
      title={`Welcome back, ${currentUser.name.split(" ")[0]}`}
    >
      {/* Status summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-2">Role</p>
          <p className="text-sm font-semibold text-gray-900">{ROLE_LABELS[role]}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-2">Account</p>
          <StatusBadge status={currentUser.status} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-2">KYC</p>
          <StatusBadge status={currentUser.kycStatus} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-2">Wallet</p>
          <StatusBadge status={currentUser.walletStatus} />
        </div>
      </div>

      {/* Role-specific quick actions */}
      {role === "ADMIN" && <AdminOverview />}
      {role === "SUPER_ADMIN" && <SuperAdminOverview />}
    </AdminPageLayout>
  );
}

function AdminOverview() {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <QuickCard icon={<Users className="w-5 h-5 text-emerald-600" />} title="Manage Users" desc="Review, suspend or reactivate user accounts" href="/admin/users" />
        <QuickCard icon={<BadgeCheck className="w-5 h-5 text-emerald-600" />} title="KYC Review" desc="Review pending KYC submissions" href="/admin/kyc" />
        <QuickCard icon={<Activity className="w-5 h-5 text-emerald-600" />} title="Audit Logs" desc="Monitor platform activity and actions" href="/admin/audit" />
      </div>
      <HealthPanel />
    </div>
  );
}

function SuperAdminOverview() {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <QuickCard icon={<ShieldCheck className="w-5 h-5 text-amber-600" />} title="Manage Admins" desc="Create and manage admin accounts" href="/admin/users?role=ADMIN" />
        <QuickCard icon={<Users className="w-5 h-5 text-amber-600" />} title="All Users" desc="View and control all platform users" href="/admin/users" />
        <QuickCard icon={<Clock className="w-5 h-5 text-amber-600" />} title="Audit Logs" desc="Full platform activity history" href="/admin/audit" />
      </div>
      <HealthPanel />
    </div>
  );
}

function QuickCard({ icon, title, desc, href }: { icon: React.ReactNode; title: string; desc: string; href: string }) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:border-emerald-300 hover:shadow-md transition-all group block"
    >
      <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center mb-4 group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-colors">
        {icon}
      </div>
      <p className="text-sm font-semibold text-gray-900 mb-1">{title}</p>
      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
    </Link>
  );
}
