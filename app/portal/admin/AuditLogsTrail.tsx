'use client';

import React, { useState } from 'react';
import { AuditLog } from '../types';
import { 
  FileText, 
  Search, 
  Clock, 
  Terminal, 
  ShieldCheck, 
  Activity, 
  ArrowRight,
  Database,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface AuditLogsTrailProps {
  auditLogs: AuditLog[];
}

export default function AuditLogsTrail({ auditLogs }: AuditLogsTrailProps) {
  const [search, setSearch] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'SECURITY' | 'PROPERTY' | 'ESCROW' | 'SYS_LOG'>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Auto identify categories based on action text keywords
  const getLogCategoryImpl = (action: string): 'SECURITY' | 'PROPERTY' | 'ESCROW' | 'SYS_LOG' => {
    const lowAction = action.toLowerCase();
    if (lowAction.includes('kyc') || lowAction.includes('wallet') || lowAction.includes('signature') || lowAction.includes('login') || lowAction.includes('overrule') || lowAction.includes('ban') || lowAction.includes('sanction')) {
      return 'SECURITY';
    }
    if (lowAction.includes('property') || lowAction.includes('deed') || lowAction.includes('listing') || lowAction.includes('add') || lowAction.includes('approved user')) {
      return 'PROPERTY';
    }
    if (lowAction.includes('escrow') || lowAction.includes('locked') || lowAction.includes('dispute') || lowAction.includes('refund') || lowAction.includes('released') || lowAction.includes('payout')) {
      return 'ESCROW';
    }
    return 'SYS_LOG';
  };

  const filteredLogs = auditLogs.filter(log => {
    const category = getLogCategoryImpl(log.action);
    const matchesSearch = log.user.toLowerCase().includes(search.toLowerCase()) || 
                          log.action.toLowerCase().includes(search.toLowerCase()) ||
                          log.email.toLowerCase().includes(search.toLowerCase()) ||
                          log.id.toLowerCase().includes(search.toLowerCase());
    
    if (filterCategory === 'ALL') return matchesSearch;
    return matchesSearch && category === filterCategory;
  });

  const getCategoryTheme = (action: string) => {
    const category = getLogCategoryImpl(action);
    switch (category) {
      case 'SECURITY': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'PROPERTY': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'ESCROW': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-slate-50 text-slate-700 border border-slate-100';
    }
  };



  return (
    <div className="space-y-6 text-left" id="audit-logs-trail-center">
      
      {/* Upper overview box */}
      <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3.5 gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-1.5 font-mono">
              <Database className="w-5 h-5 text-indigo-600 animate-pulse" />
              <span>Immutable Ledger Custody Audit Trail</span>
            </h3>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Automated timestamp state changes anchored on decentralized consensus records</p>
          </div>

          <span className="text-[9px] font-mono bg-indigo-50 border border-indigo-100 text-indigo-700 py-1 px-3.5 rounded-full font-bold uppercase shrink-0">
            Audit Trails: {auditLogs.length} Records
          </span>
        </div>

        {/* Toolbar lookup and tags */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative font-mono text-xs">
            <Search className="w-4 h-4 text-slate-405 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search audit trail by user email, actions, or ref id..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 pl-10 border rounded-xl outline-none focus:bg-white focus:border-indigo-500 font-semibold text-slate-800"
            />
          </div>

          <div className="md:col-span-6 flex flex-wrap gap-1 bg-slate-55 p-1 rounded-xl border bg-slate-50 text-[9px] font-mono font-bold items-center">
            {(['ALL', 'SECURITY', 'PROPERTY', 'ESCROW', 'SYS_LOG'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`flex-1 px-2.5 py-2.5 rounded-lg cursor-pointer transition-all ${
                  filterCategory === cat 
                    ? 'bg-slate-900 text-white shadow-sm font-black' 
                    : 'text-slate-500 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Audit elements list timeline */}
        <div className="space-y-2.5">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-10 font-mono text-slate-400 text-xs border border-dashed rounded-2xl">
              ✕ No immutable audit trails match search credentials.
            </div>
          ) : (
            filteredLogs.map(log => {
              const isExpanded = expandedLogId === log.id;
              const cat = getLogCategoryImpl(log.action);
              return (
                <div 
                  key={log.id} 
                  className="border rounded-2xl p-4 bg-white hover:bg-slate-50/50 transition-all font-mono text-[11px] text-slate-700 leading-relaxed text-left space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <span className="text-slate-400 select-none">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                      <strong className="text-indigo-600">{log.user}</strong>
                      <span className="text-slate-405 font-mono text-[10px] text-slate-400">({log.email})</span>
                      <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${getCategoryTheme(log.action)}`}>
                        {cat}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold select-none">SHA_ANCHOR_OK</span>
                      <button
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg border bg-white focus:outline-none cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Operational description text */}
                  <div className="pl-5 border-l-2 border-indigo-100 flex items-center justify-between gap-4">
                    <span className="text-slate-900 font-medium">{log.action}</span>
                    <span className="text-[8px] text-slate-400 uppercase tracking-wide">ID: {log.id}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
}
