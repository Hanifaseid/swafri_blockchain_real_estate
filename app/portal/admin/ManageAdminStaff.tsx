'use client';

import React from 'react';
import { UserAccount } from '../types';
import { Plus } from 'lucide-react';

interface ManageAdminStaffProps {
  users: UserAccount[];
  newAdminName: string;
  setNewAdminName: (s: string) => void;
  newAdminEmail: string;
  setNewAdminEmail: (s: string) => void;
  newAdminPassword:  string;
  setNewAdminPassword: (s: string) => void;
  handleCreateAdminSubmit: (e: React.FormEvent) => void;
}

export default function ManageAdminStaff({
  users,
  newAdminName,
  setNewAdminName,
  newAdminEmail,
  setNewAdminEmail,
  newAdminPassword,
  setNewAdminPassword,
  handleCreateAdminSubmit,
}: ManageAdminStaffProps) {
  const privilegedStaff = users.filter((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN');

  return (
    <div className="space-y-6" id="manage-admin-staff-root">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Admin Creator form */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b pb-3 uppercase flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            <span>Assemble Admin Staff</span>
          </h3>
          <p className="text-[11px] text-slate-500 font-mono">
            Admins cannot register publicly. Only super-administrator accounts can deploy operating keys here.
          </p>

          <form onSubmit={handleCreateAdminSubmit} className="space-y-3 font-mono text-xs text-slate-600" id="admin-staff-creator-form">
            <div>
              <label className="block text-slate-400 mb-1 uppercase text-[10px]">Administrative full name</label>
              <input
                type="text"
                required
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                placeholder="e.g. Admiral Nelson"
                className="w-full p-2.5 border rounded bg-slate-50 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 uppercase text-[10px]">Secure email key (login link)</label>
              <input
                type="type" // let's use standard input type safely
                required
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="e.g. nelson@vex.estate"
                className="w-full p-2.5 border rounded bg-slate-50 outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 uppercase text-[10px]">Administrative password</label>
              <input
                type="password"
                required
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 border rounded bg-slate-50 outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-mono font-bold tracking-widest uppercase p-3 rounded-lg hover:bg-blue-700 text-[11px] transition duration-200 cursor-pointer"
            >
              Deploy Admin Staff Key
            </button>
          </form>
        </div>

        {/* ADMINISTRATORS LISTINGS */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm" id="privileged-staff-list">
          <h3 className="text-base font-bold text-slate-900 border-b pb-3 uppercase mb-4">Privileged Admins</h3>

          <div className="divide-y text-xs font-mono text-slate-705">
            {privilegedStaff.map((adm) => (
              <div key={adm.id} className="py-3 flex justify-between items-center">
                <div>
                  <strong className="text-slate-900">{adm.name}</strong> <br />
                  <span className="text-slate-400 mt-0.5 block">{adm.email}</span>
                </div>
                <span className="bg-blue-50 text-blue-700 border rounded py-0.5 px-2 text-[10px] uppercase font-bold">
                  {adm.role}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
