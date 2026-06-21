import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { getAuditLogs, type AuditLog } from '@/features/audit/services/audit.service';
import type { Listing } from '@/features/listings/types/listing.types';
import type { ComplianceCase, BrokerLicense } from '@/features/compliance/types/compliance.types';
import type { ChainTransaction } from '@/features/chain-transactions/types/chain-transaction.types';
import type { PurchaseTransaction } from '@/features/transactions/types/transaction.types';

type PageResult<T> = {
  items: T[];
  total: number;
};

type CountMap = Record<string, number>;

export interface AdminDashboardSummary {
  users: {
    total: number;
    admins: number;
    propertyOwners: number;
    tenants: number;
    active: number;
    suspended: number;
    pendingKyc: number;
    underReviewKyc: number;
  };
  listings: {
    total: number;
    draft: number;
    submitted: number;
    underReview: number;
    approved: number;
    published: number;
    rejected: number;
    suspended: number;
    recentReviewItems: Listing[];
    stats: Record<string, unknown> | null;
  };
  compliance: {
    openCases: number;
    underReviewCases: number;
    highRiskCases: number;
    criticalCases: number;
    pendingBrokerLicenses: number;
    recentCases: ComplianceCase[];
    recentBrokerLicenses: BrokerLicense[];
  };
  blockchain: {
    total: number;
    pending: number;
    failed: number;
    stale: number;
    reconciled: number;
    recent: ChainTransaction[];
  };
  purchases: {
    total: number;
    depositPending: number;
    closingReview: number;
    disputed: number;
    completed: number;
    recent: PurchaseTransaction[];
  };
  leases: {
    visible: number;
    active: number;
    disputed: number;
    escrowFunded: number;
  };
  auditLogs: AuditLog[];
  loadedAt: string;
}

function unwrap(payload: unknown): unknown {
  const body = payload as Record<string, unknown> | undefined;
  if (!body) return payload;
  if (body.data !== undefined) return body.data;
  return body;
}

function extractItems<T>(payload: unknown): T[] {
  const body = payload as Record<string, unknown> | undefined;
  const inner = unwrap(payload) as Record<string, unknown> | T[] | undefined;

  if (Array.isArray(inner)) return inner as T[];
  if (Array.isArray((inner as Record<string, unknown>)?.items)) return (inner as { items: T[] }).items;
  if (Array.isArray((inner as Record<string, unknown>)?.users)) return (inner as { users: T[] }).users;
  if (Array.isArray((inner as Record<string, unknown>)?.logs)) return (inner as { logs: T[] }).logs;
  if (Array.isArray(body?.items)) return body.items as T[];
  if (Array.isArray(body?.data)) return body.data as T[];

  return [];
}

function extractTotal(payload: unknown): number {
  const body = payload as Record<string, unknown> | undefined;
  const inner = unwrap(payload) as Record<string, unknown> | unknown[] | undefined;

  if (inner && !Array.isArray(inner)) {
    const total = Number(inner.total ?? (inner.meta as Record<string, unknown> | undefined)?.total);
    if (Number.isFinite(total)) return total;
  }

  const bodyTotal = Number(body?.total ?? (body?.meta as Record<string, unknown> | undefined)?.total);
  if (Number.isFinite(bodyTotal)) return bodyTotal;

  return extractItems(payload).length;
}

function pageFromPayload<T>(payload: unknown): PageResult<T> {
  return {
    items: extractItems<T>(payload),
    total: extractTotal(payload),
  };
}

async function safePage<T>(url: string, params?: Record<string, unknown>): Promise<PageResult<T>> {
  try {
    const { data } = await apiClient.get(url, { params: { page: 1, limit: 5, ...params } });
    return pageFromPayload<T>(data);
  } catch {
    return { items: [], total: 0 };
  }
}

async function safeCount(url: string, params?: Record<string, unknown>): Promise<number> {
  const result = await safePage<unknown>(url, { limit: 1, ...params });
  return result.total;
}

async function safeRecord(url: string): Promise<Record<string, unknown> | null> {
  try {
    const { data } = await apiClient.get(url);
    const value = unwrap(data);
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

async function countStatuses(url: string, statuses: string[], key = 'status'): Promise<CountMap> {
  const pairs = await Promise.all(
    statuses.map(async (status) => [status, await safeCount(url, { [key]: status })] as const),
  );
  return Object.fromEntries(pairs);
}

async function getVisibleLeaseCounts() {
  try {
    const { data } = await apiClient.get(ENDPOINTS.LEASES.MINE, { params: { page: 1, limit: 50 } });
    const leases = extractItems<Record<string, any>>(data);
    return {
      visible: extractTotal(data),
      active: leases.filter((lease) => lease.status === 'active').length,
      disputed: leases.filter((lease) => lease.status === 'disputed' || lease.dispute).length,
      escrowFunded: leases.filter((lease) => lease.escrow?.state === 'funded').length,
    };
  } catch {
    return { visible: 0, active: 0, disputed: 0, escrowFunded: 0 };
  }
}

function toApiRole(role: string): string {
  return role.toLowerCase();
}

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const [
    usersTotal,
    admins,
    propertyOwners,
    tenants,
    activeUsers,
    suspendedUsers,
    pendingKyc,
    underReviewKyc,
    listingStats,
    listingStatuses,
    reviewListings,
    complianceStatuses,
    highRiskCases,
    criticalCases,
    recentCases,
    pendingBrokerLicenses,
    recentBrokerLicenses,
    chainStatuses,
    recentChainTransactions,
    purchaseStatuses,
    recentPurchases,
    leases,
    auditLogs,
  ] = await Promise.all([
    safeCount(ENDPOINTS.ADMIN.USERS),
    safeCount(ENDPOINTS.ADMIN.USERS, { role: toApiRole('ADMIN') }),
    safeCount(ENDPOINTS.ADMIN.USERS, { role: toApiRole('PROPERTY_OWNER') }),
    safeCount(ENDPOINTS.ADMIN.USERS, { role: toApiRole('TENANT') }),
    safeCount(ENDPOINTS.ADMIN.USERS, { accountStatus: 'active' }),
    safeCount(ENDPOINTS.ADMIN.USERS, { accountStatus: 'suspended' }),
    safeCount(ENDPOINTS.ADMIN.USERS, { kycStatus: 'pending' }),
    safeCount(ENDPOINTS.ADMIN.USERS, { kycStatus: 'under_review' }),
    safeRecord(ENDPOINTS.ADMIN.LISTINGS_STATS),
    countStatuses(ENDPOINTS.ADMIN.LISTINGS, [
      'draft',
      'submitted',
      'under_review',
      'approved',
      'published',
      'rejected',
      'suspended',
    ]),
    safePage<Listing>(ENDPOINTS.ADMIN.LISTINGS, { status: 'submitted', limit: 5 }),
    countStatuses(ENDPOINTS.ADMIN.COMPLIANCE_CASES, ['open', 'under_review']),
    safeCount(ENDPOINTS.ADMIN.COMPLIANCE_CASES, { severity: 'high' }),
    safeCount(ENDPOINTS.ADMIN.COMPLIANCE_CASES, { severity: 'critical' }),
    safePage<ComplianceCase>(ENDPOINTS.ADMIN.COMPLIANCE_CASES, { status: 'open', limit: 5 }),
    safeCount(ENDPOINTS.ADMIN.BROKER_LICENSES, { status: 'pending' }),
    safePage<BrokerLicense>(ENDPOINTS.ADMIN.BROKER_LICENSES, { status: 'pending', limit: 5 }),
    countStatuses(ENDPOINTS.ADMIN.CHAIN_TXS, ['pending', 'failed', 'stale', 'reconciled']),
    safePage<ChainTransaction>(ENDPOINTS.ADMIN.CHAIN_TXS, { limit: 5 }),
    countStatuses(ENDPOINTS.PURCHASES.LIST, [
      'deposit_pending',
      'closing_review',
      'disputed',
      'completed',
    ]),
    safePage<PurchaseTransaction>(ENDPOINTS.PURCHASES.LIST, { limit: 5 }),
    getVisibleLeaseCounts(),
    getAuditLogs().then((logs) => logs.slice(0, 6)).catch(() => []),
  ]);

  const totalListingsFromStats = Number(
    listingStats?.total ?? listingStats?.totalListings ?? listingStats?.count,
  );

  return {
    users: {
      total: usersTotal,
      admins,
      propertyOwners,
      tenants,
      active: activeUsers,
      suspended: suspendedUsers,
      pendingKyc,
      underReviewKyc,
    },
    listings: {
      total: Number.isFinite(totalListingsFromStats)
        ? totalListingsFromStats
        : Object.values(listingStatuses).reduce((sum, value) => sum + value, 0),
      draft: listingStatuses.draft ?? 0,
      submitted: listingStatuses.submitted ?? 0,
      underReview: listingStatuses.under_review ?? 0,
      approved: listingStatuses.approved ?? 0,
      published: listingStatuses.published ?? 0,
      rejected: listingStatuses.rejected ?? 0,
      suspended: listingStatuses.suspended ?? 0,
      recentReviewItems: reviewListings.items,
      stats: listingStats,
    },
    compliance: {
      openCases: complianceStatuses.open ?? 0,
      underReviewCases: complianceStatuses.under_review ?? 0,
      highRiskCases,
      criticalCases,
      pendingBrokerLicenses,
      recentCases: recentCases.items,
      recentBrokerLicenses: recentBrokerLicenses.items,
    },
    blockchain: {
      total: recentChainTransactions.total,
      pending: chainStatuses.pending ?? 0,
      failed: chainStatuses.failed ?? 0,
      stale: chainStatuses.stale ?? 0,
      reconciled: chainStatuses.reconciled ?? 0,
      recent: recentChainTransactions.items,
    },
    purchases: {
      total: recentPurchases.total,
      depositPending: purchaseStatuses.deposit_pending ?? 0,
      closingReview: purchaseStatuses.closing_review ?? 0,
      disputed: purchaseStatuses.disputed ?? 0,
      completed: purchaseStatuses.completed ?? 0,
      recent: recentPurchases.items,
    },
    leases,
    auditLogs,
    loadedAt: new Date().toISOString(),
  };
}
