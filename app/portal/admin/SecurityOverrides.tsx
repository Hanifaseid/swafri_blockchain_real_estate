'use client';

import React from 'react';
import { Sliders } from 'lucide-react';

export default function SecurityOverrides() {
  return (
    <div className="space-y-6 max-w-2xl" id="security-overrides-root">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 font-mono text-xs">
        <h3 className="text-base font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-rose-500" />
          <span>Sovereign Security Overrides</span>
        </h3>
        <p className="text-[11px] text-slate-500">
          Allows physical deletion or fast-tracking properties draft, bypass KYC guidelines, and adjust treasury payouts directly without multi-sig locks.
        </p>

        <div className="border p-4 bg-slate-50 rounded-xl space-y-3" id="override-metrics">
          <div className="font-bold text-slate-800">System Overrides Parameters</div>
          <div className="flex justify-between items-center text-[11px] text-slate-600">
            <span>Base smart contract mint fee</span>
            <strong className="text-slate-900">0.05% USDC</strong>
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-600">
            <span>Multi-sig Threshold consensus</span>
            <strong className="text-slate-900">2 of 3 Partners</strong>
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-600">
            <span>Total tokenized volume backed on ERC-1155</span>
            <strong className="text-slate-900">$18,480,200.00 USD</strong>
          </div>
        </div>

        <button
          onClick={() => alert('Sovereign network keys successfully synchronization confirmed. All pools operate with 100% capacity.')}
          className="w-full bg-rose-600 text-white font-mono font-bold py-3 rounded-lg hover:bg-rose-700 transition cursor-pointer text-xs"
        >
          Force synch ledger parameters
        </button>
      </div>
    </div>
  );
}
