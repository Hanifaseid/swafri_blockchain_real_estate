"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Building2,
  ClipboardCheck,
  FileSearch,
  Gavel,
  LayoutDashboard,
  RefreshCw,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

import HealthPanel from "@/components/health/HealthPanel";
import { AdminCard, AdminPageLayout, AdminStatCard } from "@/components/admin/ui";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ROLE_LABELS } from "@/features/roles/types/role.types";
import { getAdminDashboardSummary } from "@/features/admin-dashboard/services/admin-dashboard.service";
import { useAuthStore } from "@/stores/auth.store";
import type { Listing } from "@/features/listings/types/listing.types";
import type { ComplianceCase, BrokerLicense } from "@/features/compliance/types/compliance.types";
import type { ChainTransaction } from "@/features/chain-transactions/types/chain-transaction.types";
import type { PurchaseTransaction } from "@/features/transactions/types/transaction.types";
import type { UserAccount } from "@/features/users/types/user.types";

const REVIEW_ROUTES = {
  users: "/admin/users",
  kyc: "/admin/kyc",
  listings: "/admin/properties",
  compliance: "/admin/compliance",
  purchases: "/admin/transactions",
  leases: "/admin/leases",
  chain: "/admin/chain-transactions",
  audit: "/admin/audit",
  settings: "/admin/settings",
};

export default function DashboardPage() {
  const { currentUser, isLoading } = useAuthStore();

  const summaryQuery = useQuery({
    queryKey: ["admin-dashboard", "summary"],
    queryFn: getAdminDashboardSummary,
    enabled: !!currentUser,
    refetchInterval: 60_000,
  });

  if (isLoading || !currentUser) {
    return <DashboardSpinner />;
  }

  const role = currentUser.role;
  const summary = summaryQuery.data;

  return (
    <AdminPageLayout
      icon={LayoutDashboard}
      label={`${ROLE_LABELS[role]} Dashboard`}
      title="Operations overview"
      badge={
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-700">
          Live backend data
        </span>
      }
      actions={
        <button
          type="button"
          onClick={() => summaryQuery.refetch()}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-60"
          disabled={summaryQuery.isFetching}
        >
          <RefreshCw size={14} className={summaryQuery.isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      }
    >
      <div className="space-y-6">
        <AdminIdentityStrip currentUser={currentUser} />

        {summaryQuery.isLoading && !summary ? (
          <DashboardSpinner compact />
        ) : summaryQuery.isError && !summary ? (
          <AdminCard>
            <div className="flex items-start gap-3 text-sm text-red-700">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Dashboard data could not be loaded.</p>
                <p className="mt-1 text-red-600">Use the refresh action after confirming the backend is reachable.</p>
              </div>
            </div>
          </AdminCard>
        ) : summary ? (
          <>
            <PrimaryStats summary={summary} isSuperAdmin={role === "SUPER_ADMIN"} />
            <OperationalQueues summary={summary} />
            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <ActivityFeed summary={summary} />
              <QuickOperations isSuperAdmin={role === "SUPER_ADMIN"} />
            </div>
            <HealthPanel />
          </>
        ) : null}
      </div>
    </AdminPageLayout>
  );
}

function AdminIdentityStrip({ currentUser }: { currentUser: UserAccount }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <AdminStatCard label="Role" value={ROLE_LABELS[currentUser.role]} variant="info" />
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-gray-400">Account</p>
        <StatusBadge status={currentUser.status} />
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-gray-400">KYC</p>
        <StatusBadge status={currentUser.kycStatus} />
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-gray-400">Wallet</p>
        <StatusBadge status={currentUser.walletStatus} />
      </div>
    </div>
  );
}

function PrimaryStats({
  summary,
  isSuperAdmin,
}: {
  summary: Awaited<ReturnType<typeof getAdminDashboardSummary>>;
  isSuperAdmin: boolean;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <AdminStatCard label="Users" value={formatNumber(summary.users.total)} variant="info" />
      <AdminStatCard label="Pending KYC" value={formatNumber(summary.users.pendingKyc + summary.users.underReviewKyc)} variant="warning" />
      <AdminStatCard label="Properties" value={formatNumber(summary.listings.total)} variant="success" />
      <AdminStatCard label="Open Compliance" value={formatNumber(summary.compliance.openCases + summary.compliance.underReviewCases)} variant="danger" />

      {isSuperAdmin && (
        <AdminStatCard label="Admins" value={formatNumber(summary.users.admins)} variant="warning" />
      )}
      <AdminStatCard label="Published Listings" value={formatNumber(summary.listings.published)} variant="success" />
      <AdminStatCard label="Purchase Transactions" value={formatNumber(summary.purchases.total)} variant="info" />
      <AdminStatCard label="Chain Issues" value={formatNumber(summary.blockchain.failed + summary.blockchain.stale)} variant="danger" />
    </div>
  );
}

function OperationalQueues({ summary }: { summary: Awaited<ReturnType<typeof getAdminDashboardSummary>> }) {
  const queues = [
    {
      title: "KYC review",
      count: summary.users.pendingKyc + summary.users.underReviewKyc,
      detail: `${summary.users.pendingKyc} pending, ${summary.users.underReviewKyc} under review`,
      href: REVIEW_ROUTES.kyc,
      icon: BadgeCheck,
      variant: "warning" as const,
    },
    {
      title: "Property review",
      count: summary.listings.submitted + summary.listings.underReview,
      detail: `${summary.listings.submitted} submitted, ${summary.listings.underReview} under review`,
      href: REVIEW_ROUTES.listings,
      icon: Building2,
      variant: "success" as const,
    },
    {
      title: "Compliance cases",
      count: summary.compliance.openCases + summary.compliance.underReviewCases,
      detail: `${summary.compliance.highRiskCases} high risk, ${summary.compliance.criticalCases} critical`,
      href: REVIEW_ROUTES.compliance,
      icon: ShieldCheck,
      variant: "danger" as const,
    },
    {
      title: "Purchase escrow",
      count: summary.purchases.depositPending + summary.purchases.closingReview + summary.purchases.disputed,
      detail: `${summary.purchases.depositPending} deposit pending, ${summary.purchases.disputed} disputed`,
      href: REVIEW_ROUTES.purchases,
      icon: Gavel,
      variant: "info" as const,
    },
    {
      title: "Chain transactions",
      count: summary.blockchain.pending + summary.blockchain.failed + summary.blockchain.stale,
      detail: `${summary.blockchain.pending} pending, ${summary.blockchain.failed} failed, ${summary.blockchain.stale} stale`,
      href: REVIEW_ROUTES.chain,
      icon: Wallet,
      variant: "danger" as const,
    },
    {
      title: "Broker licenses",
      count: summary.compliance.pendingBrokerLicenses,
      detail: "PROPERTY_OWNER license verification queue",
      href: REVIEW_ROUTES.compliance,
      icon: ClipboardCheck,
      variant: "warning" as const,
    },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {queues.map((queue) => (
        <Link
          key={queue.title}
          href={queue.href}
          className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 transition group-hover:border-emerald-200 group-hover:bg-emerald-50">
              <queue.icon size={18} className="text-emerald-700" />
            </div>
            <span className={queueBadgeClass(queue.variant)}>{formatNumber(queue.count)}</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">{queue.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">{queue.detail}</p>
        </Link>
      ))}
    </div>
  );
}

function ActivityFeed({ summary }: { summary: Awaited<ReturnType<typeof getAdminDashboardSummary>> }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AdminCard title="Property Review Queue" description="Submitted listings waiting for admin action">
        <ListingQueue items={summary.listings.recentReviewItems} />
      </AdminCard>

      <AdminCard title="Compliance Queue" description="Open cases and broker licenses requiring review">
        <ComplianceQueue cases={summary.compliance.recentCases} licenses={summary.compliance.recentBrokerLicenses} />
      </AdminCard>

      <AdminCard title="Purchase Escrow" description="Recent purchase transactions and closing status">
        <PurchaseQueue items={summary.purchases.recent} />
      </AdminCard>

      <AdminCard title="Chain Transactions" description="Recent blockchain operations and reconciliation state">
        <ChainQueue items={summary.blockchain.recent} />
      </AdminCard>

      <AdminCard title="Lease Operations" description="Lease visibility available to the current admin account">
        <div className="grid grid-cols-2 gap-3">
          <MiniMetric label="Visible" value={summary.leases.visible} />
          <MiniMetric label="Active" value={summary.leases.active} />
          <MiniMetric label="Disputed" value={summary.leases.disputed} />
          <MiniMetric label="Escrow funded" value={summary.leases.escrowFunded} />
        </div>
      </AdminCard>

      <AdminCard title="Audit Activity" description="Most recent auditable backend actions">
        <AuditQueue items={summary.auditLogs} />
      </AdminCard>
    </div>
  );
}

function QuickOperations({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const links = [
    { label: "Users", description: "Review accounts, KYC, wallet state, and suspensions.", href: REVIEW_ROUTES.users, icon: Users },
    { label: "Properties", description: "Review submitted listings, documents, and title actions.", href: REVIEW_ROUTES.listings, icon: Building2 },
    { label: "Compliance", description: "Manage cases, risk review, and broker licenses.", href: REVIEW_ROUTES.compliance, icon: ShieldCheck },
    { label: "Transactions", description: "Track purchase escrow and closing workflows.", href: REVIEW_ROUTES.purchases, icon: Gavel },
    { label: "Leases", description: "Inspect lease and tenant-management workflows.", href: REVIEW_ROUTES.leases, icon: ClipboardCheck },
    { label: "Chain Ledger", description: "Reconcile pending, stale, and failed chain transactions.", href: REVIEW_ROUTES.chain, icon: Wallet },
    { label: "Audit Logs", description: "Inspect immutable operational activity records.", href: REVIEW_ROUTES.audit, icon: Activity },
    { label: "Settings", description: "Review operational configuration surfaces.", href: REVIEW_ROUTES.settings, icon: FileSearch },
  ];

  return (
    <AdminCard title="Admin Workbench" description={isSuperAdmin ? "Super admin and admin operation links" : "Admin operation links"}>
      <div className="space-y-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-start gap-3 rounded-lg border border-gray-100 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/50"
          >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-emerald-700">
              <link.icon size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{link.label}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{link.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </AdminCard>
  );
}

function ListingQueue({ items }: { items: Listing[] }) {
  if (!items.length) return <EmptyQueue text="No submitted listings are waiting right now." />;
  return (
    <div className="space-y-3">
      {items.map((listing) => (
        <Link key={listing.id} href={`${REVIEW_ROUTES.listings}?q=${encodeURIComponent(listing.title)}`} className="block rounded-lg border border-gray-100 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/50">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{listing.title}</p>
              <p className="mt-1 text-xs text-gray-500">{listing.address?.city ?? "Unknown city"} - {listing.listingType}</p>
            </div>
            <StatusBadge status={listing.status} />
          </div>
        </Link>
      ))}
    </div>
  );
}

function ComplianceQueue({ cases, licenses }: { cases: ComplianceCase[]; licenses: BrokerLicense[] }) {
  const hasItems = cases.length > 0 || licenses.length > 0;
  if (!hasItems) return <EmptyQueue text="No open compliance or broker license items are waiting right now." />;

  return (
    <div className="space-y-3">
      {cases.map((item) => (
        <Link key={item.id} href={REVIEW_ROUTES.compliance} className="block rounded-lg border border-gray-100 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/50">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold capitalize text-gray-900">{item.type.replace(/_/g, " ")}</p>
              <p className="mt-1 text-xs text-gray-500">Severity: {item.severity}</p>
            </div>
            <StatusBadge status={item.status} />
          </div>
        </Link>
      ))}
      {licenses.map((license) => (
        <Link key={license.id} href={REVIEW_ROUTES.compliance} className="block rounded-lg border border-gray-100 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/50">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">{license.holderName || "Broker license"}</p>
              <p className="mt-1 text-xs text-gray-500">{license.jurisdiction || "Jurisdiction not set"}</p>
            </div>
            <StatusBadge status={license.status} />
          </div>
        </Link>
      ))}
    </div>
  );
}

function PurchaseQueue({ items }: { items: PurchaseTransaction[] }) {
  if (!items.length) return <EmptyQueue text="No purchase transactions are visible right now." />;
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Link key={recordId(item)} href={REVIEW_ROUTES.purchases} className="block rounded-lg border border-gray-100 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/50">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{item.listingTitle || "Purchase transaction"}</p>
              <p className="mt-1 text-xs text-gray-500">Escrow: {item.escrow?.state ?? "none"}</p>
            </div>
            <StatusBadge status={item.status} />
          </div>
        </Link>
      ))}
    </div>
  );
}

function ChainQueue({ items }: { items: ChainTransaction[] }) {
  if (!items.length) return <EmptyQueue text="No chain transactions are visible right now." />;
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Link key={recordId(item)} href={REVIEW_ROUTES.chain} className="block rounded-lg border border-gray-100 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/50">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{item.operation || item.hash || "Chain operation"}</p>
              <p className="mt-1 text-xs text-gray-500">{item.targetType || item.chain || "Blockchain"}</p>
            </div>
            <StatusBadge status={item.status} />
          </div>
        </Link>
      ))}
    </div>
  );
}

function AuditQueue({ items }: { items: Array<{ id: string; action: string; timestamp: string; user: string }> }) {
  if (!items.length) return <EmptyQueue text="No audit activity is visible right now." />;
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Link key={item.id} href={REVIEW_ROUTES.audit} className="block rounded-lg border border-gray-100 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/50">
          <p className="text-sm font-semibold text-gray-900">{item.action.replace(/_/g, " ")}</p>
          <p className="mt-1 text-xs text-gray-500">{item.user} - {formatDate(item.timestamp)}</p>
        </Link>
      ))}
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
      <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-gray-900">{formatNumber(value)}</p>
    </div>
  );
}

function EmptyQueue({ text }: { text: string }) {
  return <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">{text}</p>;
}

function DashboardSpinner({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-center justify-center ${compact ? "min-h-40" : "min-h-screen"}`}>
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
    </div>
  );
}

function queueBadgeClass(variant: "success" | "warning" | "danger" | "info") {
  const base = "rounded-full px-2.5 py-1 text-xs font-semibold";
  const variants = {
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-700",
    info: "bg-sky-50 text-sky-700",
  };
  return `${base} ${variants[variant]}`;
}

function formatNumber(value: number | string) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return String(value);
  return new Intl.NumberFormat("en-US").format(numberValue);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function recordId(record: { id?: string; _id?: unknown }) {
  return String(record.id ?? record._id ?? Math.random());
}
