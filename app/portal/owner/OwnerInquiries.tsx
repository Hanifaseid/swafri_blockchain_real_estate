'use client';

import React from 'react';
import { Property, Inquiry, UserAccount } from '../types';
import { FileText } from 'lucide-react';

interface OwnerInquiriesProps {
  inquiries: Inquiry[];
  properties: Property[];
  currentUser: UserAccount | null;
  markInquiryResponded: (id: string) => void;
  closeInquiry: (id: string) => void;
}

export default function OwnerInquiries({
  inquiries,
  properties,
  currentUser,
  markInquiryResponded,
  closeInquiry,
}: OwnerInquiriesProps) {
  const usersInquiries = currentUser 
    ? inquiries.filter((i) => properties.find((p) => p.id === i.propertyId)?.ownerId === currentUser.id)
    : [];

  return (
    <div className="space-y-6" id="owner-inquiries-root">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">Direct Tenant Inquiries inbox</h3>
        
        {usersInquiries.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2" id="no-inquiries-mailbox">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold">No inquiries received from fractional tenants yet.</p>
            <p className="text-xs">Once active tenants submit inquiries on your property markers, they populate here.</p>
          </div>
        ) : (
          <div className="space-y-4" id="inquiries-list">
            {usersInquiries.map((item) => (
              <div key={item.id} className="border p-5 rounded-xl bg-slate-50 relative">
                <span className="absolute top-4 right-4 text-[10px] font-mono text-slate-400">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>

                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded font-bold uppercase">
                    {item.type} REQUEST
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    Property: {item.propertyName}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border rounded uppercase ${
                    item.status === 'NEW' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="mt-4 p-3 bg-white border rounded-xl text-xs text-slate-700 font-mono">
                  <strong>MESSAGE FROM TENANT:</strong> <br />
                  <p className="mt-2 text-slate-800 leading-relaxed italic">&quot;{item.message}&quot;</p>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t pt-4 text-xs font-mono">
                  <div className="text-slate-500">
                    <strong>Sender ID:</strong> {item.tenantName} ({item.tenantEmail}) <br />
                    <strong>Contact:</strong> {item.tenantPhone || 'None Provided'}
                  </div>

                  <div className="flex gap-2">
                    {item.status === 'NEW' && (
                      <button
                        onClick={() => markInquiryResponded(item.id)}
                        className="bg-blue-600 text-white font-bold px-3.5 py-2 rounded text-[11px] hover:bg-blue-700 transition-colors uppercase cursor-pointer"
                      >
                        Mark Responded
                      </button>
                    )}
                    {item.status !== 'CLOSED' && (
                      <button
                        onClick={() => closeInquiry(item.id)}
                        className="bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded text-[11px] hover:bg-slate-300 transition-colors uppercase cursor-pointer"
                      >
                        Close Inquiry
                      </button>
                    )}
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
