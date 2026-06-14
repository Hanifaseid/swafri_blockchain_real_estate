'use client';

import React from 'react';
import { Property, UserAccount } from '../types';

interface OwnerLifecycleProps {
  properties: Property[];
  currentUser: UserAccount | null;
  archiveListing: (id: string) => void;
}

export default function OwnerLifecycle({
  properties,
  currentUser,
  archiveListing,
}: OwnerLifecycleProps) {
  const usersProperties = currentUser ? properties.filter((p) => p.ownerId === currentUser.id) : [];

  return (
    <div className="space-y-6 w-full max-w-none" id="owner-lifecycle-root">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <h3 className="text-base font-bold text-slate-900">Understanding Listing Status & Flow</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono" id="lifecycle-flow-diagram">
          <div className="border p-3 rounded-xl bg-slate-50">
            <span className="font-bold text-blue-600">1. DRAFT STATE</span>
            <p className="text-slate-500 text-[11px] mt-1">Listing is compiled, deeds uploaded privately. Hidden from public lists.</p>
          </div>
          <div className="border p-3 rounded-xl bg-slate-50">
            <span className="font-bold text-amber-600">2. SUBMITTED STATE</span>
            <p className="text-slate-500 text-[11px] mt-1">Deeds are queued inside administration hub for compliance review.</p>
          </div>
          <div className="border p-3 rounded-xl bg-slate-50">
            <span className="font-bold text-purple-600">3. VERIFIED STATE</span>
            <p className="text-slate-500 text-[11px] mt-1">Covenants validated. ERC-1155 certificate and on-chain hash generated.</p>
          </div>
          <div className="border p-3 rounded-xl bg-slate-50">
            <span className="font-bold text-emerald-600">4. PUBLISHED STATE</span>
            <p className="text-slate-500 text-[11px] mt-1">Listing is pushed live and fractional investors can begin purchasing.</p>
          </div>
        </div>

        <div className="border-t pt-5" id="lifecycle-monitoring-table">
          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">Live Life-cycle Monitoring Table</h4>
          <div className="overflow-x-auto text-xs font-mono">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-semibold text-[10px]">
                  <th className="p-3">Property</th>
                  <th className="p-3">Upload Checklist</th>
                  <th className="p-3 font-mono">Status</th>
                  <th className="p-3">Blockchain Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {usersProperties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold">{prop.name}</td>
                    <td className="p-3 text-slate-500">{prop.documentName || 'No document attached'}</td>
                    <td className="p-3">
                      <span className="border text-[10px] px-2 py-0.5 rounded font-bold uppercase">{prop.status}</span>
                    </td>
                    <td className="p-3 text-slate-400">{prop.blockchainHash ? 'RECORDED' : 'AWAITING VERIFICATION'}</td>
                    <td className="p-3">
                      <button
                        onClick={() => archiveListing(prop.id)}
                        className="text-red-500 text-[11px] hover:underline"
                      >
                        Archive
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
