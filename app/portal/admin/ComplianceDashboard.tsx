'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Coins, 
  Users, 
  CheckCircle,
  FileText,
  AlertOctagon,
  Scale, 
  Search,
  Filter,
  RefreshCw,
  Eye,
  Trash2,
  Lock,
  Unlock,
  AlertTriangle
} from 'lucide-react';
import { Property, UserAccount } from '../types';
import { EscrowAgreementDesc } from '../shared/AgreementsEscrow';

interface ComplianceDashboardProps {
  currentUser: UserAccount;
  users: UserAccount[];
  properties: Property[];
  onAuditLogAdded: (actionText: string) => void;
  onNotificationTriggered: (title: string, msg: string, cat: 'IDENTITY' | 'ESCROW' | 'BLOCKCHAIN' | 'SECURITY' | 'GENERAL') => void;
}

export default function ComplianceDashboard({
  currentUser,
  users,
  properties,
  onAuditLogAdded,
  onNotificationTriggered
}: ComplianceDashboardProps) {
  const [agreements, setAgreements] = useState<EscrowAgreementDesc[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('vex_escrow_agreements');
      if (stored) return JSON.parse(stored);
    }
    return [];
  });

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [metricFilter, setMetricFilter] = useState<'ALL' | 'ACTIVE' | 'DISPUTED' | 'PENDING_DEPOSIT'>('ALL');

  // Trigger reloading of agreements
  const reloadAgreements = () => {
    const stored = localStorage.getItem('vex_escrow_agreements');
    if (stored) setAgreements(JSON.parse(stored));
  };

  // Admin Dispute overrides resolution
  const handleResolveDispute = (id: string, resolution: 'REFUND_TENANT' | 'SETTLE_OWNER') => {
    const updated = agreements.map(ag => {
      if (ag.id === id) {
        const logs = [...ag.transactionLogs];
        const status = resolution === 'REFUND_TENANT' ? 'REFUNDED' as const : 'RELEASED' as const;
        const msgText = resolution === 'REFUND_TENANT' 
          ? `[Arbitration Overrule] Compliance administrator forced REFUND to Tenant (${ag.tenantName}).`
          : `[Arbitration Overrule] Compliance administrator forced SETTLEMENT payout to Owner (${ag.ownerName}).`;
        
        logs.push(msgText);
        logs.push(`[Closed Dispute] Escrow final state signed under multi-sig: ${status}.`);

        onAuditLogAdded(`Resolved dispute ${id} via unilateral override. Outcome: ${status}`);
        onNotificationTriggered(
          `Arbitration Resolved`, 
          `Dispute escrow ${id} has been resolved by Admin override.`, 
          `SECURITY`
        );

        return {
          ...ag,
          escrowStatus: status,
          agreementStatus: 'COMPLETED' as const,
          transactionLogs: logs,
          lastUpdated: new Date().toISOString()
        };
      }
      return ag;
    });

    localStorage.setItem('vex_escrow_agreements', JSON.stringify(updated));
    setAgreements(updated);
    alert(`Unilateral Dispute Arbitration Completed.\nOutcome logged & funds dispatched.`);
  };

  // Mock list of reported listings/suspicious entities
  const suspiciousUsersMock = [
    { id: 'sus-1092', name: 'James Moriarty', email: 'jim@crime.london', reason: 'High-frequency IP signature jumps (Zurich to Cayman Islands)', risk: 'CRITICAL' },
    { id: 'sus-2081', name: 'Charles Ponzi', email: 'ponzi@wealth.co', reason: 'Multiple unverified property drafts uploads with duplicated Swiss deed files', risk: 'HIGH' }
  ];

  const suspiciousPropertiesMock = [
    { id: 'susprop-99', name: 'Swiss Alp Luxury Hideout', owner: 'Lord Sterling', reason: 'COSE ledger flagged document hash recycling', risk: 'MEDIUM' }
  ];

  // Super admin action: Reset/Sovereign Override ban user
  const handleSovereignAction = (userId: string, actionDesc: string) => {
    alert(`[SUPER_ADMIN EXECUTIVE COMMAND]: Account ${userId} targeted with: [${actionDesc}]. Action applied and synchronized across TLS node keys.`);
    onAuditLogAdded(`Super-Admin action: ${actionDesc} applied on user ${userId}`);
  };

  return (
    <div className="space-y-6" id="compliance-dashboard-root">
      
      {/* 1. KEY KPI METRIC HIGHLIGHTS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-3xl border shadow-sm flex items-center justify-between gap-4 font-mono text-xs">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Pending KYC Files</span>
            <strong className="text-2xl font-black text-slate-900 font-sans block mt-1">
              {users.filter(u => u.kycStatus === 'PENDING' || u.kycStatus === 'UNDER_REVIEW').length}
            </strong>
            <p className="text-[10px] text-purple-600 mt-1 uppercase font-bold">Review Pipeline</p>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-3xl border shadow-sm flex items-center justify-between gap-4 font-mono text-xs">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Unverified Deeds</span>
            <strong className="text-2xl font-black text-slate-950 font-sans block mt-1">
              {properties.filter(p => p.status === 'SUBMITTED' || p.status === 'UNDER_REVIEW').length}
            </strong>
            <p className="text-[10px] text-blue-600 mt-1 uppercase font-bold">Deed Audits Queue</p>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-105">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-3xl border shadow-sm flex items-center justify-between gap-4 font-mono text-xs">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Active Disputes</span>
            <strong className="text-2xl font-black text-rose-600 font-sans block mt-1">
              {agreements.filter(a => a.escrowStatus === 'DISPUTED').length}
            </strong>
            <p className="text-[10px] text-rose-500 mt-1 uppercase font-bold animate-pulse">Freeze Audits</p>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 border border-rose-105">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-3xl border shadow-sm flex items-center justify-between gap-4 font-mono text-xs">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Total Custody Escrow</span>
            <strong className="text-xl font-bold font-sans text-slate-900 block mt-1.5 truncate">
              ${agreements.reduce((acc, current) => acc + (current.escrowStatus === 'FUNDED' ? current.securityDeposit : 0), 0).toLocaleString()} USD
            </strong>
            <p className="text-[10px] text-emerald-600 mt-1 font-bold">SECURED VALUE</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-105">
            <Coins className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 2. DISSENTING DISPUTES ARBITRATION BLOCK */}
      <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3.5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Scale className="w-5 h-5 text-rose-600" />
              <span>Sovereign Dispute Arbitration Queue</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Unilateral override controls to freeze, settle, or refund frozen escrow deposits</p>
          </div>
          <button 
            onClick={reloadAgreements}
            className="p-1 px-3.5 bg-slate-50 hover:bg-slate-100 border text-slate-500 rounded-xl transition-all cursor-pointer font-mono text-[9px] font-bold flex items-center gap-1.5"
          >
            <RefreshCw className="w-3 h-3" />
            <span>SYNC DISPUTES</span>
          </button>
        </div>

        {agreements.filter(a => a.escrowStatus === 'DISPUTED').length === 0 ? (
          <div className="text-center py-10 text-slate-400 font-mono text-xs border border-dashed rounded-2xl">
            ✓ Compliance channel clear. No active transaction files in disputed arbitration state.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agreements.filter(a => a.escrowStatus === 'DISPUTED').map(ag => (
              <div key={ag.id} className="border border-rose-200 bg-rose-50/20 p-5 rounded-2xl space-y-3 font-mono text-xs">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="font-bold text-rose-600 uppercase border border-rose-200 bg-rose-50 px-2 py-0.5 rounded text-[8px]">
                      DISPUTED
                    </span>
                    <strong className="text-slate-900 block mt-2 text-sm leading-tight">{ag.propertyName}</strong>
                    <span className="text-[10px] text-slate-400">Escrow ID: {ag.id}</span>
                  </div>
                  <strong className="text-slate-800 text-sm">${ag.securityDeposit.toLocaleString()}</strong>
                </div>

                <div className="bg-white/80 p-3 rounded-xl border space-y-1.5 text-[11px] leading-relaxed text-slate-705">
                  <div><strong>Claim:</strong> {ag.disputeSubject}</div>
                  <div><strong>Particulars:</strong> {ag.disputeNotes || 'No notes compiled'}</div>
                  <div><strong>Parties:</strong> {ag.tenantName} (Tenant) vs {ag.ownerName} (Lister)</div>
                </div>

                <div className="space-y-2 pt-1 font-mono">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block text-left">Overrule Verdict Consensus</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleResolveDispute(ag.id, 'REFUND_TENANT')}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-lg cursor-pointer transition text-[10px] uppercase text-center"
                    >
                      Refund Tenant
                    </button>
                    <button
                      onClick={() => handleResolveDispute(ag.id, 'SETTLE_OWNER')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg cursor-pointer transition text-[10px] uppercase text-center"
                    >
                      Award Lister
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. SUSPICIOUS ENTITIES REVIEW ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Suspicious Users Monitor */}
        <div className="bg-white p-5 rounded-3xl border shadow-sm space-y-4">
          <div className="border-b pb-3.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1 text-slate-800 font-bold">
              <ShieldAlert className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
              <span>Flagged User Accounts</span>
            </h4>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Automated firewall scans matching compliance anomalies</p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {suspiciousUsersMock.map((usr) => (
              <div key={usr.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-left">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <strong className="text-slate-900 font-sans">{usr.name}</strong>
                    <span className="text-slate-400 block text-[10px]">{usr.email}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                    usr.risk === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {usr.risk} RISK
                  </span>
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Reason: <strong>{usr.reason}</strong>
                </p>

                {currentUser.role === 'SUPER_ADMIN' ? (
                  <div className="flex gap-2 font-bold text-[9px] pt-1">
                    <button
                      onClick={() => handleSovereignAction(usr.id, 'RESTORE_KYC_OK')}
                      className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg cursor-pointer transition uppercase"
                    >
                      Clear Sanction
                    </button>
                    <button
                      onClick={() => handleSovereignAction(usr.id, 'BAN_UNILATERAL')}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer transition uppercase"
                    >
                      Ban Wallet Hash
                    </button>
                  </div>
                ) : (
                  <span className="text-[9px] text-slate-400 italic block text-right mt-1">Super-Admin access required for actions.</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Suspicious Listings Monitor */}
        <div className="bg-white p-5 rounded-3xl border shadow-sm space-y-4">
          <div className="border-b pb-3.5">
            <h4 className="text-xs font-bold text-slate-905 uppercase tracking-wide flex items-center gap-1 text-slate-800 font-bold">
              <AlertTriangle className="w-4.5 h-4.5 text-yellow-500 animate-spin" />
              <span>Flagged Property Listings</span>
            </h4>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Asset certificates requiring review reviews</p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {suspiciousPropertiesMock.map((prop) => (
              <div key={prop.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-left">
                <div className="flex justify-between items-center">
                  <div>
                    <strong className="text-slate-900 font-sans text-xs">{prop.name}</strong>
                    <span className="text-slate-400 block text-[10px]">Owner: {prop.owner}</span>
                  </div>
                  <span className="bg-yellow-50 text-yellow-700 border border-yellow-250 px-1.5 py-0.5 rounded text-[8px] font-bold">
                    {prop.risk} RISK
                  </span>
                </div>

                <p className="text-[10px] text-slate-500">
                  Reason: <strong>{prop.reason}</strong>
                </p>

                {currentUser.role === 'SUPER_ADMIN' ? (
                  <div className="flex gap-2 font-bold text-[9px] pt-1">
                    <button
                      onClick={() => handleSovereignAction(prop.id, 'UNPUBLISH_LISTING')}
                      className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg cursor-pointer transition uppercase"
                    >
                      Unpublish Draft
                    </button>
                    <button
                      onClick={() => handleSovereignAction(prop.id, 'APPROVE_FORCE')}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition uppercase"
                    >
                      Force Valid status
                    </button>
                  </div>
                ) : (
                  <span className="text-[9px] text-slate-400 italic block text-right mt-1">Super-Admin access required for actions.</span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. VERIFIABLE RECORD LIST */}
      <div className="bg-white p-5 rounded-3xl border shadow-sm space-y-4">
        <div className="border-b pb-3">
          <h4 className="text-sm font-bold text-slate-900 uppercase">Verifiable Custodial Ledger Ledger</h4>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Deep query and lookup registry across current transactions and certificates</p>
        </div>

        {/* Fast lookup form */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative font-mono text-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search by ID, tenant description, covenant hashes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs p-2.5 pl-10 border rounded-xl bg-slate-50 text-slate-800 outline-none focus:bg-white focus:border-blue-500"
            />
          </div>
        </div>

        {/* Results list */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full font-mono text-left text-xs text-slate-600 bg-white">
            <thead className="bg-slate-50 border-b text-[9px] font-bold text-slate-500 uppercase tracking-wider select-none font-mono">
              <tr>
                <th className="p-3">Reference ID</th>
                <th className="p-3 font-sans">Tenant / Buyer</th>
                <th className="p-3 font-sans">Property Context</th>
                <th className="p-3">Stated Amount</th>
                <th className="p-3">Escrow Status</th>
                <th className="p-3">Agreement State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {agreements.filter(a => {
                const searchLow = searchTerm.toLowerCase();
                return (
                  a.id.toLowerCase().includes(searchLow) ||
                  a.propertyName.toLowerCase().includes(searchLow) ||
                  a.tenantName.toLowerCase().includes(searchLow)
                );
              }).length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    No matching ledger registers located.
                  </td>
                </tr>
              ) : (
                agreements.filter(a => {
                  const searchLow = searchTerm.toLowerCase();
                  return (
                    a.id.toLowerCase().includes(searchLow) ||
                    a.propertyName.toLowerCase().includes(searchLow) ||
                    a.tenantName.toLowerCase().includes(searchLow)
                  );
                }).map(ag => (
                  <tr key={ag.id} className="hover:bg-slate-50/70">
                    <td className="p-3 font-bold text-slate-900">{ag.id}</td>
                    <td className="p-3 font-sans text-slate-700 font-semibold">{ag.tenantName}</td>
                    <td className="p-3 font-sans text-slate-500 text-[11px] font-bold">{ag.propertyName}</td>
                    <td className="p-3 font-bold text-emerald-600">${ag.securityDeposit.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getEscrowBadgeColor(ag.escrowStatus)}`}>
                        {ag.escrowStatus}
                      </span>
                    </td>
                    <td className="p-3 text-sky-600 font-semibold text-[11px]">{ag.agreementStatus}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// Internal duplicate helper for badge colors
const getEscrowBadgeColor = (status: string) => {
  switch(status) {
    case 'FUNDED': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'RELEASED': return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'REFUNDED': return 'bg-amber-50 text-amber-700 border border-amber-250';
    case 'DISPUTED': return 'bg-rose-50 text-rose-700 border border-rose-250';
    case 'PENDING_DEPOSIT': return 'bg-yellow-50 text-yellow-805 border border-yellow-250';
    default: return 'bg-slate-50 text-slate-600 border';
  }
};
