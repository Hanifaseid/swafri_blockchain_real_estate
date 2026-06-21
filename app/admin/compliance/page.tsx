'use client';

import { useState } from 'react';
import { ShieldCheck, FileText, Building2, Lock } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useComplianceCases, useUpdateComplianceCase, useBrokerLicenses } from '@/features/compliance/queries/compliance.queries';
import { ComplianceCaseCard } from '@/features/compliance/components/ComplianceCaseCard';
import { BrokerLicenseCard } from '@/features/compliance/components/BrokerLicenseCard';
import type { ComplianceCaseStatus, ComplianceSeverity, BrokerLicenseStatus } from '@/features/compliance/types/compliance.types';
import {
  AdminPageLayout,
  AdminTabs,
  AdminFilterBar,
  AdminLoadingState,
  AdminEmptyState,
  AdminInlineAlert,
} from '@/components/admin/ui';

export default function CompliancePage() {
  const { currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'cases' | 'licenses'>('cases');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const { data: casesData, isLoading: casesLoading } = useComplianceCases({
    status: statusFilter as ComplianceCaseStatus || undefined,
    severity: severityFilter as ComplianceSeverity || undefined,
  });
  const updateCase = useUpdateComplianceCase();

  const { data: licenses, isLoading: licensesLoading } = useBrokerLicenses({
    status: statusFilter as BrokerLicenseStatus || undefined,
  });

  const handleUpdateCase = isSuperAdmin
    ? (id: string, input: any) => updateCase.mutate({ id, input })
    : undefined;

  const handleReviewLicense = (id: string, decision: 'approve' | 'reject' | 'expire', note?: string) => {
    console.log('Review license:', id, decision, note);
  };

  const tabs = [
    { id: 'cases', label: 'Cases', icon: <FileText size={14} /> },
    { id: 'licenses', label: 'Broker Licenses', icon: <Building2 size={14} /> },
  ];

  const caseStatusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'dismissed', label: 'Dismissed' },
  ];

  const licenseStatusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'expired', label: 'Expired' },
  ];

  const severityOptions = [
    { value: '', label: 'All Severities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  return (
    <AdminPageLayout icon={ShieldCheck} label="Admin" title="Compliance">
      {!isSuperAdmin && (
        <AdminInlineAlert
          variant="warning"
          icon={Lock}
          message="View only — override actions require Super Admin."
          className="mb-5"
        />
      )}

      <AdminTabs
        tabs={tabs}
        active={activeTab}
        onChange={(id) => { setActiveTab(id as 'cases' | 'licenses'); setStatusFilter(''); setSeverityFilter(''); }}
        className="mb-5"
      />

      <AdminFilterBar
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: activeTab === 'cases' ? caseStatusOptions : licenseStatusOptions,
          },
          ...(activeTab === 'cases' ? [{
            key: 'severity',
            label: 'Severity',
            value: severityFilter,
            onChange: setSeverityFilter,
            options: severityOptions,
          }] : []),
        ]}
        onClear={() => { setStatusFilter(''); setSeverityFilter(''); }}
        className="mb-5"
      />

      {activeTab === 'cases' ? (
        casesLoading ? <AdminLoadingState /> :
        !casesData?.items?.length ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <AdminEmptyState icon={FileText} title="No compliance cases found" />
          </div>
        ) : (
          <div className="grid gap-4">
            {casesData.items.map((case_) => (
              <ComplianceCaseCard
                key={case_.id}
                case_={case_}
                onUpdate={handleUpdateCase}
                isUpdating={updateCase.isPending}
              />
            ))}
          </div>
        )
      ) : (
        licensesLoading ? <AdminLoadingState /> :
        !licenses?.length ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <AdminEmptyState icon={Building2} title="No broker licenses found" />
          </div>
        ) : (
          <div className="grid gap-4">
            {licenses.map((license) => (
              <BrokerLicenseCard
                key={license.id}
                license={license}
                onReview={handleReviewLicense}
                isReviewing={false}
              />
            ))}
          </div>
        )
      )}
    </AdminPageLayout>
  );
}
