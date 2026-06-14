'use client';

import React from 'react';
import { UserAccount } from '../types';

interface MasterUserRegistryProps {
  users: UserAccount[];
  toggleUserStatus: (id: string, currentStatus: string) => void;
}

const getRoleBadgeColor = (role: string) => {
  if (role === 'SUPER_ADMIN') return 'bg-rose-50 text-rose-700 border-rose-205';
  if (role === 'ADMIN') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (role === 'PROPERTY_OWNER') return 'bg-purple-50 text-purple-700 border-purple-200';
  return 'bg-amber-50 text-amber-700 border-amber-200';
};

export default function MasterUserRegistry({
  users,
  toggleUserStatus,
}: MasterUserRegistryProps) {
  return (
    <div className="space-y-6" id="master-user-registry-root">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="p-4 border-b border-slate-100 font-mono font-bold uppercase text-slate-500 bg-slate-50 text-xs">
          Global Registered System Users ({users.length})
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 uppercase text-[10px] text-slate-400 font-bold">
                <th className="p-3">User particulars</th>
                <th className="p-3">Role privilege</th>
                <th className="p-3 font-mono">Account status</th>
                <th className="p-3">KYC status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="p-3">
                    <strong className="text-slate-900 block font-sans text-xs">{item.name}</strong>
                    <span className="text-slate-400 font-normal text-[11px] block mt-0.5">{item.email}</span>
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full ${getRoleBadgeColor(item.role)}`}>
                      {item.role}
                    </span>
                  </td>
                  <td className="p-3 font-bold">
                    <span className={`text-[10px] px-2 py-0.5 rounded border uppercase ${
                      item.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700">
                    {item.kycStatus === 'APPROVED' ? 'Cleared' : item.kycStatus}
                  </td>
                  <td className="p-3 text-right">
                    {item.role !== 'SUPER_ADMIN' && (
                      <button
                        onClick={() => toggleUserStatus(item.id, item.status)}
                        className={`text-[11px] font-bold px-2 py-1 rounded border uppercase cursor-pointer ${
                          item.status === 'ACTIVE' ? 'border-rose-200 text-rose-600 hover:bg-rose-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {item.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
