'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileSignature, 
  Coins, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  ArrowRight, 
  Lock, 
  Unlock, 
  RefreshCw, 
  FileText, 
  HelpCircle,
  TrendingUp,
  Scale
} from 'lucide-react';
import { Property, UserAccount, Inquiry } from '../types';

export interface EscrowAgreementDesc {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyLocation: string;
  propertyImage: string;
  tenantName: string;
  tenantEmail: string;
  tenantWallet?: string;
  ownerId: string;
  ownerName: string;
  ownerWallet?: string;
  agreementType: 'RENT' | 'BUY';
  monthlyRentOrTotalPrice: number;
  securityDeposit: number; // 2x monthly rent in rent, or downpayment
  rentalDurationMonths?: number;
  agreementStatus: 'DRAFT' | 'PENDING_OWNER_REVIEW' | 'PENDING_TENANT_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'SIGNED' | 'ESCROW_STARTED' | 'COMPLETED';
  escrowStatus: 'NOT_STARTED' | 'PENDING_DEPOSIT' | 'FUNDED' | 'RELEASED' | 'REFUNDED' | 'DISPUTED' | 'CANCELLED' | 'COMPLETED';
  disputeSubject?: string;
  disputeNotes?: string;
  contractHash?: string;
  escrowHash?: string;
  transactionLogs: string[];
  lastUpdated: string;
}

interface AgreementsEscrowProps {
  currentUser: UserAccount;
  properties: Property[];
  inquiries: Inquiry[];
  onInquiryUpdate?: (updatedInq: Inquiry[]) => void;
  onAuditLogAdded: (actionText: string) => void;
  onNotificationTriggered: (title: string, msg: string, cat: 'IDENTITY' | 'ESCROW' | 'BLOCKCHAIN' | 'SECURITY' | 'GENERAL') => void;
}

export default function AgreementsEscrow({
  currentUser,
  properties,
  inquiries,
  onInquiryUpdate,
  onAuditLogAdded,
  onNotificationTriggered
}: AgreementsEscrowProps) {
  const [agreements, setAgreements] = useState<EscrowAgreementDesc[]>([]);
  const [selectedAgreement, setSelectedAgreement] = useState<EscrowAgreementDesc | null>(null);
  
  // Simulation interactions
  const [fundingProgress, setFundingProgress] = useState<boolean>(false);
  const [releaseProgress, setReleaseProgress] = useState<boolean>(false);
  const [refundProgress, setRefundProgress] = useState<boolean>(false);
  
  // Dispute submission inputs
  const [showDisputeModal, setShowDisputeModal] = useState<boolean>(false);
  const [disputeSubject, setDisputeSubject] = useState<string>('');
  const [disputeNotes, setDisputeNotes] = useState<string>('');

  // Propose/Create new agreement from listings
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [targetPropertyId, setTargetPropertyId] = useState<string>('');
  const [duration, setDuration] = useState<number>(12);
  const [customPrice, setCustomPrice] = useState<number>(1200);
  const [customDeposit, setCustomDeposit] = useState<number>(2400);
  const [proposalNotes, setProposalNotes] = useState<string>('');
  const [proposalType, setProposalType] = useState<'RENT' | 'BUY'>('RENT');

  // Load agreements database from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('vex_escrow_agreements');
    if (stored) {
      setAgreements(JSON.parse(stored));
    } else {
      // Seed initial mock agreements reflecting user profiles
      const seedAgreements: EscrowAgreementDesc[] = [
        {
          id: 'agr-0081',
          propertyId: 'prop-1',
          propertyName: 'Parkview Residences - Unit 12A',
          propertyLocation: 'Zurich, Switzerland',
          propertyImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
          tenantName: 'Sarah Conner',
          tenantEmail: 'sarah.conner@sky.net',
          tenantWallet: '0x321a0f9b0de318caeec3b0928fab83a819b1399',
          ownerId: 'usr-3',
          ownerName: 'Lord Sterling',
          ownerWallet: '0x8f3c7e8a93b4512e737c1d1a8e932efea34c892b',
          agreementType: 'RENT',
          monthlyRentOrTotalPrice: 1850,
          securityDeposit: 3700,
          rentalDurationMonths: 12,
          agreementStatus: 'SIGNED',
          escrowStatus: 'FUNDED',
          contractHash: '0x17bf8a93b4512e737c1d1a8e932efea34c892bc7b0e1189ac3',
          escrowHash: '0x82efc8a51e605d39ea3be09b11e2ce00de489ba',
          transactionLogs: [
            `[Init] 2026-06-10: Mutual Rental covenant parameters published.`,
            `[Verification] 2026-06-11: Legal title checklist validated. Compliance OK.`,
            `[Signature] 2026-06-11: Digitally signed by Owner (Lord Sterling) using 0x8f3c...892b.`,
            `[Signature] 2026-06-12: Digitally signed by Tenant (Sarah Conner) using 0x321a...1399.`,
            `[Deposit] 2026-06-12: 3,700 USDT sandbox credits locked into ESCROW-VEX-0081.`
          ],
          lastUpdated: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
        },
        {
          id: 'agr-0092',
          propertyId: 'prop-2',
          propertyName: 'Marina Bay Skyline Studio',
          propertyLocation: 'Marina Bay, Singapore',
          propertyImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
          tenantName: 'Tony Stark',
          tenantEmail: 'tony@stark.arc',
          tenantWallet: '0xfa89c0decca2ba18ef399cbbde02aefea7881cd0',
          ownerId: 'usr-3',
          ownerName: 'Lord Sterling',
          ownerWallet: '0x8f3c7e8a93b4512e737c1d1a8e932efea34c892b',
          agreementType: 'BUY',
          monthlyRentOrTotalPrice: 145000,
          securityDeposit: 15000,
          agreementStatus: 'PENDING_OWNER_REVIEW',
          escrowStatus: 'NOT_STARTED',
          transactionLogs: [
            `[Init] 2026-06-13: Purchase proposal lodged by Tony Stark. Offer: $145,000 USD downpayment lock.`,
            `[Review] 2026-06-13: Sent to Lord Sterling for governance approval.`
          ],
          lastUpdated: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
        }
      ];
      localStorage.setItem('vex_escrow_agreements', JSON.stringify(seedAgreements));
      setAgreements(seedAgreements);
    }
  }, []);

  const persistAgreements = (updated: EscrowAgreementDesc[]) => {
    setAgreements(updated);
    localStorage.setItem('vex_escrow_agreements', JSON.stringify(updated));
    if (selectedAgreement) {
      const liveVer = updated.find(a => a.id === selectedAgreement.id);
      if (liveVer) setSelectedAgreement(liveVer);
    }
  };

  const startNewAgreementProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    if (currentUser.kycStatus !== 'APPROVED') {
      alert('KYC approval is required to initiate rental covenants or buy proposals. Please compile your passport details.');
      return;
    }
    
    if (currentUser.walletStatus !== 'VERIFIED' || !currentUser.linkedWalletAddress) {
      alert('Please connect your sovereign Web3 wallet in the KYC & Wallet panel before signing lease protocols.');
      return;
    }

    const targetProp = properties.find(p => p.id === targetPropertyId);
    if (!targetProp) {
      alert('Invalid property selection.');
      return;
    }

    const newAg: EscrowAgreementDesc = {
      id: `agr-05${Math.floor(10 + Math.random() * 90)}`,
      propertyId: targetProp.id,
      propertyName: targetProp.name,
      propertyLocation: targetProp.location,
      propertyImage: targetProp.image,
      tenantName: currentUser.name,
      tenantEmail: currentUser.email,
      tenantWallet: currentUser.linkedWalletAddress,
      ownerId: targetProp.ownerId,
      ownerName: targetProp.ownerName,
      ownerWallet: targetProp.blockchainHash ? '0x8f3c7e8a93b4512e737c1d1a8e932efea34c892b' : undefined,
      agreementType: proposalType,
      monthlyRentOrTotalPrice: customPrice,
      securityDeposit: customDeposit,
      rentalDurationMonths: proposalType === 'RENT' ? duration : undefined,
      agreementStatus: 'PENDING_OWNER_REVIEW',
      escrowStatus: 'NOT_STARTED',
      transactionLogs: [
        `[Init] ${new Date().toLocaleDateString()}: Proposed contract terms dispatched by Potential Tenant (${currentUser.name})`,
        `[Vetting] Auto-checked: Tenant KYC state APPROVED. Signature linked: ${currentUser.linkedWalletAddress.slice(0, 10)}...`
      ],
      lastUpdated: new Date().toISOString()
    };

    const nextList = [newAg, ...agreements];
    persistAgreements(nextList);
    onAuditLogAdded(`Proposed ${proposalType} covenant on ${targetProp.name} for $${customPrice}`);
    onNotificationTriggered(`Agreement Proposal Dispatched`, `Proposed terms for ${targetProp.name} submitted for owner signature audits.`, `ESCROW`);
    
    setShowCreateModal(false);
    alert('Agreement dispatched! The property owner has been notified and must sign the smart contract parameters.');
  };

  // Owner action: accept, reject, request modifications
  const handleOwnerApproval = (id: string, action: 'ACCEPT' | 'REJECT') => {
    const nextList = agreements.map(ag => {
      if (ag.id === id) {
        let status: EscrowAgreementDesc['agreementStatus'] = ag.agreementStatus;
        let escrow: EscrowAgreementDesc['escrowStatus'] = ag.escrowStatus;
        let logs = [...ag.transactionLogs];

        if (action === 'ACCEPT') {
          status = 'SIGNED';
          escrow = 'PENDING_DEPOSIT';
          logs.push(`[Approved] ${new Date().toUTCString()}: Terms sanctioned by Owner (${currentUser.name}). Issued contract ledger.`);
          logs.push(`[Verification] Minted SHA-256 agreement binary hash.`);
          
          onAuditLogAdded(`Sanctioned agreement covenants for ID: ${ag.id}`);
          onNotificationTriggered(`Agreement Covenants Sanctioned`, `Agreement ${ag.id} was accepted by the owner. Pending deposit locks.`, `ESCROW`);
        } else {
          status = 'REJECTED';
          logs.push(`[Rejected] ${new Date().toUTCString()}: Counterproposal rejected by listing owner.`);
          onAuditLogAdded(`Rejected tenant lease proposal: ${ag.id}`);
        }

        return {
          ...ag,
          agreementStatus: status,
          escrowStatus: escrow,
          contractHash: action === 'ACCEPT' ? '0x' + Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join('') : undefined,
          transactionLogs: logs,
          lastUpdated: new Date().toISOString()
        };
      }
      return ag;
    });

    persistAgreements(nextList);
    alert(action === 'ACCEPT' ? 'Agreement approved and digitally signed. Awaiting tenant deposit allocation.' : 'Proposal rejected.');
  };

  // Tenant action: Commit deposit lock simulation
  const simulateFundDeposit = (id: string) => {
    setFundingProgress(true);
    
    setTimeout(() => {
      const nextList = agreements.map(ag => {
        if (ag.id === id) {
          const logs = [...ag.transactionLogs];
          logs.push(`[Deposit Action] ${new Date().toUTCString()}: Tenant transmitted $${ag.securityDeposit} test tokens to smart-escrow custody ledger.`);
          logs.push(`[Custody Activated] Secure contract state verified: FUNDED.`);
          
          onAuditLogAdded(`Deposited $${ag.securityDeposit} test funds into Escrow: ${ag.id}`);
          onNotificationTriggered(`Escrow Funds Secured`, `Audit node locked $${ag.securityDeposit} to custody account ${ag.id}`, `ESCROW`);

          return {
            ...ag,
            agreementStatus: 'ESCROW_STARTED' as const,
            escrowStatus: 'FUNDED' as const,
            escrowHash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
            transactionLogs: logs,
            lastUpdated: new Date().toISOString()
          };
        }
        return ag;
      });

      persistAgreements(nextList);
      setFundingProgress(false);
      alert('Simulation Success! $USDT test tokens securely allocated. The contract has transitioned into active escrow custody.');
    }, 1200);
  };

  // Owner action: Complete / Release escrow funds (at lease termination or sale finish)
  const simulateReleaseFunds = (id: string) => {
    setReleaseProgress(true);
    
    setTimeout(() => {
      const nextList = agreements.map(ag => {
        if (ag.id === id) {
          const logs = [...ag.transactionLogs];
          logs.push(`[Release Transact] ${new Date().toUTCString()}: Signed mutual resolution release. Dispatching escrow holdings to owner wallet.`);
          logs.push(`[Consensus] Validator verified ledger state: RELEASED.`);

          onAuditLogAdded(`Released escrow savings to owner for ID: ${ag.id}`);
          onNotificationTriggered(`Funds Released`, `Sovereign validator released escrow tokens for contract ${ag.id}`, `ESCROW`);

          return {
            ...ag,
            agreementStatus: 'COMPLETED' as const,
            escrowStatus: 'RELEASED' as const,
            transactionLogs: logs,
            lastUpdated: new Date().toISOString()
          };
        }
        return ag;
      });

      persistAgreements(nextList);
      setReleaseProgress(false);
      alert('Consensus Success! Custody funds disbursed to the assigned property owner wallet relay.');
    }, 1200);
  };

  // Initiate dispute arbitration
  const handleInitiateDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgreement || !disputeSubject.trim()) return;

    const nextList = agreements.map(ag => {
      if (ag.id === selectedAgreement.id) {
        const logs = [...ag.transactionLogs];
        logs.push(`[Dispute Flagged] ${new Date().toUTCString()}: Dispute claim registered: ${disputeSubject}. Locked transaction assets pending arbitration verdicts.`);
        logs.push(`[Audit Hold] Custody state switched: DISPUTED.`);

        onAuditLogAdded(`Opened compliance dispute arbitration request on Agreement: ${ag.id}`);
        onNotificationTriggered(`Dispute Opened: ${ag.id}`, `Arbitration initiated. Administration override controls are now active.`, `SECURITY`);

        return {
          ...ag,
          agreementStatus: 'ESCROW_STARTED' as const,
          escrowStatus: 'DISPUTED' as const,
          disputeSubject,
          disputeNotes,
          transactionLogs: logs,
          lastUpdated: new Date().toISOString()
        };
      }
      return ag;
    });

    persistAgreements(nextList);
    setShowDisputeModal(false);
    setDisputeSubject('');
    setDisputeNotes('');
    alert('Dispute initiated. Administrative compliance units have been notified and will review the audit logs for resolution.');
  };

  // User list based on active role
  const userAgreements = agreements.filter(ag => {
    if (currentUser.role === 'PROPERTY_OWNER') {
      return ag.ownerId === currentUser.id;
    } else if (currentUser.role === 'TENANT') {
      return ag.tenantEmail === currentUser.email || ag.tenantName === currentUser.name;
    }
    return true; // Admins see everything
  });

  const getEscrowBadgeColor = (status: string) => {
    switch(status) {
      case 'FUNDED': return 'bg-emerald-500 text-white font-extrabold';
      case 'RELEASED': return 'bg-blue-600 text-white';
      case 'REFUNDED': return 'bg-amber-600 text-white';
      case 'DISPUTED': return 'bg-rose-500 text-white font-bold animate-pulse';
      case 'PENDING_DEPOSIT': return 'bg-yellow-400 text-yellow-950 font-semibold';
      case 'COMPLETED': return 'bg-slate-700 text-slate-100';
      default: return 'bg-slate-200 text-slate-600';
    }
  };

  return (
    <div className="space-y-6" id="agreements-escrow-center">
      
      {/* Informational warning banner about transaction simulations */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-5 rounded-3xl flex items-start gap-3 text-xs text-blue-800 font-mono">
        <Scale className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <strong>Interactive Smart Escrow Sandbox Environment:</strong>
          <p className="leading-relaxed font-sans text-slate-600">
            All listed agreements, wallets, and locking schedules represent <strong>high-fidelity visual contract simulations</strong>. Financial values are allocated in custom platform testnets using sandbox test-fuel credits to prove sovereign operational trust. Genuine real world deeds are not affected.
          </p>
        </div>
      </div>

      {/* Main Grid division */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Area: Agreements List */}
        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3.5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <FileSignature className="w-4 h-4 text-blue-600" />
              <span>Contracts Log</span>
            </h3>
            
            {currentUser.role === 'TENANT' && (
              <button
                onClick={() => {
                  const verifiedProps = properties.filter(p => p.status === 'PUBLISHED');
                  if (verifiedProps.length === 0) {
                    alert('No verified published properties currently available to propose contracts on.');
                    return;
                  }
                  setTargetPropertyId(verifiedProps[0].id);
                  setCustomPrice(verifiedProps[0].tokenPrice);
                  setCustomDeposit(verifiedProps[0].tokenPrice * 2);
                  setShowCreateModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-mono text-[9px] font-bold px-2 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-sm"
              >
                PROPOSE TERM
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {userAgreements.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-mono">
                No active agreements or pending proposals found.
              </div>
            ) : (
              userAgreements.map(ag => {
                const isActive = selectedAgreement?.id === ag.id;
                return (
                  <div
                    key={ag.id}
                    onClick={() => setSelectedAgreement(ag)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                      isActive 
                        ? 'border-blue-500 bg-blue-50/20 shadow-sm' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">{ag.id}</span>
                      <span className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${getEscrowBadgeColor(ag.escrowStatus)}`}>
                        {ag.escrowStatus}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 mt-2 truncate">{ag.propertyName}</h4>
                    <p className="text-[10px] text-slate-500 font-mono">{ag.propertyLocation}</p>

                    <div className="flex items-center justify-between text-[11px] font-mono border-t border-slate-100/85 mt-2.5 pt-2">
                      <div>
                        <span className="text-slate-400 block text-[9px]">MONTHLY RENT</span>
                        <strong className="text-slate-800">${ag.monthlyRentOrTotalPrice.toLocaleString()}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[9px]">STATED COVENANTS</span>
                        <span className="text-sky-600 font-semibold text-[10px]">{ag.agreementStatus}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Area: Deep Contract Workspace & Controls */}
        <div className="lg:col-span-8 space-y-6">
          {selectedAgreement ? (
            <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6 text-left">
              
              {/* Detailed Header info */}
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-mono px-2 py-0.5 rounded border">ID: {selectedAgreement.id}</span>
                    <span className="text-xs font-mono text-slate-400">Last verified auto-node: {new Date(selectedAgreement.lastUpdated).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1 uppercase tracking-tight">{selectedAgreement.propertyName} Covenants</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedAgreement.propertyLocation}</p>
                </div>

                <div className="flex flex-col items-end shrink-0 font-mono">
                  <span className="text-[9px] text-slate-400 uppercase font-bold text-right mb-0.5">Custody Ledger State</span>
                  <span className={`text-[11px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider ${getEscrowBadgeColor(selectedAgreement.escrowStatus)}`}>
                    {selectedAgreement.escrowStatus}
                  </span>
                </div>
              </div>

              {/* Layout splits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Section A: Agreement Parameters Deed */}
                <div className="space-y-4">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold border-b pb-1">MUTUAL CONTRACT TERMS</span>
                  
                  <div className="bg-slate-50 border p-4.5 rounded-2xl text-xs font-mono space-y-3 text-slate-705 leading-relaxed">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Agreement Intent:</span>
                      <strong className="text-slate-900 uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded border text-[10px]">{selectedAgreement.agreementType}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Transactor Buyer/Tenant:</span>
                      <strong className="text-slate-900 font-sans">{selectedAgreement.tenantName}</strong>
                    </div>
                    {selectedAgreement.tenantWallet && (
                      <div className="flex justify-between items-center text-[10px] border-b pb-2">
                        <span className="text-slate-500">Tenant Signature Key:</span>
                        <strong className="text-rose-600">{selectedAgreement.tenantWallet.slice(0, 8)}...{selectedAgreement.tenantWallet.slice(-8)}</strong>
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-slate-500">Listing Sovereign Owner:</span>
                      <strong className="text-slate-900 font-sans">{selectedAgreement.ownerName}</strong>
                    </div>
                    {selectedAgreement.ownerWallet && (
                      <div className="flex justify-between items-center text-[10px] border-b pb-2">
                        <span className="text-slate-500">Owner Signature Key:</span>
                        <strong className="text-sky-600">{selectedAgreement.ownerWallet.slice(0, 8)}...{selectedAgreement.ownerWallet.slice(-8)}</strong>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-slate-500">Proposed Monthly Fee:</span>
                      <strong className="text-slate-900 text-sm">${selectedAgreement.monthlyRentOrTotalPrice.toLocaleString()} USD</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Custodial Deposit Locked:</span>
                      <strong className="text-emerald-600">${selectedAgreement.securityDeposit.toLocaleString()} USD</strong>
                    </div>
                    {selectedAgreement.rentalDurationMonths && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Stated Lease Period:</span>
                        <strong className="text-slate-900">{selectedAgreement.rentalDurationMonths} Months</strong>
                      </div>
                    )}
                  </div>

                  {selectedAgreement.contractHash && (
                    <div className="bg-slate-50/50 border rounded-2xl p-3.5 font-mono text-[9px] text-slate-500 space-y-1 truncate">
                      <strong className="text-slate-400 block uppercase text-[8px] tracking-wider">Verifiable Transaction Proof Receipt</strong>
                      <div>Agreement Binary SHA-256 Hash: <span className="text-slate-800 font-bold font-mono">{selectedAgreement.contractHash}</span></div>
                      {selectedAgreement.escrowHash && (
                        <div>Escrow Custody Vault Address: <span className="text-emerald-700 font-bold font-mono">{selectedAgreement.escrowHash}</span></div>
                      )}
                    </div>
                  )}

                  {/* Owner review actions */}
                  {selectedAgreement.agreementStatus === 'PENDING_OWNER_REVIEW' && currentUser.role === 'PROPERTY_OWNER' && (
                    <div className="bg-purple-50 border border-purple-150 p-4.5 rounded-2xl space-y-3">
                      <p className="text-[11px] font-mono text-purple-800 leading-relaxed">
                        ⚠️ <strong>Action Required:</strong> A potential client has initiated these leasing parameters. Please verify pricing, dates, and sign.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOwnerApproval(selectedAgreement.id, 'REJECT')}
                          className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-mono text-[10px] font-bold py-2.5 rounded-xl cursor-pointer transition-all"
                        >
                          REJECT TERMS
                        </button>
                        <button
                          onClick={() => handleOwnerApproval(selectedAgreement.id, 'ACCEPT')}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-mono text-[10px] font-bold py-2.5 rounded-xl cursor-pointer transition-all shadow-sm"
                        >
                          SIGN & ACCEPT
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section B: Escrow Interactive Control Panel */}
                <div className="space-y-4">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold border-b pb-1">ESCROW LIFE-CYCLE CONTROLS</span>
                  
                  {/* Escrow Timeline */}
                  <div className="space-y-4 font-mono text-xs">
                    
                    {/* Live Interaction actions state transitions */}
                    <div className="p-4 bg-slate-50 border rounded-2xl space-y-3.5">
                      <span className="text-[8px] text-slate-400 block font-bold uppercase tracking-wider">Execute Sandbox Escrow Actions</span>
                      
                      {selectedAgreement.escrowStatus === 'NOT_STARTED' && (
                        <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                          Once terms are mutually approved and signed by the property owner, secure sandbox locking triggers become available.
                        </p>
                      )}

                      {/* Funding step */}
                      {selectedAgreement.escrowStatus === 'PENDING_DEPOSIT' && (
                        <div className="space-y-2">
                          <p className="text-[11px] text-slate-500 leading-relaxed font-sans font-normal">
                            Terms signed! Tenants must now lock the security deposit sum (<strong>${selectedAgreement.securityDeposit.toLocaleString()} USD</strong>) into the trust ledger vault.
                          </p>
                          {currentUser.role === 'TENANT' ? (
                            <button
                              onClick={() => simulateFundDeposit(selectedAgreement.id)}
                              disabled={fundingProgress}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-extrabold py-3 rounded-xl transition-all cursor-pointer shadow flex items-center justify-center gap-1.5 uppercase text-[10px] tracking-wider"
                            >
                              {fundingProgress ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  <span>MINING SANDBOX LEDGER TX...</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="w-4 h-4" />
                                  <span>Fund Escrow with Test Credits</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <div className="bg-slate-100 p-2 text-center text-slate-500 text-[10px] border rounded font-bold uppercase">
                              Awaiting Tenant Deposit Locks
                            </div>
                          )}
                        </div>
                      )}

                      {/* Funded state - can release or dispute */}
                      {selectedAgreement.escrowStatus === 'FUNDED' && (
                        <div className="space-y-3">
                          <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100/90 text-[11px] leading-relaxed">
                            ✓ <strong>Custodial Assets Secured!</strong> $USDT test credits are safely held inside smart contract vault <code>VEX-ESCROW-{selectedAgreement.id.slice(-4)}</code>.
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setShowDisputeModal(true)}
                              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-mono text-[9px] py-2.5 rounded-xl uppercase transition cursor-pointer"
                            >
                              Initiate Dispute
                            </button>
                            
                            {currentUser.role === 'TENANT' || currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN' ? (
                              <button
                                onClick={() => simulateReleaseFunds(selectedAgreement.id)}
                                disabled={releaseProgress}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-mono text-[9px] py-1.5 rounded-xl uppercase transition flex items-center justify-center gap-1 cursor-pointer font-bold shadow-sm"
                              >
                                {releaseProgress ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Unlock className="w-3.5 h-3.5" />
                                )}
                                <span>Release Funds</span>
                              </button>
                            ) : (
                              <div className="bg-slate-150 p-2 rounded text-center text-slate-500 text-[8px] font-bold uppercase border border-slate-250 flex items-center justify-center leading-tight">
                                Awaiting Tenant/Admin Release
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Disputed state */}
                      {selectedAgreement.escrowStatus === 'DISPUTED' && (
                        <div className="bg-rose-50 border border-rose-150 p-4 rounded-xl text-rose-800 space-y-2 leading-relaxed">
                          <div className="flex items-center gap-1.5 font-bold text-xs">
                            <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />
                            <span>Custodial Assets Frozen (In arbitration)</span>
                          </div>
                          <p className="text-[11px] font-sans text-rose-705">
                            Arbitration has frozen assets due to: <strong>"{selectedAgreement.disputeSubject}"</strong>. Operations administrators are auditing validation proof logs.
                          </p>
                          <div className="text-[10px] font-mono bg-white/70 p-2.5 rounded border border-rose-200 uppercase text-slate-700">
                            Claim Note: {selectedAgreement.disputeNotes || 'none added'}
                          </div>
                          <p className="text-[9px] text-slate-500 font-sans italic text-right mt-1">
                            Only administrators can override disputed allocations.
                          </p>
                        </div>
                      )}

                      {/* Completed / Released / Refunded states */}
                      {['RELEASED', 'REFUNDED', 'COMPLETED'].includes(selectedAgreement.escrowStatus) && (
                        <div className="bg-slate-100 p-4 rounded-xl text-slate-705 space-y-1.5 text-center leading-relaxed">
                          <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                          <h4 className="font-bold text-slate-900 uppercase text-xs">Transaction Archive Finalized</h4>
                          <p className="text-[11px] font-sans">
                            Funds disbursed matching compliance consensus rules. Safe-vault state locked permanently on ledger history archives.
                          </p>
                        </div>
                      )}

                    </div>
                  </div>

                </div>

              </div>

              {/* Section C: Contract Live Blockchain Logs Feed */}
              <div className="border-t pt-4 space-y-2">
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold select-none">
                  VEX Trust Node Consensus Transaction Trail
                </span>
                <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-[9px] space-y-1.5 max-h-40 overflow-y-auto border border-slate-800 text-left">
                  {selectedAgreement.transactionLogs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed">
                      <span className="text-slate-500 font-sans select-none">&gt;&gt;</span> {log}
                    </div>
                  ))}
                  <div className="text-slate-500 text-[8px] animate-pulse">● node connection streaming online...</div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border shadow-sm text-center text-slate-400 space-y-3">
              <FileSignature className="w-12 h-12 text-slate-300 mx-auto" strokeWidth={1} />
              <h4 className="text-sm font-bold text-slate-600 uppercase font-mono">No Contract Selected</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-sans leading-relaxed">
                Click must choose one active ledger proposal on the left sidebar folder logs to initiate deposits, request contract signatures, authorize escrow release, or start arbitration disputes.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL 1: PROPOSE NEW COVENANT AGREEMENT */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-mono text-xs">
          <div className="bg-white rounded-3xl border shadow-2xl p-6 max-w-md w-full space-y-5 text-left relative">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-full bg-slate-50 p-1 border cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b pb-3.5">
              <h3 className="text-sm font-bold text-slate-900 uppercase">Propose Agreement Terms</h3>
              <p className="text-[10px] text-slate-400 mt-1">Configure digital title lease/sale stipulations to Owner review queue.</p>
            </div>

            <form onSubmit={startNewAgreementProposal} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 uppercase font-bold">Select Verified Property</label>
                <select
                  value={targetPropertyId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setTargetPropertyId(id);
                    const prop = properties.find(p => p.id === id);
                    if (prop) {
                      setCustomPrice(prop.tokenPrice);
                      setCustomDeposit(prop.tokenPrice * 2);
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 cursor-pointer font-semibold text-[11px]"
                >
                  {properties.filter(p => p.status === 'PUBLISHED').map(p => (
                    <option key={p.id} value={p.id}>{p.name} (${p.tokenPrice}/key)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-400 uppercase font-bold">Covenant intent</label>
                  <select
                    value={proposalType}
                    onChange={(e) => setProposalType(e.target.value as 'RENT' | 'BUY')}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 cursor-pointer text-[11px] font-semibold"
                  >
                    <option value="RENT">LEASING (RENT)</option>
                    <option value="BUY">ACQUISITION (BUY)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-400 uppercase font-bold">Duration (Months)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    disabled={proposalType === 'BUY'}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 text-[11px] disabled:bg-slate-100 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-400 uppercase font-bold">Stated Price ($ USD)</label>
                  <input
                    type="number"
                    min="1"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 text-[11px] font-semibold text-slate-850"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-400 uppercase font-bold">Allocated Deposit ($ USD)</label>
                  <input
                    type="number"
                    min="1"
                    value={customDeposit}
                    onChange={(e) => setCustomDeposit(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 text-[11px] font-semibold text-emerald-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 uppercase font-bold">Add stipulations (Private notes / terms)</label>
                <textarea
                  value={proposalNotes}
                  onChange={(e) => setProposalNotes(e.target.value)}
                  placeholder="Include custom keys lock stipulations, clean utility drawings specifications..."
                  className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 h-16 resize-none font-sans text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold tracking-wider py-3 rounded-xl transition shadow cursor-pointer uppercase text-[10px]"
              >
                DISPATCH PROSECUTION CONTRACT
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: INITIATE ARBITRATION DISPUTE */}
      {showDisputeModal && selectedAgreement && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-mono text-xs">
          <div className="bg-white rounded-3xl border shadow-2xl p-6 max-w-sm w-full space-y-5 text-left relative">
            <button 
              onClick={() => setShowDisputeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-full bg-slate-50 p-1 border cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b pb-3 text-red-705">
              <h3 className="text-sm font-bold text-rose-700 uppercase flex items-center gap-1.5">
                <AlertTriangle className="w-4.5 h-4.5 animate-pulse" />
                <span>Initiate Trust Arbitration</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">This freeze protocol halts automatic contract distributions globally pending administrator intervention.</p>
            </div>

            <form onSubmit={handleInitiateDispute} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 uppercase font-bold">Dispute Cause / Category</label>
                <select 
                  value={disputeSubject} 
                  required
                  onChange={(e) => setDisputeSubject(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-red-500 font-semibold cursor-pointer text-[11px]"
                >
                  <option value="">-- Choose Dispute Reason --</option>
                  <option value="Property Mismatch">Stated amenities or structure size mismatch</option>
                  <option value="Delinquencies / Clean Utility Mismatch">Unclean utility ratings or smart locks failures</option>
                  <option value="Entity Vetting Dispute">Owner Corporate Entity unverified mismatch</option>
                  <option value="Breach of Contract Terms">Tenant violated covenant or payment timelines</option>
                  <option value="Disrepair Force Majeure">Sovereign geographical damage defaults</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 uppercase font-bold">Elaborate Arbitration Claim Details</label>
                <textarea
                  value={disputeNotes}
                  required
                  onChange={(e) => setDisputeNotes(e.target.value)}
                  placeholder="Provide supporting logs hashes, timestamps, or utility meter proof notes..."
                  className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-red-500 h-24 resize-none font-sans text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-mono font-bold tracking-wider py-3 rounded-xl transition shadow cursor-pointer uppercase text-[10px]"
              >
                Freeze custody & Alert admin
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
