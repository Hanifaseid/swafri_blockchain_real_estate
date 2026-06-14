'use client';

import React, { useState } from 'react';
import { UserAccount } from '../types';
import { 
  ShieldAlert, 
  Clock, 
  CheckCircle,
  FileText,
  Camera,
  ChevronRight,
  Lock,
  Wallet,
  X,
  RefreshCw,
  Building2,
  LockKeyhole
} from 'lucide-react';

interface OwnerKycProps {
  currentUser: UserAccount | null;
  triggerSelfKycSubmit: () => void;
  handleConnectWalletSim: () => void;
}

export default function OwnerKyc({
  currentUser,
  triggerSelfKycSubmit,
  handleConnectWalletSim,
}: OwnerKycProps) {
  const [wizardActive, setWizardActive] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  
  // State variables for inputs
  const [businessName, setBusinessName] = useState<string>('Alpine Covenants AG');
  const [registryNumber, setRegistryNumber] = useState<string>('CHE-109.914.805');
  const [corporateEmail, setCorporateEmail] = useState<string>(currentUser?.email || '');
  const [foundingYear, setFoundingYear] = useState<number>(2018);
  const [deedDocumentSelected, setDeedDocumentSelected] = useState<string>('');
  const [deedDocCode, setDeedDocCode] = useState<string>('REF-ZH-7751');

  // Wallet signature access
  const [walletModal, setWalletModal] = useState<boolean>(false);
  const [signing, setSigning] = useState<boolean>(false);

  const startSubmit = () => {
    triggerSelfKycSubmit();
    setWizardActive(false);
    setStep(1);
  };

  const handleSignConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setSigning(true);
    setTimeout(() => {
      handleConnectWalletSim();
      setSigning(false);
      setWalletModal(false);
    }, 1200);
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6 max-w-3xl text-left" id="owner-kyc-root">
      
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        
        <div className="border-b pb-4">
          <h2 className="text-base font-bold text-slate-905 flex items-center gap-2 text-slate-900 uppercase">
            <ShieldAlert className="w-5 h-5 text-purple-600" />
            <span>Real Estate Corporate Onboarding Hub</span>
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Ensure company entities match the Swiss land registry regulatory compliance guidelines.
          </p>
        </div>

        {/* Status columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border bg-slate-50 flex items-center justify-between font-mono text-xs">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Registry Compliance Status</span>
              <span className={`text-xs font-bold block mt-1.5 ${
                currentUser.kycStatus === 'APPROVED' ? 'text-emerald-600' : currentUser.kycStatus === 'PENDING' ? 'text-amber-500 animate-pulse' : 'text-slate-600'
              }`}>
                {currentUser.kycStatus === 'APPROVED' ? '✓ APPROVED TRUSTEE' : currentUser.kycStatus === 'PENDING' ? '⏳ DEED IN REVIEW' : '✕ VERIFICATION NEEDED'}
              </span>
            </div>
            
            <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold border ${
              currentUser.kycStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : currentUser.kycStatus === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' : 'bg-slate-100'
            }`}>
              {currentUser.kycStatus}
            </span>
          </div>

          <div className="p-4 rounded-2xl border bg-slate-50 flex items-center justify-between font-mono text-xs">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Payout Multi-Sig Connection</span>
              <span className={`text-xs font-bold block mt-1.5 ${
                currentUser.walletStatus === 'VERIFIED' ? 'text-emerald-600' : 'text-slate-600'
              }`}>
                {currentUser.walletStatus === 'VERIFIED' ? '● KEY REGISTERED' : '✕ NO LINKED PORT'}
              </span>
            </div>
            
            <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold border ${
              currentUser.walletStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {currentUser.walletStatus === 'VERIFIED' ? 'ANCHORED' : 'UNASSIGNED'}
            </span>
          </div>
        </div>

        {/* Action columns cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Section A: Company Registry Uploads */}
          <div className="border p-5 rounded-2xl bg-white space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Section 1. Company Registry Document</span>
              <p className="text-xs text-slate-500 leading-relaxed font-sans font-normal">
                Sovereign real estate rules declare all property listing corporations verify legitimate company articles and corporate entity registries.
              </p>
            </div>

            <div className="pt-2 text-xs space-y-2 font-mono">
              {currentUser.kycStatus === 'NOT_STARTED' && (
                <button
                  type="button"
                  onClick={() => setWizardActive(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold py-3 rounded-xl text-[10px] uppercase tracking-wider transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Submit Entity Dossier</span>
                </button>
              )}

              {currentUser.kycStatus === 'PENDING' && (
                <div className="text-[10px] text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200 leading-relaxed space-y-1">
                  <div className="flex items-center gap-1 font-bold">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>AUDITING COMPLIANCE DOSSIER</span>
                  </div>
                  <div>Corporate legal forms and SHA-256 deed blocks awaiting administrative clears. Bypass is active under Admin portal dashboards.</div>
                </div>
              )}

              {currentUser.kycStatus === 'APPROVED' && (
                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-[10px] leading-relaxed">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  <div>
                    <div className="font-bold">REGISTERED COMPLIANCY APPROVED</div>
                    <span className="text-[9px] text-emerald-600 font-normal">Company registry cleared for digital fractional asset minting.</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section B: Yield Payout Route Multi-sig key */}
          <div className="border p-5 rounded-2xl bg-white space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Section 2. Yield Settlement Multi-Sig Key</span>
              <p className="text-xs text-slate-500 leading-relaxed font-sans font-normal">
                Connect and witness register owner public address to receive automatic custody payouts in escrow and assign legal titles to properties.
              </p>
            </div>

            <div className="pt-2 text-xs space-y-2 font-mono">
              {currentUser.walletStatus !== 'VERIFIED' || !currentUser.linkedWalletAddress ? (
                <button
                  type="button"
                  onClick={() => setWalletModal(true)}
                  className="w-full bg-slate-900 hover:bg-slate-950 text-white font-mono font-bold py-3 rounded-xl text-[10px] uppercase tracking-wider transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span>Anchored Owner Signature Port</span>
                </button>
              ) : (
                <div className="text-[10px] bg-emerald-50 border border-emerald-200 text-slate-800 p-3 rounded-xl space-y-1.5 truncate">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                    <LockKeyhole className="w-4 h-4" />
                    <span>Secure Signatory Port Linked</span>
                  </div>
                  <div>Address: <strong className="text-slate-900 font-bold font-mono text-[9px]">{currentUser.linkedWalletAddress}</strong></div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* 1. MOCK CORPORATE COMPLIANCE WIZARD MODAL */}
      {wizardActive && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-mono text-xs">
          <div className="bg-white rounded-3xl border shadow-2xl p-6 max-w-md w-full space-y-5 text-left relative">
            
            <button 
              onClick={() => {
                setWizardActive(false);
                setStep(1);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-full bg-slate-50 p-1 border cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between border-b pb-3.5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase">Corporate Compliance Portal</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Asset tokenization pre-approvals scheduler</p>
              </div>
              <div className="text-[10px] font-mono bg-slate-50 p-1 px-3.5 rounded-lg border font-bold text-slate-500">
                Step {step} / 2
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest block">STEP 1: Company Profile Parameters</span>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Stated Legal Entity Name</label>
                    <input 
                      type="text" 
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">CHE Company Registry Number (CHE-xxx.xxx.xxx)</label>
                    <input 
                      type="text" 
                      value={registryNumber}
                      onChange={(e) => setRegistryNumber(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 font-semibold text-slate-800"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase font-bold">Corporate Contact Mail</label>
                      <input 
                        type="email" 
                        value={corporateEmail}
                        onChange={(e) => setCorporateEmail(e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase font-bold">Incorporation Year</label>
                      <input 
                        type="number" 
                        value={foundingYear}
                        onChange={(e) => setFoundingYear(Number(e.target.value))}
                        className="w-full text-xs p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-slate-905 bg-slate-900 hover:bg-slate-950 text-white font-mono font-bold py-3 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer text-[10px] uppercase font-bold tracking-wider"
                >
                  <span>Verify Stated Deeds</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest block">STEP 2: Deed Securities Uploads</span>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Registry Deed Reference ID</label>
                    <input 
                      type="text" 
                      value={deedDocCode}
                      onChange={(e) => setDeedDocCode(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Upload Switzerland Registry Deed (PDF)</label>
                    <div 
                      onClick={() => setDeedDocumentSelected('CHE_Zurich_Covenant_Deed_Signed.pdf')}
                      className="border border-dashed p-4 rounded-xl text-center bg-slate-50 space-y-2 relative cursor-pointer"
                    >
                      <FileText className="w-7 h-7 text-slate-400 mx-auto" />
                      {deedDocumentSelected ? (
                        <span className="text-[10px] text-emerald-600 block font-bold">✓ Uploaded: {deedDocumentSelected}</span>
                      ) : (
                        <span className="text-[9px] text-slate-400 block font-sans">Drag land register deed scan here or click to browse files</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 font-bold text-[10px]">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-slate-100 hover:bg-slate-205 border text-slate-700 py-3 rounded-xl uppercase transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!deedDocumentSelected) {
                        alert('Deed documentation scan simulation file required.');
                        return;
                      }
                      startSubmit();
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl uppercase transition cursor-pointer font-bold tracking-wide"
                  >
                    SUBMIT COVENANT DATA
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 2. MOCK CORP ACCESS GATEWAY SIGNATURE MODAL */}
      {walletModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-mono text-xs">
          <div className="bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl p-6 max-w-sm w-full space-y-4 text-left relative">
            <button 
              onClick={() => setWalletModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-350 rounded-full bg-slate-900 p-1 border border-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-500" />
                <span>Assign Trustee Multi-Sig Port</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Authorize corporate token allocations and mutables from your ledger signatory key.</p>
            </div>

            <form onSubmit={handleSignConfirm} className="space-y-4 text-xs select-none">
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2 font-mono text-[10px] text-slate-405 text-slate-400 leading-relaxed">
                <div>Client origin: <span className="text-white">https://vex.custody.gateway</span></div>
                <div>Secured Vault Target: <span className="text-emerald-400">Escrow Allocations Multi-Sig</span></div>
                <div>Hash Code: <span className="text-purple-400">ED25519-SOL-DEED-MUT</span></div>
                
                <div className="border-t border-slate-800 pt-2 text-slate-300">
                  <span className="block text-slate-400 text-[8px] uppercase font-bold mb-1">Covenant authorization message</span>
                  <code>"Authorize Alpine Covenants AG properties allocations. Validate witness nodes links on Geneva block height consensus, locking deed files SHA-256 signatures."</code>
                </div>
              </div>

              <div className="flex gap-2 font-bold text-[10px]">
                <button
                  type="button"
                  onClick={() => setWalletModal(false)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 py-3 rounded-xl uppercase transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={signing}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-slate-950 py-3 rounded-xl uppercase transition cursor-pointer font-black tracking-wide flex items-center justify-center gap-1.5"
                >
                  {signing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>CONFIRM MULTI-SIG</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
