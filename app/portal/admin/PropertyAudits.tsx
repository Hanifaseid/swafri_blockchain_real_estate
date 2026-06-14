'use client';

import React from 'react';
import { Property } from '../types';
import { CheckCircle } from 'lucide-react';

interface PropertyAuditsProps {
  properties: Property[];
  adminRejectionNote: Record<string, string>;
  setAdminRejectionNote: (notes: Record<string, string>) => void;
  handleRejectProperty: (id: string) => void;
  handleApproveProperty: (id: string) => void;
  setProperties: (p: Property[]) => void;
  persistProperties: (p: Property[]) => void;
}

export default function PropertyAudits({
  properties,
  adminRejectionNote,
  setAdminRejectionNote,
  handleRejectProperty,
  handleApproveProperty,
  setProperties,
  persistProperties,
}: PropertyAuditsProps) {
  const pendingAudits = properties.filter((p) => p.status === 'SUBMITTED' || p.status === 'UNDER_REVIEW');

  return (
    <div className="space-y-6" id="property-audits-root">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs text-slate-500 font-mono">
        🛡️ <strong>Compliance Oversight Panel:</strong> Audit submitted property listings by inspecting supporting deeds and legal title documents. Approved properties mint a formal registration hash and display visible verified tags across public hubs.
      </div>

      {pendingAudits.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center text-slate-400 space-y-2" id="no-audits-message">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
          <p className="text-sm font-semibold">All submitted properties are fully audited.</p>
          <p className="text-xs">No pending audits located inside the system review pipeline.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6" id="pending-audits-grid">
          {pendingAudits.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between gap-6">
              
              {/* Structure particulars */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} className="w-24 h-24 rounded-xl object-cover border" />
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 tracking-wider">MOCK DEED ID: {item.id}</span>
                    <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">{item.location}</p>

                    <div className="flex items-center gap-2 mt-2 font-mono text-[9px] font-semibold uppercase">
                      <span className="bg-blue-50 text-blue-700 border px-2 py-0.5 rounded">Owner: {item.ownerName}</span>
                      <span className="bg-purple-50 text-purple-700 border px-2 py-0.5 rounded">Purpose: {item.purpose}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border rounded-xl space-y-2 text-xs font-mono">
                  <div className="font-bold uppercase text-slate-400 text-[10px] tracking-widest">Attached private credentials</div>
                  <div><strong>Corporate owner Deed files:</strong> {item.documentName || 'Zurich-Reg-Deed.pdf'}</div>
                  <div><strong>Title Price Particulars:</strong> ${item.tokenPrice} | Total keys supply: {item.totalTokens}</div>
                  <div><strong>Stated fractional APY Yield:</strong> +{item.apy}% APY</div>
                </div>
              </div>

              {/* Approval triggers */}
              <div className="w-full lg:w-80 border-slate-100 pl-0 lg:pl-6 border-t lg:border-t-0 lg:border-l flex flex-col justify-between gap-4 font-mono text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Rejection Reasoning feed (if rejecting)</label>
                  <textarea
                    value={adminRejectionNote[item.id] || ''}
                    onChange={(e) => setAdminRejectionNote({ ...adminRejectionNote, [item.id]: e.target.value })}
                    placeholder="Deed not verified or signature mismatch..."
                    className="w-full p-2 border rounded bg-slate-50 outline-none focus:border-red-500 text-xs h-20 font-mono"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRejectProperty(item.id)}
                    className="flex-1 bg-red-600 text-white font-bold py-3 rounded hover:bg-red-700 transition-colors uppercase whitespace-nowrap cursor-pointer text-xs font-mono"
                  >
                    Reject compliance
                  </button>
                  <button
                    onClick={() => handleApproveProperty(item.id)}
                    className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded hover:bg-emerald-700 transition-colors uppercase whitespace-nowrap cursor-pointer text-xs font-mono"
                  >
                    Approve & Publish Live
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ADMIN ASSET GLOBAL MANAGE SECTOR */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4" id="master-registry-status-tagger-box">
        <div className="border-b pb-3.5">
          <h3 className="text-sm font-bold text-slate-900 uppercase">Master Asset Registry Notice Tags & Status overrides</h3>
          <p className="text-[11px] text-slate-500 font-mono mt-1">
            Directly override or mutate listing statuses (e.g. mark as sold or review state) and specify prominent decorative ribbons.
          </p>
        </div>

        {properties.length === 0 ? (
          <p className="text-center py-6 text-xs text-slate-400 font-mono min-h-max">No registry listings created yet.</p>
        ) : (
          <div className="space-y-3.5">
            {properties.map((p) => (
              <div key={p.id} className="bg-slate-50 p-4 rounded-xl border border-slate-150 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-xs shadow-sm">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-lg border bg-slate-100" />
                  <div>
                    <strong className="text-slate-900 block font-sans text-xs">{p.name}</strong>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      ID: <span className="font-bold">{p.id.slice(0, 8)}...</span> | Currently: <span className="text-blue-600 font-bold">{p.status}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  {/* Status override dropdown */}
                  <div>
                    <span className="text-[9px] text-slate-400 block font-bold mb-0.5 uppercase">Mutate state GUID</span>
                    <select
                      value={p.status}
                      onChange={(e) => {
                        const updatedStatus = e.target.value as Property['status'];
                        const updatedProps = properties.map((orig): Property =>
                          orig.id === p.id ? { ...orig, status: updatedStatus } : orig
                        );
                        setProperties(updatedProps);
                        persistProperties(updatedProps);
                      }}
                      className="p-1 px-2 border rounded-lg bg-white outline-none w-36 font-semibold shadow-sm text-[11px] cursor-pointer"
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="SUBMITTED">SUBMITTED</option>
                      <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                      <option value="VERIFIED">VERIFIED</option>
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="SOLD">SOLD</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>

                  {/* Notice Tag input override */}
                  <div>
                    <span className="text-[9px] text-slate-400 block font-bold mb-0.5 uppercase">Decor ribbon label</span>
                    <input
                      type="text"
                      value={p.adminTag || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const updatedProps = properties.map((orig) =>
                          orig.id === p.id ? { ...orig, adminTag: val || undefined } : orig
                        );
                        setProperties(updatedProps);
                        persistProperties(updatedProps);
                      }}
                      placeholder="e.g. DEAL OF THE WEEK"
                      className="p-1 px-2 border rounded-lg bg-white outline-none w-44 shadow-sm text-[11px]"
                    />
                  </div>

                  {/* Quick Sold toggle button */}
                  <div className="self-end pt-3">
                    <button
                      onClick={() => {
                        const updatedStatus = (p.status === 'SOLD' ? 'PUBLISHED' : 'SOLD') as Property['status'];
                        const updatedProps = properties.map((orig): Property =>
                          orig.id === p.id ? { ...orig, status: updatedStatus } : orig
                        );
                        setProperties(updatedProps);
                        persistProperties(updatedProps);
                      }}
                      className={`p-1 px-3 rounded-lg font-bold border text-[10px] uppercase shadow-sm ${
                        p.status === 'SOLD'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      } hover:bg-opacity-80 transition cursor-pointer font-mono`}
                    >
                      {p.status === 'SOLD' ? 'Re-open Listing' : 'Toggle Sold Out'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
