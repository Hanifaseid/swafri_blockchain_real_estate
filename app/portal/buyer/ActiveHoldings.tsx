'use client';

import React from 'react';
import { Property, UserAccount } from '../types';
import { Coins, ShieldCheck, Layers, ArrowRight } from 'lucide-react';

interface ActiveHoldingsProps {
  properties: Property[];
  currentUser: UserAccount | null;
  openPropertyDetail: (p: Property) => void;
}

export default function ActiveHoldings({
  properties,
  currentUser,
  openPropertyDetail,
}: ActiveHoldingsProps) {
  // Filter properties with simulated purchases
  const heldProperties = properties.filter((p) => p.tokensAvailable < p.totalTokens);

  // Compute stats
  const totalHeldVal = heldProperties.reduce((acc, curr) => {
    const purchased = curr.totalTokens - curr.tokensAvailable;
    return acc + (purchased * curr.tokenPrice);
  }, 0);

  const avgAPY = heldProperties.length > 0 
    ? (heldProperties.reduce((acc, curr) => acc + curr.apy, 0) / heldProperties.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6" id="active-holdings-root">
      {/* Ledger Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="holdings-stats-container">
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">TOTAL TOKENS SECURITIES VAL</span>
            <strong className="text-2xl font-bold font-mono tracking-tight block mt-1">${totalHeldVal.toLocaleString()} USD</strong>
          </div>
          <Coins className="w-8 h-8 text-yellow-500 shrink-0" />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">COMPOUND INTEREST FLOW</span>
            <strong className="text-2xl font-extrabold text-emerald-600 block mt-1">+{avgAPY}% APY</strong>
          </div>
          <span className="text-[11px] font-mono bg-emerald-50 text-emerald-600 font-bold px-2 py-1 rounded border border-emerald-200 uppercase">
            RENT ACCRUAL ACTIVE
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">CONNECTED WALLET ADDRESS</span>
            <strong className="text-xs font-mono text-slate-800 truncate block mt-2 max-w-[200px]">
              {currentUser?.linkedWalletAddress || '0x6e2a87c1d1a8e932efea34c892b'}
            </strong>
          </div>
          <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
        </div>
      </div>

      {heldProperties.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center text-slate-400 space-y-2.5" id="no-holdings-fallback">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm font-medium">No active continuous fractional shares logged.</p>
          <p className="text-xs">Mint fractional shares inside structural explorer to start receiving continuous rent streams.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="holdings-table-container">
          <div className="p-5 border-b">
            <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">
              Live Fractional Assets Ledger
            </h4>
          </div>

          <div className="overflow-x-auto text-xs font-mono text-slate-600">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider font-bold border-b">
                  <th className="p-4 pl-6">Tokenised Asset Code Name</th>
                  <th className="p-4">Location Coordinates</th>
                  <th className="p-4 text-center">My Keys Volume</th>
                  <th className="p-4 text-right">Secured Valuation</th>
                  <th className="p-4 text-center">System APY</th>
                  <th className="p-4 text-center">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-705">
                {heldProperties.map((p) => {
                  const purchasedShares = p.totalTokens - p.tokensAvailable;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-4 pl-6 font-bold text-slate-900">{p.name}</td>
                      <td className="p-4 text-slate-500">{p.location}</td>
                      <td className="p-4 text-center font-bold text-blue-600">{purchasedShares} / {p.totalTokens} Keys</td>
                      <td className="p-4 text-right font-bold text-slate-900">${(purchasedShares * p.tokenPrice).toLocaleString()} USD</td>
                      <td className="p-4 text-center text-emerald-600 font-bold">+{p.apy}%</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => openPropertyDetail(p)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-lg border text-[10px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1 mx-auto"
                        >
                          <span>LEDGER</span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
