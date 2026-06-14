'use client';

import React, { useState } from 'react';
import { Property, UserAccount } from '../types';
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Compass,
  MessageSquare,
  Sparkles,
  Calculator,
  Cpu,
  Zap,
  TrendingUp,
  Coins,
  ShieldCheck,
  CheckCircle,
  FileCheck2
} from 'lucide-react';

interface PropertyDetailProps {
  selectedProperty: Property;
  setActiveTab: (tab: string) => void;
  previousTab: string;
  buyAmount: number;
  setBuyAmount: (v: number) => void;
  handleBuyInvestment: (p: Property) => void;
  mockTxnStatus: 'none' | 'mining' | 'success';
  inquiryMsg: string;
  setInquiryMsg: (s: string) => void;
  submitInquiry: (e: React.FormEvent) => void;
  listerChats: { id: string; propertyId: string; sender: string; text: string; time: string }[];
  chatInput: string;
  setChatInput: (s: string) => void;
  persistListerChats: (chats: any[]) => void;
}

export default function PropertyDetail({
  selectedProperty,
  setActiveTab,
  previousTab,
  buyAmount,
  setBuyAmount,
  handleBuyInvestment,
  mockTxnStatus,
  inquiryMsg,
  setInquiryMsg,
  submitInquiry,
  listerChats,
  chatInput,
  setChatInput,
  persistListerChats,
}: PropertyDetailProps) {
  const [holdingPeriod, setHoldingPeriod] = useState<number>(5);
  const [appreciationRate, setAppreciationRate] = useState<number>(5);
  const [showLedgerProof, setShowLedgerProof] = useState<boolean>(false);
  const [downloadingCert, setDownloadingCert] = useState<boolean>(false);

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* Back Button and alert state tags */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border shadow-sm" id="detail-header-wrapper">
        <button
          onClick={() => {
            setActiveTab(previousTab);
          }}
          className="flex items-center gap-2 text-xs font-mono font-bold text-slate-700 hover:text-blue-600 border px-4 py-2 rounded-xl bg-white shadow-sm transition-all uppercase cursor-pointer"
          id="detail-back-button"
        >
          <ArrowLeft className="w-4 h-4 text-blue-600" />
          <span>Return to {previousTab.replace('_', ' ').toUpperCase()}</span>
        </button>

        {/* HIGH CONTRAST PROMINENT STATUS OVERWRITES / FLAGS */}
        <div className="flex flex-wrap gap-2 items-center font-mono text-[10px]" id="asset-compliance-wrapper">
          <span className="text-slate-400 font-semibold">ASSET COMPLIANCE:</span>
          <span className={`px-3 py-1 font-bold rounded-lg border uppercase tracking-wider ${
            selectedProperty.status === 'PUBLISHED' || selectedProperty.status === 'VERIFIED'
              ? 'bg-emerald-500 text-white border-emerald-600 animate-pulse'
              : selectedProperty.status === 'SOLD'
              ? 'bg-red-600 text-white border-red-700 font-black'
              : selectedProperty.status === 'UNDER_REVIEW'
              ? 'bg-amber-500 text-white border-amber-600'
              : 'bg-slate-600 text-white border-slate-700'
          }`}>
            {selectedProperty.status === 'PUBLISHED' || selectedProperty.status === 'VERIFIED' ? '● LIVE ACTIVE ASSET' : `● ${selectedProperty.status.replace('_', ' ')}`}
          </span>

          {/* ADMIN SPECIAL NOTIFICATION LABEL */}
          {selectedProperty.adminTag && (
            <span className="bg-orange-500 text-white font-black px-3 py-1 rounded-lg uppercase tracking-widest border border-orange-600 animate-bounce">
              ★ {selectedProperty.adminTag}
            </span>
          )}
        </div>
      </div>

      {/* TWO COLUMN GRID HEADER AND ADDITIONAL GALLERY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="detail-two-col-grid">
        
        {/* Visual Images Media Core */}
        <div className="lg:col-span-2 space-y-4">
          {/* Master showcase banner image */}
          <div className="relative h-[480px] bg-slate-100 rounded-3xl overflow-hidden border shadow-lg group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedProperty.image}
              alt={selectedProperty.name}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
              <span className="text-xs font-mono font-bold bg-blue-600 text-white px-3 py-1.5 rounded-full uppercase tracking-wider w-max mb-3">
                {selectedProperty.purpose.replace('FOR_', '').replace('_', ' ')} / {selectedProperty.type}
              </span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight leading-none drop-shadow-md">
                {selectedProperty.name}
              </h2>
              <p className="text-sm text-slate-300 font-mono mt-2 flex items-center gap-1.5 font-bold">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>{selectedProperty.location}</span>
              </p>
            </div>
          </div>

          {/* Multi-Photo Media Carousel/Grid: Additional Images of the Property! */}
          <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-3.5">
            <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">
              ADDITIONAL LEDGER PHOTO EVIDENCE ({selectedProperty.additionalImages?.length || 3} IMAGES)
            </h4>
            <div className="grid grid-cols-3 gap-3.5">
              {(selectedProperty.additionalImages && selectedProperty.additionalImages.length > 0
                ? selectedProperty.additionalImages
                : [
                    `https://picsum.photos/seed/${selectedProperty.id}_room1/600/400`,
                    `https://picsum.photos/seed/${selectedProperty.id}_room2/600/400`,
                    `https://picsum.photos/seed/${selectedProperty.id}_room3/600/400`,
                  ]
              ).map((imgUrl, i) => (
                <div key={i} className="relative h-28 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 group cursor-pointer shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt={`Structural Room ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-mono text-white text-[9px] font-bold">
                    VIEW PROOF
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Description and Covenants information */}
          <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 border-b pb-3 uppercase tracking-tight">
                Asset Narrative & Specifications
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-4 font-normal font-sans whitespace-pre-wrap">
                {selectedProperty.description ||
                  'This beautiful architecture represents premier sovereign tokenized real property holdings verification hashes linked on system ledger. It complies fully with Zurich Property Guidelines and on-chain title covenants.'}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-t pt-6 text-slate-700">
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 shadow-sm">
                <span className="text-[9px] text-slate-400 font-mono block uppercase">Token Valuation</span>
                <strong className="text-sm text-slate-900 font-mono block mt-1">${selectedProperty.tokenPrice} USD</strong>
              </div>
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 shadow-sm">
                <span className="text-[9px] text-slate-400 font-mono block uppercase">Vex continuous APY</span>
                <strong className="text-sm text-emerald-600 font-mono block mt-1">+{selectedProperty.apy}%</strong>
              </div>
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 shadow-sm">
                <span className="text-[9px] text-slate-400 font-mono block uppercase">Bedrooms & Baths</span>
                <strong className="text-sm text-slate-900 font-mono block mt-1">
                  {selectedProperty.bedrooms !== undefined ? `${selectedProperty.bedrooms} Bed / ${selectedProperty.bathrooms} Bath` : '2 Bed / 2 Bath'}
                </strong>
              </div>
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 shadow-sm">
                <span className="text-[9px] text-slate-400 font-mono block uppercase">Certified Dimensions</span>
                <strong className="text-sm text-blue-600 font-mono block mt-1">{selectedProperty.sizeSqFt || 1200} SQFT</strong>
              </div>
            </div>

            <div className="bg-slate-50 border rounded-2xl p-5 space-y-4 font-mono text-[11px] text-slate-600">
              <div className="flex items-center justify-between font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b pb-2">
                <div className="flex items-center gap-1.5 text-blue-600">
                  <Briefcase className="w-4 h-4" />
                  <span>Tokenized Smart-Legal Securities details</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLedgerProof(!showLedgerProof)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-all uppercase font-bold text-[9px]"
                >
                  {showLedgerProof ? 'HIDE LEDGER PROOF' : 'VERIFY CRYPTOGRAPHIC PROOF'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-slate-600">
                <div><strong>Title deed Document:</strong> <span className="text-slate-900 underline decoration-slate-400">{selectedProperty.documentName || 'Zurich-Reg-Deed.pdf'}</span></div>
                <div><strong>Verification status ID:</strong> <span className="text-emerald-600 font-bold">{selectedProperty.certificateId || 'VEX-CERT-810A'}</span></div>
                <div className="md:col-span-2 truncate"><strong>Deed SHA-256 Hash:</strong> <span className="text-slate-900 bg-slate-100 px-1 py-0.5 rounded font-bold">{selectedProperty.blockchainHash || '3cfa08d92be80a71be907ef30cde8fcda7eefa430bb918afbc90efadecee81'}</span></div>
              </div>

              {/* Collapsible live metadata proof details */}
              {showLedgerProof && (
                <div className="mt-4 p-4 bg-slate-900 text-emerald-400 rounded-xl space-y-3.5 border border-slate-800 animate-slide-up">
                  <div className="flex items-center justify-between text-[8px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1.5">
                    <span>Cryptographic Block State Proof</span>
                    <span className="text-emerald-500">Node Status: CONSENSUS_OK</span>
                  </div>

                  <div className="space-y-2 text-[10px] leading-relaxed">
                    <div>
                      <strong className="text-slate-400 block uppercase text-[8px]">Multisig Witness Signatories:</strong>
                      <span className="text-slate-100 font-bold block">1. Node Zurich Principal (0x74a...fbc3) - SIGNED</span>
                      <span className="text-slate-100 font-bold block">2. Custodian Registrar Gate (0xfa8...29fa) - SIGNED</span>
                      <span className="text-slate-100 font-bold block">3. VEX Auditing Witness (0x911...de51) - SIGNED</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] pt-1.5">
                      <div><span className="text-slate-400 uppercase text-[8px] block">Block Height:</span> <strong className="text-slate-100">#294,845</strong></div>
                      <div><span className="text-slate-400 uppercase text-[8px] block">Mint Timestamp:</span> <strong className="text-slate-100">2026-06-13 14:15:22 UTC</strong></div>
                      <div><span className="text-slate-400 uppercase text-[8px] block">Gas limit allocated:</span> <strong className="text-slate-100">95,821 Gwei</strong></div>
                      <div><span className="text-slate-400 uppercase text-[8px] block">Validation Code:</span> <strong className="text-slate-100">COSE-ED25519-SIG-OK</strong></div>
                    </div>

                    <div className="border-t border-slate-800 pt-2">
                      <strong className="text-slate-400 block uppercase text-[8px] mb-1">State Transition Timeline:</strong>
                      <div className="space-y-1.5 pl-2 text-slate-300">
                        <div>📌 14:12:05 - Deed parameters published to local memory-pool.</div>
                        <div>📌 14:14:10 - SHA-256 contract integrity checked and approved.</div>
                        <div>📌 14:15:22 - State transitions confirmed by Oracle. Block annexed.</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Legal Disclaimer */}
              <p className="text-[9px] text-slate-400 font-normal leading-relaxed border-t pt-2 max-w-none">
                Disclaimer: Information represents verifiable blockchain registries records secured by VEX Custody nodes and is intended for prototyping demonstration. It does not replace official federal land administration registry titles.
              </p>
            </div>

            {/* ERC-1155 METALLIC GOLD DIGITAL TITLE CERTIFICATE */}
            <div className="bg-linear-to-b from-slate-900 to-slate-950 border-2 border-amber-400 p-6 rounded-3xl relative text-slate-100 tracking-wide shadow-2xl overflow-hidden mt-6 animate-fade-in text-left">
              
              {/* Inner glowing effect */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200" />
              <div className="absolute -right-20 -bottom-20 w-48 h-48 rounded-full bg-yellow-500/10 blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-400/20 pb-4">
                <div>
                  <span className="text-[8px] font-mono tracking-widest text-amber-400 font-black block uppercase select-none">Sovereign Property Smart Lease Certificate</span>
                  <h4 className="text-sm font-serif font-bold text-white uppercase tracking-wider mt-0.5">{selectedProperty.name}</h4>
                  <p className="text-[9px] font-mono text-slate-400">Class: ERC-1155 Tokenized Real Estate Deed Security</p>
                </div>
                
                {/* SVG Mock QR Code */}
                <div className="w-14 h-14 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center shadow-lg border border-amber-400">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
                    <rect x="0" y="0" width="30" height="30" />
                    <rect x="0" y="70" width="30" height="30" />
                    <rect x="70" y="0" width="30" height="30" />
                    <rect x="10" y="10" width="10" height="10" fill="white" />
                    <rect x="10" y="80" width="10" height="10" fill="white" />
                    <rect x="80" y="10" width="10" height="10" fill="white" />
                    <rect x="40" y="40" width="20" height="20" />
                    <rect x="45" y="45" width="10" height="10" fill="white" />
                    <rect x="40" y="10" width="10" height="20" />
                    <rect x="80" y="40" width="15" height="10" />
                    <rect x="55" y="80" width="25" height="15" />
                    <rect x="0" y="45" width="25" height="10" />
                  </svg>
                </div>
              </div>

              {/* Certificate content rows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4.5 font-mono text-[10px] text-slate-350">
                <div className="space-y-1">
                  <div>Certificate Ref ID: <strong className="text-amber-400">{selectedProperty.certificateId || 'VEX-CERT-0199'}</strong></div>
                  <div>Sovereign Owner: <strong className="text-white font-sans">{selectedProperty.ownerName}</strong></div>
                  <div className="truncate">Active Wallet Link: <strong className="text-slate-250">0x8f3c7e8a93b4512e737c1d1a8e932efea34c892b</strong></div>
                </div>

                <div className="space-y-1 md:text-right">
                  <div>Verification Timestamp: <strong className="text-white">2026-06-13 14:15:22 UTC</strong></div>
                  <div>Mint Key Price: <strong className="text-emerald-400">${selectedProperty.tokenPrice} USD</strong></div>
                  <div className="truncate">Consensus Anchor: <strong className="text-slate-300">0x3cfa...cee81</strong></div>
                </div>
              </div>

              {/* Download simulated Certificate */}
              <div className="border-t border-amber-400/20 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-mono uppercase font-bold text-emerald-400">VERIFIABLE DIGITAL TITLE DEED ISSUED</span>
                </div>

                <button
                  onClick={() => {
                    setDownloadingCert(true);
                    setTimeout(() => {
                      setDownloadingCert(false);
                      alert(`[Sovereign Certificate Download Complete]: Certificate metadata successfully packaged as VEX-TITLE-${selectedProperty.id.toUpperCase()}.json`);
                    }, 1200);
                  }}
                  disabled={downloadingCert}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-mono text-[9px] font-black px-3.5 py-2 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 uppercase tracking-wide shadow-md"
                >
                  {downloadingCert ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>PACKAGING DEED...</span>
                    </>
                  ) : (
                    <span>DOWNLOAD ERC-1155 TITLE CERTIFICATE</span>
                  )}
                </button>
              </div>

            </div>
          </div>

          {/* INTERACTIVE VALUE INVESTMENT CALCULATOR */}
          <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b pb-3.5">
              <Calculator className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Interactive ROI Yield Estimator</h3>
                <p className="text-[10px] text-slate-400 font-mono text-left">Forecast continuous rent distributions & growth</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-500">Holding Period:</span>
                    <span className="text-blue-600">{holdingPeriod} Years</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={holdingPeriod}
                    onChange={(e) => setHoldingPeriod(Number(e.target.value))}
                    className="w-full text-blue-600 accent-blue-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-500">Estimated Appreciation Rate:</span>
                    <span className="text-blue-600">+{appreciationRate}% / yr</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={appreciationRate}
                    onChange={(e) => setAppreciationRate(Number(e.target.value))}
                    className="w-full text-blue-600 accent-blue-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b pb-1">Yield Projections</span>
                
                <div className="space-y-2 text-slate-600 text-[11px]">
                  <div className="flex justify-between">
                    <span>Initial Share buy value:</span>
                    <strong>${(buyAmount * selectedProperty.tokenPrice).toLocaleString()} USD</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Apy Rent yield return (annual):</span>
                    <strong className="text-emerald-600">+${((buyAmount * selectedProperty.tokenPrice) * (selectedProperty.apy / 100)).toFixed(0)} USD</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Cumulative Rent Dividends ({holdingPeriod} yr):</span>
                    <strong className="text-emerald-600">+${(((buyAmount * selectedProperty.tokenPrice) * (selectedProperty.apy / 100)) * holdingPeriod).toFixed(0)} USD</strong>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span>Est. Capital Growth:</span>
                    <strong className="text-blue-600">+${((buyAmount * selectedProperty.tokenPrice) * (Math.pow(1 + appreciationRate / 100, holdingPeriod) - 1)).toFixed(0)} USD</strong>
                  </div>
                  <div className="flex justify-between font-bold text-xs pt-0.5 text-slate-900 font-sans">
                    <span>Total compounding value:</span>
                    <span>${((buyAmount * selectedProperty.tokenPrice) + (((buyAmount * selectedProperty.tokenPrice) * (selectedProperty.apy / 100)) * holdingPeriod) + ((buyAmount * selectedProperty.tokenPrice) * (Math.pow(1 + appreciationRate / 100, holdingPeriod) - 1))).toFixed(0)} USD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC SMART ENERGY IoT SENSORS METRICS */}
          <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4 font-mono">
            <div className="flex items-center gap-2 border-b pb-3">
              <Cpu className="w-5 h-5 text-emerald-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Active IoT Utility Readings</h3>
                <p className="text-[10px] text-slate-400">Continuous telemetry parameters locked on physical asset</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3">
                <span className="text-[8px] text-slate-400 uppercase block tracking-wider">HVAC Efficiency</span>
                <span className="text-xs font-bold text-emerald-600 block mt-1 flex items-center justify-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-500 animate-bounce" /> 98.4%
                </span>
              </div>
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3">
                <span className="text-[8px] text-slate-400 uppercase block tracking-wider">Water Flow Rate</span>
                <span className="text-xs font-bold text-blue-600 block mt-1">2.4 L / m</span>
              </div>
              <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-3">
                <span className="text-[8px] text-slate-400 uppercase block tracking-wider">CO2 Offset</span>
                <span className="text-xs font-bold text-purple-600 block mt-1">14.8 kg/hr</span>
              </div>
              <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3">
                <span className="text-[8px] text-slate-400 uppercase block tracking-wider">Smart Grid Draw</span>
                <span className="text-xs font-bold text-amber-500 block mt-1">0.82 kW</span>
              </div>
            </div>
          </div>

          {/* Real Geolocation mapping */}
          <div className="bg-white rounded-3xl border p-6 shadow-sm space-y-4 font-mono">
            <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">
              REAL INTERACTIVE GEOLOCATION MAP
            </h3>
            <div className="relative h-80 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedProperty.location)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
              <span>Coordinates lookup: Auto-generated from {selectedProperty.location}</span>
              <span>Map Provider: Google Maps API Embedded Layer</span>
            </div>
          </div>
        </div>

        {/* Sidebar Controls and Direct Chat lister interaction */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* TRANSACTION OPERATIONS / KEYS SLIDERS */}
          {selectedProperty.status !== 'SOLD' && (
            <div className="bg-white p-6 rounded-3xl border shadow-md space-y-5">
              <div className="border-b pb-3 flex items-center justify-between">
                <h4 className="text-sm font-bold font-mono text-slate-900 uppercase">LEDGER INVESTMENT SUITE</h4>
                <span className="text-[10px] font-mono bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-200">
                  Available: {selectedProperty.tokensAvailable} / {selectedProperty.totalTokens} Keys
                </span>
              </div>

              {/* Buy Simulator for users */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">Select Keys volume:</span>
                  <span className="text-xs font-bold font-mono text-slate-900">{buyAmount} Shares</span>
                </div>

                <input
                  type="range"
                  min="1"
                  max={Math.max(1, Math.min(100, selectedProperty.tokensAvailable))}
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full text-blue-600 accent-blue-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                />

                <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-mono border-t pt-3.5">
                  <div className="bg-slate-50 p-2 border rounded-xl">
                    <span className="text-[9px] text-slate-400 block font-mono">KEY VAL</span>
                    <strong>${selectedProperty.tokenPrice} USD</strong>
                  </div>
                  <div className="bg-slate-50 p-2 border rounded-xl">
                    <span className="text-[9px] text-slate-400 block font-mono">TOTAL VAL</span>
                    <strong>${buyAmount * selectedProperty.tokenPrice} USD</strong>
                  </div>
                </div>

                <button
                  onClick={() => handleBuyInvestment(selectedProperty)}
                  disabled={mockTxnStatus === 'mining'}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold tracking-widest uppercase py-3.5 rounded-xl text-xs transition duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow"
                  id="mint-fractional-shares-btn"
                >
                  {mockTxnStatus === 'mining' ? (
                    <>
                      <Compass className="w-4 h-4 animate-spin text-yellow-300" />
                      <span>BROADCASTING CONTRACT...</span>
                    </>
                  ) : (
                    <span>MINT FRACTIONAL SHARES</span>
                  )}
                </button>
              </div>

              {/* Rental Enquiry form */}
              <form onSubmit={submitInquiry} className="space-y-3.5 border-t pt-5 font-mono" id="tenant-lease-covenant-form">
                <div className="flex items-center justify-between">
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tenant lease request</h5>
                  <span className="text-[9px] text-emerald-600 font-mono font-bold">continuous validation</span>
                </div>

                <textarea
                  required
                  value={inquiryMsg}
                  onChange={(e) => setInquiryMsg(e.target.value)}
                  placeholder="Introduce yourself, your credit parameter limits or lease term request..."
                  className="w-full p-2.5 border rounded-xl bg-slate-50 text-[11px] focus:bg-white h-20 outline-none focus:border-blue-500 font-mono placeholder:text-slate-400"
                />

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-950 text-white font-mono font-bold py-2.5 rounded-xl text-[11px] uppercase tracking-widest transition duration-205 cursor-pointer shadow"
                >
                  DISPATCH LEASE COVENANT
                </button>
              </form>
            </div>
          )}

          {selectedProperty.status === 'SOLD' && (
            <div className="bg-red-50 border border-red-200 p-6 rounded-3xl text-center space-y-3 shadow-sm" id="asset-sold-notice">
              <Sparkles className="w-8 h-8 text-red-500 mx-auto" />
              <h4 className="text-sm font-bold font-mono text-red-800 uppercase">ASSET COMPLETED (SOLD OUT)</h4>
              <p className="text-[11px] text-red-600 leading-relaxed font-mono">
                All equity keys for this real estate token have been successfully cleared and claimed. Verification signatures locked.
              </p>
            </div>
          )}

          {/* LISTER / OWNER CONTACT DETAILS SUMMARY */}
          <div className="bg-white p-5 rounded-3xl border shadow-sm space-y-4" id="lister-owner-summary">
            <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest border-b pb-2">
              Lister Credentials & Contact
            </h4>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 font-mono text-xs uppercase border">
                {selectedProperty.ownerName?.slice(0, 2) || 'LO'}
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">{selectedProperty.ownerName}</h5>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-tight">Sovereign Asset Lister</p>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-600 space-y-2 pt-1 border-t">
              <div className="flex justify-between">
                <span>Direct Communication:</span>
                <span className="text-slate-900 font-bold underline">lister_{selectedProperty.id || 'owner'}.vex@ledger.swiss</span>
              </div>
              <div className="flex justify-between">
                <span>Compliance status:</span>
                <span className="text-emerald-600 font-bold">VERIFIED COVENANT LISTER</span>
              </div>
              <div className="flex justify-between">
                <span>Associated account key:</span>
                <span className="text-slate-800 font-semibold text-[10px] truncate max-w-[120px]">0x{selectedProperty.ownerId || 'SYS-STAKE'}</span>
              </div>
            </div>
          </div>

          {/* DIRECT LANDLORD/LISTER CHAT NODE */}
          <div className="bg-white rounded-3xl border shadow-md overflow-hidden flex flex-col h-[400px]" id="lister-chat-node">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <div>
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wide">Direct Lister messaging Link</h4>
                  <span className="text-[8px] text-slate-400 flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active chat session
                  </span>
                </div>
              </div>
            </div>

            {/* Chat Bubble timeline */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-[11px]" id="chat-messages-container">
              {listerChats.filter((c) => c.propertyId === selectedProperty.id).length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center text-slate-400 p-4 space-y-1 font-mono">
                  <MessageSquare className="w-8 h-8 text-slate-300" />
                  <p className="text-[10px] font-bold uppercase">No message transcripts logged</p>
                  <p className="text-[9px] text-slate-405 leading-relaxed">Initiate a live session to negotiate key pricing details, escrow structures, or utility compliance.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {listerChats
                    .filter((c) => c.propertyId === selectedProperty.id)
                    .map((msg) => {
                      const isSelf = msg.sender === 'Buyer';
                      return (
                        <div key={msg.id} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                          <div className="text-[8px] font-mono text-slate-400 uppercase mb-0.5">{msg.sender} • {msg.time}</div>
                          <div className={`p-2.5 rounded-2xl max-w-[85%] leading-relaxed ${
                            isSelf ? 'bg-blue-600 text-white rounded-tr-none shadow' : 'bg-white text-slate-800 border rounded-tl-none shadow-sm'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Chat Input panel */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!chatInput.trim()) return;

                const userMsgText = chatInput.trim();
                const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                const newUserMsg = {
                  id: Math.random().toString(),
                  propertyId: selectedProperty.id,
                  sender: 'Buyer',
                  text: userMsgText,
                  time: timestamp,
                };

                const updatedChats = [...listerChats, newUserMsg];
                persistListerChats(updatedChats);
                setChatInput('');

                // Automated Reply generator!
                setTimeout(() => {
                  let responseText = '';
                  const text = userMsgText.toLowerCase();

                  if (text.includes('price') || text.includes('valuation') || text.includes('cost') || text.includes('usd')) {
                    responseText = `Greetings! Thank you for the question. The fractional equity valuation is validated strictly at $${selectedProperty.tokenPrice} USD per share. Under blockchain consensus rules, pricing cannot display variance without a legal multi-sig consensus proposal.`;
                  } else if (text.includes('rent') || text.includes('lease') || text.includes('apply')) {
                    responseText = `Superb inquiry! I review structural applications instantly. Yes, please proceed to fill and dispatch the inquiry lease covenant. It initializes the on-chain KYC lock instantly!`;
                  } else if (text.includes('blockchain') || text.includes('contract') || text.includes('hash')) {
                    responseText = `Fully certified! The underlying deed structure resides on our system protocol with public key ${selectedProperty.blockchainHash || 'VEX-CERT-0199'}. Verify consensus metrics natively anytime.`;
                  } else {
                    responseText = `Welcome to the ${selectedProperty.name} detailed messaging link. We confirm that all legal title parameters are fully tokenized and registered. Ready to sign escrow guidelines as soon as you mint shares! Let me know if you would like me to compile a draft escrow contract context.`;
                  }

                  const newListerMsg = {
                    id: Math.random().toString(),
                    propertyId: selectedProperty.id,
                    sender: selectedProperty.ownerName,
                    text: responseText,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  };

                  persistListerChats([...updatedChats, newListerMsg]);
                }, 1200);
              }}
              className="p-3 bg-white border-t flex gap-2 font-mono shrink-0"
              id="lister-chat-input-form"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type message parameters..."
                className="flex-1 px-3 py-2 border rounded-xl bg-slate-50 text-[11px] outline-none focus:border-blue-500 font-mono"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 px-3.5 rounded-xl text-[11px] uppercase transition cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
