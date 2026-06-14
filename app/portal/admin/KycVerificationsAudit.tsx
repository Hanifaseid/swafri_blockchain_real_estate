'use client';

import React, { useState } from 'react';
import { UserAccount } from '../types';
import {
  CheckCircle,
  XCircle,
  X,
  UserCheck,
  FileText,
  ShieldAlert,
  Filter,
  Eye,
  UserX,
  AlertTriangle,
  Scale
} from 'lucide-react';

interface KycVerificationsAuditProps {
  currentUser: UserAccount;
  users: UserAccount[];
  approveUserKycState: (id: string) => void;
  onAuditLogAdded: (actionText: string) => void;
  onNotificationTriggered: (title: string, msg: string, cat: 'IDENTITY' | 'ESCROW' | 'BLOCKCHAIN' | 'SECURITY' | 'GENERAL') => void;
  onUpdateUsers?: (updated: UserAccount[]) => void;
}

export default function KycVerificationsAudit({
  currentUser,
  users,
  approveUserKycState,
  onAuditLogAdded,
  onNotificationTriggered,
  onUpdateUsers
}: KycVerificationsAuditProps) {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<UserAccount | null>(null);
  
  // Custom Rejection modals state
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectionTargetId, setRejectionTargetId] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const filteredUsers = users.filter((u) => {
    if (filter === 'ALL') return true;
    return u.kycStatus === filter;
  });

  const handleApprove = (userId: string) => {
    approveUserKycState(userId);
    onNotificationTriggered(
      `Compliance Cleared`,
      `Your transactor identity passport clearing has been approved.`,
      `IDENTITY`
    );
    if (selectedUserForDetail?.id === userId) {
      setSelectedUserForDetail(prev => prev ? { ...prev, kycStatus: 'APPROVED' } : null);
    }
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;

    if (onUpdateUsers) {
      const updated = users.map(u => {
        if (u.id === rejectionTargetId) {
          return { ...u, kycStatus: 'REJECTED' as const };
        }
        return u;
      });
      onUpdateUsers(updated);
      localStorage.setItem('vex_users_accounts', JSON.stringify(updated));
    }

    onAuditLogAdded(`Rejected identity dossier for ID: ${rejectionTargetId}. Cause: ${rejectionReason}`);
    onNotificationTriggered(
      `Identity Rejected`,
      `Sovereign registry flagged document discrepancies. Reason: ${rejectionReason}`,
      `IDENTITY`
    );

    if (selectedUserForDetail?.id === rejectionTargetId) {
      setSelectedUserForDetail(prev => prev ? { ...prev, kycStatus: 'REJECTED' } : null);
    }

    setShowRejectModal(false);
    setRejectionReason('');
    alert('Compliance rejection finalized and logged to system blocks.');
  };

  // Super Admin bypass Force Override
  const handleSuperAdminForceAction = (userId: string, targetStatus: 'APPROVED' | 'NOT_STARTED') => {
    if (onUpdateUsers) {
      const updated = users.map(u => {
        if (u.id === userId) {
          return { ...u, kycStatus: targetStatus };
        }
        return u;
      });
      onUpdateUsers(updated);
      localStorage.setItem('vex_users_accounts', JSON.stringify(updated));
    }

    onAuditLogAdded(`[SUPER_ADMIN] Force override KYC to ${targetStatus} for user: ${userId}`);
    onNotificationTriggered(
      `Executive Overrule applied`,
      `Super-Admin applied direct state modification on identity dossier.`,
      `IDENTITY`
    );
    alert(`[SUPER_ADMIN EXECUTIVE OVERRIDE COMPLETE]\nIdentity status force mutated to: ${targetStatus}`);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'TENANT': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'PROPERTY_OWNER': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'ADMIN': return 'bg-orange-50 text-orange-700 border-orange-150';
      default: return 'bg-slate-50 text-slate-700 border';
    }
  };

  return (
    <div className="space-y-6 text-left" id="kyc-verifications-audit-workspace">
      
      {/* Search filters toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-purple-600" />
            <span>Sovereign KYC & Identity Review Matrix</span>
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Audit, approve, or issue compliance rejections on current transactor passport dossier</p>
        </div>

        <div className="flex bg-slate-55 p-1 rounded-2xl border bg-slate-50 text-[10px] font-mono font-bold">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((sts) => (
            <button
              key={sts}
              onClick={() => setFilter(sts)}
              className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                filter === sts 
                  ? 'bg-slate-900 text-white shadow-sm font-extrabold' 
                  : 'text-slate-500 hover:bg-slate-200'
              }`}
            >
              {sts} {users.filter(u => u.kycStatus === sts).length > 0 && (
                <span className="ml-1 w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-ping" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Inductee Listings */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border shadow-sm space-y-4">
          <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase border-b pb-1 select-none">
            INJECTED IDENTITIES REGISTRY
          </span>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-slate-450 text-slate-400 font-mono text-xs">
                No active entries located matching filters: {filter}
              </div>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = selectedUserForDetail?.id === user.id;
                return (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUserForDetail(user)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left space-y-2.5 ${
                      isSelected 
                        ? 'border-purple-500 bg-purple-50/10 shadow-sm' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 flex-wrap">
                      <div>
                        <span className="text-[8px] font-mono text-slate-450 block uppercase tracking-wide font-semibold text-slate-400">ID: {user.id}</span>
                        <h4 className="text-xs font-bold text-slate-900">{user.name}</h4>
                      </div>
                      <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono border-t pt-2.5 border-slate-100">
                      <span className="text-slate-400">{user.email}</span>
                      <strong className={`uppercase ${
                        user.kycStatus === 'APPROVED' ? 'text-emerald-600' : user.kycStatus === 'PENDING' ? 'text-amber-500' : 'text-rose-500'
                      }`}>
                        {user.kycStatus}
                      </strong>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Passport Previews & Action Panels */}
        <div className="lg:col-span-7">
          {selectedUserForDetail ? (
            <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6 text-left">
              
              {/* Profile Overview */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono bg-slate-100 p-0.5 px-2 rounded border font-semibold">REF: {selectedUserForDetail.id}</span>
                    <span className="text-[9px] font-mono text-slate-400">Date Log Decoded: 2026-06-14 06:22 UTC</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-950 uppercase tracking-tight mt-1">{selectedUserForDetail.name} Dossier</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedUserForDetail.email}</p>
                </div>

                <span className={`px-3 py-1 bg-slate-50 border rounded-xl text-xs font-mono font-bold uppercase tracking-wider ${
                  selectedUserForDetail.kycStatus === 'APPROVED' ? 'text-emerald-700 border-emerald-200 bg-emerald-50' : selectedUserForDetail.kycStatus === 'PENDING' ? 'text-amber-700 border-amber-250 bg-amber-50 animate-pulse' : 'text-rose-700 border-rose-200 bg-rose-50'
                }`}>
                  {selectedUserForDetail.kycStatus}
                </span>
              </div>

              {/* Layout matrix splits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Specific details */}
                <div className="space-y-4">
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold border-b pb-1 select-none">
                    DECODED DOSSIER DETAILS
                  </span>
                  
                  <div className="bg-slate-50 p-4 border rounded-2xl font-mono text-[11px] text-slate-650 space-y-2.5">
                    <div>User Name: <strong className="text-slate-900 font-sans">{selectedUserForDetail.name}</strong></div>
                    <div>Email Key: <strong className="text-slate-900 font-sans">{selectedUserForDetail.email}</strong></div>
                    <div>Phone link: <strong className="text-slate-900">{selectedUserForDetail.phone || '+41 44 200 48 91'}</strong></div>
                    <div>Class Role: <strong className="text-indigo-650 bg-indigo-50 border border-indigo-100 px-1 rounded">{selectedUserForDetail.role}</strong></div>
                    <div>Address Residence: <strong className="text-slate-800 font-sans block mt-1">Bahnhofstrasse 12, Zurich 8001</strong></div>
                  </div>

                  {selectedUserForDetail.walletStatus === 'VERIFIED' && selectedUserForDetail.linkedWalletAddress && (
                    <div className="bg-emerald-50 border border-emerald-150 p-3.5 rounded-xl font-mono text-[9px] text-slate-500 truncate">
                      <strong className="text-emerald-700 font-bold block uppercase text-[8px] tracking-wider mb-1">ANCHORED SECURE LEDGER KEY</strong>
                      Address: <span className="text-slate-900 font-bold font-mono text-[9px]">{selectedUserForDetail.linkedWalletAddress}</span>
                    </div>
                  )}
                </div>

                {/* Simulated Passport Previews */}
                <div className="space-y-4">
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold border-b pb-1 select-none">
                    PASSPORT IMAGE PREVIEW
                  </span>

                  {/* Visual ID Box */}
                  <div className="relative h-44 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-radial from-transparent to-slate-950/70" />
                    
                    {/* SVG Drawn Mock License Card */}
                    <div className="bg-slate-900 border border-slate-700/85 text-slate-200 text-[8px] font-mono max-w-xs w-full p-3 rounded-lg relative space-y-2 tracking-tight select-none shadow-2xl">
                      <div className="flex justify-between items-center border-b border-slate-805 border-slate-800 pb-1.5">
                        <span className="font-bold text-slate-400 text-[6px]">CONFOEDERATIO HELVETICA (SWISS PASSPORT)</span>
                        <span className="text-[5px] text-rose-500 font-black">CH</span>
                      </div>
                      <div className="flex gap-2">
                        {/* Mock user portrait */}
                        <div className="w-10 h-12 bg-slate-800 rounded border border-slate-700 shrink-0 flex items-center justify-center">
                          <Eye className="w-5 h-5 text-slate-650 text-slate-500" />
                        </div>
                        <div className="space-y-0.5 truncate">
                          <div>Surname: <strong className="text-white font-sans">{selectedUserForDetail.name.split(' ').pop()}</strong></div>
                          <div>Given Names: <strong className="text-white font-sans">{selectedUserForDetail.name.split(' ')[0]}</strong></div>
                          <div>Nationality: <strong className="text-white">SWITZERLAND</strong></div>
                          <div>Document Code: <strong className="text-amber-500">P-9812A88B</strong></div>
                        </div>
                      </div>
                    </div>

                    <div className="absolute top-2 left-2 bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[7px]">
                      DEED-PASS SHA-256 OK
                    </div>
                  </div>
                </div>

              </div>

              {/* Standard Review Actions row */}
              <div className="border-t pt-5 space-y-4">
                
                {selectedUserForDetail.kycStatus === 'PENDING' && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRejectionTargetId(selectedUserForDetail.id);
                        setShowRejectModal(true);
                      }}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-mono py-3 rounded-xl uppercase text-[10px] font-bold cursor-pointer transition flex items-center justify-center gap-1.5"
                    >
                      <UserX className="w-4 h-4" />
                      <span>REJECT DOSSIER</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedUserForDetail.id)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-mono py-3 rounded-xl uppercase text-[10px] font-black cursor-pointer transition shadow-md flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>APPROVE COMPLIANCE CLEARING</span>
                    </button>
                  </div>
                )}

                {/* 5. SUPER_ADMIN FORCE STATUS OVERRIDES BLOCK */}
                {(currentUser.role === 'SUPER_ADMIN') && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-3 font-mono text-[11px] text-purple-800">
                    <div className="flex items-center gap-1.5 font-bold text-xs uppercase">
                      <ShieldAlert className="w-4.5 h-4.5 text-purple-700 animate-bounce" />
                      <span>SUPER_ADMIN EXECUTIVE CONTROL SYSTEM BYPASS</span>
                    </div>
                    
                    <p className="text-[10px] leading-relaxed text-purple-900 font-sans font-medium">
                      Select below state modifiers to forcefully alter the transactor's compliance status outside normal queue validation flow audits.
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                      <button
                        type="button"
                        onClick={() => handleSuperAdminForceAction(selectedUserForDetail.id, 'NOT_STARTED')}
                        className="bg-purple-200 hover:bg-purple-250 text-purple-950 font-bold py-2 rounded-lg cursor-pointer transition text-[9px] uppercase tracking-wide border border-purple-305"
                      >
                        Force Reset (NOT_STARTED)
                      </button>
                      
                      {selectedUserForDetail.kycStatus !== 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => handleSuperAdminForceAction(selectedUserForDetail.id, 'APPROVED')}
                          className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 rounded-lg cursor-pointer transition text-[9px] uppercase tracking-wide shadow-sm"
                        >
                          Direct Force Approve
                        </button>
                      )}
                    </div>
                  </div>
                )}

              </div>

            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border shadow-sm text-center text-slate-400 space-y-3">
              <UserCheck className="w-12 h-12 text-slate-300 mx-auto" strokeWidth={1} />
              <h4 className="text-xs font-bold text-slate-600 uppercase font-mono">No Dossier Target Selected</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-sans leading-relaxed">
                Choose one active transactor pending list item folder on the left panel to display passport bio checks, scan signatures, issue approvals, or execute Super-admin overrides.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* REJECTION REASON DIALOG POP-UP */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-mono text-xs">
          <div className="bg-white rounded-3xl border shadow-2xl p-6 max-w-sm w-full space-y-5 text-left relative">
            
            <button 
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-full bg-slate-50 p-1 border cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b pb-3.5 text-red-705 text-red-700 font-bold text-xs uppercase flex items-center gap-1.5">
              <AlertTriangle className="w-5 h-5" />
              <span>Issue Compliance Rejection</span>
            </div>

            <form onSubmit={handleReject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase font-bold block">Reason / Cause Code Selection</label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-red-500 font-semibold cursor-pointer text-[11px]"
                >
                  <option value="">-- Choose Rejection Code --</option>
                  <option value="Unreadable ID Document Scan">Passport image scan unreadable or blurs detected</option>
                  <option value="Selfie Match Disbursed Failures">Portrait biometric match face mismatch (fail)</option>
                  <option value="Invalid Switzerland Serial Code ID">Government Passport serial mismatch or expired</option>
                  <option value="Entity Unregistered Registry">Alpine Company registry CHE CHE number unverified</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-red-650 bg-red-600 hover:bg-red-700 text-white font-mono font-bold py-3 rounded-xl transition cursor-pointer text-[10px] uppercase tracking-wider"
              >
                Log Rejection and Notify Client
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
