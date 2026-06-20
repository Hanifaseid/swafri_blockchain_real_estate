'use client';

import { useState } from 'react';
import { ShieldCheck, FileText, Building2 } from 'lucide-react';
import { useComplianceCases, useUpdateComplianceCase } from '@/features/compliance/queries/compliance.queries';
import { useBrokerLicenses } from '@/features/compliance/queries/compliance.queries';
import { ComplianceCaseCard } from '@/features/compliance/components/ComplianceCaseCard';
import { BrokerLicenseCard } from '@/features/compliance/components/BrokerLicenseCard';
import type { ComplianceCaseStatus, ComplianceSeverity, BrokerLicenseStatus } from '@/features/compliance/types/compliance.types';

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState<'cases' | 'licenses'>('cases');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');

  const { data: casesData, isLoading: casesLoading } = useComplianceCases({
    status: statusFilter as ComplianceCaseStatus || undefined,
    severity: severityFilter as ComplianceSeverity || undefined,
  });
  const updateCase = useUpdateComplianceCase();

  const { data: licenses, isLoading: licensesLoading } = useBrokerLicenses({
    status: statusFilter as BrokerLicenseStatus || undefined,
  });

  const handleUpdateCase = (id: string, input: any) => {
    updateCase.mutate({ id, input });
  };

  const handleReviewLicense = (id: string, decision: 'approve' | 'reject' | 'expire', note?: string) => {
    // This would use useReviewBrokerLicense hook
    console.log('Review license:', id, decision, note);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">Admin</p>
          <h1 className="text-2xl font-light text-[#0f172a] tracking-tight">Compliance</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-black/5 p-1 rounded-xl w-fit border border-black/10">
        <button
          onClick={() => setActiveTab('cases')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'cases' ? 'bg-white text-black shadow-sm' : 'text-black/70 hover:text-black hover:bg-black/5'
          }`}
        >
          <FileText size={16} className="inline mr-2" />
          Cases
        </button>
        <button
          onClick={() => setActiveTab('licenses')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'licenses' ? 'bg-white text-black shadow-sm' : 'text-black/70 hover:text-black hover:bg-black/5'
          }`}
        >
          <Building2 size={16} className="inline mr-2" />
          Broker Licenses
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-black/10 rounded-lg text-sm bg-white text-black/70 focus:outline-none focus:border-emerald-400"
        >
          <option value="">All Statuses</option>
          {activeTab === 'cases' ? (
            <>
              <option value="open">Open</option>
              <option value="under_review">Under Review</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </>
          ) : (
            <>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </>
          )}
        </select>
        {activeTab === 'cases' && (
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 border border-black/10 rounded-lg text-sm bg-white text-black/70 focus:outline-none focus:border-emerald-400"
          >
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        )}
      </div>

      {/* Content */}
      {activeTab === 'cases' ? (
        casesLoading ? (
          <div className="text-center py-12 text-black/40">Loading cases...</div>
        ) : casesData?.items.length === 0 ? (
          <div className="text-center py-12 text-black/40">No compliance cases found.</div>
        ) : (
          <div className="grid gap-4">
            {casesData?.items.map((case_) => (
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
        licensesLoading ? (
          <div className="text-center py-12 text-black/40">Loading licenses...</div>
        ) : licenses?.length === 0 ? (
          <div className="text-center py-12 text-black/40">No broker licenses found.</div>
        ) : (
          <div className="grid gap-4">
            {licenses?.map((license) => (
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
    </div>
  );
}
