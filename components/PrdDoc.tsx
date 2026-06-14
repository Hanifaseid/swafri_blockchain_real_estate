'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  ShieldCheck, 
  Layout, 
  Users, 
  Briefcase, 
  Lock, 
  HelpCircle, 
  CheckSquare, 
  Bell, 
  FileSignature
} from 'lucide-react';

interface PrdDocProps {
  onBack?: () => void;
}

export default function PrdDoc({ onBack }: PrdDocProps) {
  const [activeDocSection, setActiveDocSection] = useState<'all' | 'kyc' | 'wallet' | 'onchain' | 'escrow' | 'roles'>('all');
  const [docSearch, setDocSearch] = useState('');

  const sections = [
    {
      id: 'kyc',
      title: 'Module 1: KYC & User Verification',
      category: 'Identity',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      content: `KYC helps the platform verify who the user is before allowing sensitive actions like publishing listings or initiating escrow requests.
      
• NOT_STARTED: User registers and logs in but has not uploaded documents.
• PENDING/UNDER_REVIEW: User submits passport/gov ID and selfie.
• APPROVED: Operations clears the account. High-risk smart contract modules are unlocked.
• REJECTED: User notification is triggered with specific grounds/rejections.`,
      rules: [
        'Users can browse properties without active KYC details.',
        'Property owners cannot publish verified active listings without APPROVED state.',
        'Tenants cannot initiate direct multi-sig escrow without APPROVED state.',
        'Admins must submit an audited rejection reason on rejection.'
      ]
    },
    {
      id: 'wallet',
      title: 'Module 2: Ledger/Wallet Linking',
      category: 'Blockchain',
      icon: <Briefcase className="w-5 h-5 text-blue-400" />,
      content: `Connects a user account to a cryptographic web3 wallet public key. Used for signing agreement, receiving title certificate NFTs, and distributing test escrow funds.
      
• Verified signature prevents wallet addresses from being bound to multiple accounts.
• Seed phrase or private key must never interact with off-chain application layers.`,
      rules: [
        'Wallet binding strictly requires active session login.',
        'One unique wallet public address cannot bind to multiple profile entries.',
        'Provides verification log signature keys for all continuous transactions.'
      ]
    },
    {
      id: 'onchain',
      title: 'Modules 3 & 4: Blockchain Property Verification & NFTs',
      category: 'Blockchain',
      icon: <Layout className="w-5 h-5 text-sky-400" />,
      content: `Cryptographically registers property credentials without committing private files to the public ledger. 
      
• ON-CHAIN DATA: Property ID, SHA-256 document hash, owner wallet address, transaction proof hash, and unique ERC-1155 certificate ID.
• OFF-CHAIN DATA: Private home address, phone numbers, ownership deeds PDFs, and client passports (retained in secure compliance folders).`,
      rules: [
        'Only Admin or Super Admin roles can trigger verification and certificate issuance.',
        'Safety disclaimer clearly notifies that certificate is compliance-certified, avoiding misleading government-recognized ownership claims.'
      ]
    },
    {
      id: 'escrow',
      title: 'Modules 5 & 6: Smart Escrow & Agreements',
      category: 'Transactions',
      icon: <FileSignature className="w-5 h-5 text-yellow-400" />,
      content: `Allows tenant-purchasers and owners to enter standard binding digital lease covenants. 
      
• ESCROW STATES: NOT_STARTED, PENDING_DEPOSIT, FUNDED (test funds secured), RELEASED, REFUNDED, or DISPUTED.
• Admin handles dispute review in prototype when tenant opens arbitration queries.`,
      rules: [
        'Requires approved KYC and linked wallet on both parties.',
        'Uses sandbox test tokens only during current system version lifecycle.',
        'Creates transaction hash for all continuous state transitions.'
      ]
    },
    {
      id: 'roles',
      title: 'Access Control Matrix & Roles',
      category: 'Governance',
      icon: <Users className="w-5 h-5 text-purple-400" />,
      content: `• SUPER_ADMIN: Force-override registry, manage admins, view all logs, lift bans, review disputes.
• ADMIN: Review user KYC profiles, verify deed documents, issue title certificates, monitor contract escrow logs.
• PROPERTY_OWNER: Submit KYC, link wallet, upload listing drafts, request deed audits, review tenant rent leads.
• TENANT: Seek properties, save bookmarks, link web3 wallet, submit compliance KYC, commit rent/buy escrow.`,
      rules: [
        'Access controls must be asserted on both frontend panels and client route verification API gateways.',
        'All administrative override actions trigger immutable audit logging entries.'
      ]
    }
  ];

  const filteredSections = sections.filter(sec => {
    const matchesSearch = sec.title.toLowerCase().includes(docSearch.toLowerCase()) || 
                          sec.content.toLowerCase().includes(docSearch.toLowerCase());
    const matchesCategory = activeDocSection === 'all' || sec.id === activeDocSection;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6" id="prd-documentation-root">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 text-white p-2.5 rounded-2xl shadow">
            <FileText className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">VEX Compliance & PRD Manifest</h2>
            <p className="text-xs text-slate-500 font-mono">Trust, Blockchain, Escrow & Compliance specifications</p>
          </div>
        </div>

        {/* Filter Tab pills */}
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl text-[10px] font-mono border">
          <button
            onClick={() => setActiveDocSection('all')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${activeDocSection === 'all' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            ALL SPECS
          </button>
          <button
            onClick={() => setActiveDocSection('kyc')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${activeDocSection === 'kyc' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            KYC
          </button>
          <button
            onClick={() => setActiveDocSection('wallet')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${activeDocSection === 'wallet' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            WALLETS
          </button>
          <button
            onClick={() => setActiveDocSection('onchain')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${activeDocSection === 'onchain' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            BLOCKCHAIN
          </button>
          <button
            onClick={() => setActiveDocSection('escrow')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${activeDocSection === 'escrow' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            ESCROW
          </button>
        </div>
      </div>

      {/* Quick search input */}
      <div className="flex items-center gap-2.5 bg-slate-50 border px-3.5 py-2.5 rounded-xl text-xs max-w-md">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={docSearch}
          onChange={(e) => setDocSearch(e.target.value)}
          placeholder="Search trust, compliance, escrow guidelines or rules..."
          className="bg-transparent border-none outline-none w-full text-slate-700"
        />
      </div>

      {/* Quick Summary stats card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[11px]">
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-emerald-800 flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <div>
            <strong className="block uppercase text-[9px] text-emerald-600 tracking-wider">KYC Rigor Level</strong>
            <span className="block mt-0.5 leading-relaxed">Mandatory on both buyer/tenant rent actions & owner listing publications. Private details remain absolutely sandbox secure.</span>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-800 flex items-start gap-2.5">
          <Lock className="w-5 h-5 shrink-0" />
          <div>
            <strong className="block uppercase text-[9px] text-blue-600 tracking-wider">Escrow Transparency</strong>
            <span className="block mt-0.5 leading-relaxed">Requires authenticated wallet signatures. Releases are fully auditable with dual-signature consensus in case of dispute arbitrations.</span>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl text-purple-800 flex items-start gap-2.5">
          <HelpCircle className="w-5 h-5 shrink-0" />
          <div>
            <strong className="block uppercase text-[9px] text-purple-600 tracking-wider">Prototype Definition</strong>
            <span className="block mt-0.5 leading-relaxed">Secure manual document review pipeline coupled with instant testnet ledger mint registries for maximum platform speed.</span>
          </div>
        </div>
      </div>

      {/* List content cards */}
      <div className="space-y-4">
        {filteredSections.map(sec => (
          <div key={sec.id} className="bg-slate-50 border rounded-2xl p-5 hover:border-slate-300 transition-all">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-200">
              {sec.icon}
              <h3 className="text-sm font-bold text-slate-900">{sec.title}</h3>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-600 capitalize ml-auto">{sec.category}</span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap mt-3.5">
              {sec.content}
            </p>

            {sec.rules && sec.rules.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-200">
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block mb-2 font-bold select-none">
                  IMMUTABLE PROTOCOLS
                </span>
                <ul className="text-[11px] font-mono text-slate-600 space-y-1.5 pl-4 list-disc">
                  {sec.rules.map((rule, idx) => (
                    <li key={idx}>
                      <span className="text-slate-800">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* DEFINITION OF DONE FOR PROTOTYPE SUMMARY */}
      <div className="border border-slate-200 bg-white rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-slate-900">
          <CheckSquare className="w-5 h-5 text-emerald-500" />
          <h4 className="text-xs font-bold uppercase font-mono tracking-widest">Prototype Definition of Done Verification Checklist</h4>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          The following list represents fully satisfied, interactive compliance criteria currently running on the VEX real estate decentralized workspace:
        </p>

        <div className="grid md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="space-y-2 border-r pr-4">
            <div className="flex items-start gap-2 text-emerald-800">
              <span className="text-emerald-500 font-bold">✓</span>
              <span><strong>Manual KYC submission:</strong> Tenants and owners can trigger verification packets.</span>
            </div>
            <div className="flex items-start gap-2 text-emerald-800">
              <span className="text-emerald-500 font-bold">✓</span>
              <span><strong>Admin KYC Review:</strong> Operations reviews and approves profile verifications globally.</span>
            </div>
            <div className="flex items-start gap-2 text-emerald-800">
              <span className="text-emerald-500 font-bold">✓</span>
              <span><strong>Wallet linking logic:</strong> Generates unique cryptographic addresses with verified signature states.</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-emerald-800">
              <span className="text-emerald-500 font-bold">✓</span>
              <span><strong>Blockchain Deed Audits:</strong> Employs SHA-256 document hashing & issues verifiable certificates.</span>
            </div>
            <div className="flex items-start gap-2 text-emerald-800">
              <span className="text-emerald-500 font-bold">✓</span>
              <span><strong>Escrow simulation:</strong> Locks token distributions inside zkSmart contracts.</span>
            </div>
            <div className="flex items-start gap-2 text-emerald-800">
              <span className="text-emerald-500 font-bold">✓</span>
              <span><strong>Centralized audit registers:</strong> Logs actions seamlessly to keep records transparent.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
