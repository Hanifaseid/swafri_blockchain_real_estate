'use client';

import React, { useState } from 'react';
import { UserAccount } from '../types';
import { 
  User, 
  FileText, 
  CheckCircle, 
  Wallet, 
  AlertTriangle, 
  Camera, 
  ChevronRight, 
  Lock, 
  Compass, 
  X,
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';

interface TenantKycProps {
  currentUser: UserAccount | null;
  triggerSelfKycSubmit: () => void;
  triggerWalletRelayLink: () => void;
  unlinkWalletAddress: () => void;
}

export default function TenantKyc({
  currentUser,
  triggerSelfKycSubmit,
  triggerWalletRelayLink,
  unlinkWalletAddress,
}: TenantKycProps) {
  // Wizard state triggers
  const [kycWizardActive, setKycWizardActive] = useState<boolean>(false);
  const [kycStep, setKycStep] = useState<number>(1);
  
  // Wizard inputs state
  const [fullName, setFullName] = useState<string>(currentUser?.name || '');
  const [emailAddress, setEmailAddress] = useState<string>(currentUser?.email || '');
  const [phoneNumber, setPhoneNumber] = useState<string>('+41 44 200 48 91');
  const [physicalAddress, setPhysicalAddress] = useState<string>('Bahnhofstrasse 12, Zurich 8001');
  const [documentType, setDocumentType] = useState<'PASSPORT' | 'DRIVERS_LICENSE' | 'NATIONAL_ID'>('PASSPORT');
  const [documentIdCode, setDocumentIdCode] = useState<string>('CH-9812A88B');
  const [mockFileSelected, setMockFileSelected] = useState<string>('');
  const [biometricsScanning, setBiometricsScanning] = useState<boolean>(false);
  const [biometricsSuccess, setBiometricsSuccess] = useState<boolean>(false);

  // Wallet signature modal
  const [walletConnectModal, setWalletConnectModal] = useState<boolean>(false);
  const [signingProgress, setSigningProgress] = useState<boolean>(false);

  const startKycSubmission = () => {
    // Fire callback
    triggerSelfKycSubmit();
    setKycWizardActive(false);
    setKycStep(1);
    setBiometricsSuccess(false);
  };

  const handleWalletLinkSignatureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSigningProgress(true);
    setTimeout(() => {
      triggerWalletRelayLink();
      setSigningProgress(false);
      setWalletConnectModal(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-3xl text-left" id="tenant-kyc-root">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        
        <div className="border-b pb-4">
          <h2 className="text-base font-bold text-slate-900 uppercase">Tenant & Investor Compliance Center</h2>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Maintain on-chain identity records and secure private keys according to Swiss Land Registry AML protocols.
          </p>
        </div>

        {/* Dynamic status badges banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border bg-slate-50 flex items-center justify-between font-mono text-xs">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Passport Verification</span>
              <span className={`text-xs font-bold block mt-1.5 ${
                currentUser?.kycStatus === 'APPROVED' ? 'text-emerald-600' : currentUser?.kycStatus === 'PENDING' ? 'text-amber-500 animate-pulse' : 'text-slate-600'
              }`}>
                {currentUser?.kycStatus === 'APPROVED' ? '✓ APPROVED' : currentUser?.kycStatus === 'PENDING' ? '⏳ UNDER REVIEW' : '✕ NOT COMPLETED'}
              </span>
            </div>
            
            <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold border ${
              currentUser?.kycStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : currentUser?.kycStatus === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' : 'bg-slate-100'
            }`}>
              {currentUser?.kycStatus}
            </span>
          </div>

          <div className="p-4 rounded-2xl border bg-slate-50 flex items-center justify-between font-mono text-xs">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Private Wallet Link</span>
              <span className={`text-xs font-bold block mt-1.5 ${
                currentUser?.walletStatus === 'VERIFIED' ? 'text-emerald-600' : 'text-slate-600'
              }`}>
                {currentUser?.walletStatus === 'VERIFIED' ? '● VERIFIED CONNECTION' : '✕ NOT LINKED'}
              </span>
            </div>
            
            <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold border ${
              currentUser?.walletStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {currentUser?.walletStatus === 'VERIFIED' ? 'CONNECTED' : 'UNCONNECTED'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="kyc-onboarding-sections">
          
          {/* Identity Section */}
          <div className="border p-5 rounded-2xl bg-white space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Section 1. Identity Auditing</span>
              <p className="text-xs text-slate-500 leading-relaxed font-sans font-normal">
                To issue legally binding fractional rents or lease contract parameters, our compliance validators authenticate transactor passport credentials.
              </p>
            </div>

            <div className="pt-2 text-xs space-y-2 font-mono">
              {currentUser?.kycStatus === 'NOT_STARTED' && (
                <button
                  onClick={() => setKycWizardActive(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold py-3 rounded-xl text-[10px] uppercase tracking-wider transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                >
                  <User className="w-4 h-4" />
                  <span>START KYC VERIFICATION</span>
                </button>
              )}

              {currentUser?.kycStatus === 'PENDING' && (
                <div className="text-[10px] font-mono text-amber-700 font-medium bg-amber-50 p-3 rounded-xl border border-amber-200 leading-relaxed space-y-1">
                  <div className="flex items-center gap-1 font-bold"><Clock className="w-3.5 h-3.5" /> AWAITING CLEARING AUDITS</div>
                  <div>ID Packet referenced under SHA-256 blocks keys. Bypass verification is accessible inside the administrative reviews panel.</div>
                </div>
              )}

              {currentUser?.kycStatus === 'APPROVED' && (
                <div className="flex items-center gap-2 text-emerald-700 font-mono font-bold bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-[10px] leading-relaxed">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 animate-pulse" />
                  <div>
                    <div>IDENTITY VERIFIED</div>
                    <span className="text-[9px] text-emerald-600 font-normal">Sovereign identity anchoring complete. transactor authorized.</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Secure Web3 Wallet Relayer Section */}
          <div className="border p-5 rounded-2xl bg-white space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Section 2. Private Wallet Link</span>
              <p className="text-xs text-slate-500 leading-relaxed font-sans font-normal">
                Register a cryptographic signature relay wallet to hold minted lease securities covenants, approve custody deposits, and secure yields.
              </p>
            </div>

            <div className="pt-2 text-xs space-y-2 font-mono">
              {(currentUser?.walletStatus === 'NOT_LINKED' || !currentUser?.linkedWalletAddress) ? (
                <button
                  onClick={() => setWalletConnectModal(true)}
                  className="w-full bg-slate-900 hover:bg-slate-950 text-white font-mono font-bold py-3 rounded-xl text-[10px] uppercase tracking-wider transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Wallet className="w-4 h-4 text-amber-400" />
                  <span>LINK PRIVATE WALLET KEY</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="text-[10px] font-mono bg-emerald-50 border border-emerald-200 text-slate-800 p-3 rounded-xl leading-relaxed space-y-1 truncate">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-black">
                      <Wallet className="w-3.5 h-3.5" />
                      <span>Ledger Connected</span>
                    </div>
                    <div>Address: <strong className="text-slate-900 font-bold font-mono text-[9px]">{currentUser.linkedWalletAddress}</strong></div>
                  </div>
                  <button
                    onClick={unlinkWalletAddress}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-mono py-2 rounded-lg text-[9px] uppercase tracking-wider transition cursor-pointer font-bold"
                  >
                    Unlink Access Signature Relay
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Legal notice footer banner */}
        <div className="p-4 bg-blue-50 border border-blue-150 rounded-2xl text-xs text-blue-800 font-mono leading-relaxed flex items-start gap-2.5">
          <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-blue-600" />
          <div className="font-sans text-slate-650 text-[11px] leading-relaxed">
            <strong>Switzerland Sovereign DLT Compliance Mandate:</strong> Digital fractional property shares represent registered title security items under Switzerland corporate code guidelines (DLT protocol). Identity archives are fully cryptographically shielded.
          </div>
        </div>

      </div>

      {/* MOCK KYC WIZARD MODAL POP-UP */}
      {kycWizardActive && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-mono text-xs">
          <div className="bg-white rounded-3xl border shadow-2xl p-6 max-w-md w-full space-y-5 text-left relative">
            
            <button 
              onClick={() => {
                setKycWizardActive(false);
                setKycStep(1);
              }}
              className="absolute top-4 right-4 text-slate-405 text-slate-400 hover:text-slate-600 rounded-full bg-slate-50 p-1 border cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Wizard progress tracker */}
            <div className="flex items-center justify-between border-b pb-3.5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase">Sovereign KYC Enroller</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Bespoke passport anchoring portal</p>
              </div>
              
              <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-500 bg-slate-50 p-1 rounded-lg border">
                <span className={kycStep === 1 ? 'text-blue-600 font-black' : ''}>1</span>
                <span>/</span>
                <span className={kycStep === 2 ? 'text-blue-600 font-black' : ''}>2</span>
                <span>/</span>
                <span className={kycStep === 3 ? 'text-blue-600 font-black' : ''}>3</span>
              </div>
            </div>

            {/* STEP 1: Personal Details */}
            {kycStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest block">STEP 1: Personal Particulars</span>
                
                <div className="space-y-3 font-mono text-xs text-slate-705">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Stated Full Name (Matching Passport)</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Secure Email Address</label>
                    <input 
                      type="email" 
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase font-bold"> Switzerland Phone No</label>
                      <input 
                        type="text" 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase font-bold">Residence Address</label>
                      <input 
                        type="text" 
                        value={physicalAddress}
                        onChange={(e) => setPhysicalAddress(e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setKycStep(2)}
                  className="w-full bg-slate-900 hover:bg-slate-950 text-white font-mono font-bold py-3 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer font-bold text-[10px] uppercase"
                >
                  <span>Continue to Documents</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2: Document Upload */}
            {kycStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest block">STEP 2: Document Verification</span>
                
                <div className="space-y-3 text-xs text-slate-705">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Select Document Type</label>
                    <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-center">
                      {(['PASSPORT', 'DRIVERS_LICENSE', 'NATIONAL_ID'] as const).map((doc) => (
                        <button
                          key={doc}
                          type="button"
                          onClick={() => setDocumentType(doc)}
                          className={`p-2 rounded-xl cursor-pointer border transition-all truncate ${
                            documentType === doc 
                              ? 'bg-slate-900 text-white border-slate-900' 
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {doc.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-405 text-slate-400 uppercase font-bold">Document Serial ID</label>
                    <input 
                      type="text" 
                      value={documentIdCode}
                      onChange={(e) => setDocumentIdCode(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Drag and Drop simulate file selection */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Upload Government File Proof</label>
                    <div className="border border-dashed p-4 rounded-xl text-center bg-slate-50 space-y-2 relative cursor-pointer" onClick={() => setMockFileSelected('CH-Deed-Pass.pdf')}>
                      <FileText className="w-7 h-7 text-slate-400 mx-auto" />
                      {mockFileSelected ? (
                        <span className="text-[10px] text-emerald-600 block font-bold">✓ Selected: {mockFileSelected}</span>
                      ) : (
                        <span className="text-[9px] text-slate-400 block font-sans">Drag document scan here or click to browse files</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 font-bold text-[10px]">
                  <button
                    type="button"
                    onClick={() => setKycStep(1)}
                    className="flex-1 bg-slate-50 hover:bg-slate-100 border text-slate-700 py-3 rounded-xl uppercase transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!mockFileSelected) {
                        alert('Please simulate uploading a document Scan before continuing.');
                        return;
                      }
                      setKycStep(3);
                    }}
                    className="flex-1 bg-slate-900 hover:bg-slate-950 text-white py-3 rounded-xl uppercase transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Biometrics</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: facial Capture simulation */}
            {kycStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest block">STEP 3: Biometric face enrollment</span>
                
                {/* Simulated Camera Window */}
                <div className="relative h-44 bg-slate-955 bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800">
                  <div className="absolute inset-0 bg-radial from-transparent to-slate-950/70" />
                  
                  {biometricsScanning ? (
                    <div className="text-center space-y-3.5 relative z-10">
                      <RefreshCw className="w-9 h-9 text-blue-500 animate-spin mx-auto" />
                      <div className="text-[10px] text-blue-400 uppercase tracking-widest font-black">SCANNING FACIAL CHARACTERISTICS...</div>
                      <div className="w-32 h-1 bg-slate-800 rounded mx-auto overflow-hidden">
                        <div className="h-full bg-blue-500 w-1/2 animate-ping" />
                      </div>
                    </div>
                  ) : biometricsSuccess ? (
                    <div className="text-center space-y-2.5 relative z-10">
                      <CheckCircle className="w-9 h-9 text-emerald-500 mx-auto animate-bounce" />
                      <div className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">BIOMETRIC SIGNATURE COMPILED</div>
                      <span className="text-[8px] text-slate-400 block font-mono bg-slate-800 py-0.5 px-2 rounded">SIMUL_SIG_ED25519_VALID</span>
                    </div>
                  ) : (
                    <div className="text-center space-y-3 z-10">
                      <div className="w-16 h-16 border-2 border-dashed border-blue-400 rounded-full flex items-center justify-center mx-auto">
                        <Camera className="w-6 h-6 text-blue-400" />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setBiometricsScanning(true);
                          setTimeout(() => {
                            setBiometricsScanning(false);
                            setBiometricsSuccess(true);
                          }, 1500);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wider py-1.5 px-4 rounded-xl text-[9px] uppercase cursor-pointer"
                      >
                        ACTIVATE CAPTURE FRAME
                      </button>
                    </div>
                  )}

                  {/* Scanning bounds overlay */}
                  <div className="absolute w-36 h-36 border border-blue-400/20 rounded-full animate-pulse pointer-events-none" />
                </div>

                <div className="flex gap-2 font-bold text-[10px]">
                  <button
                    type="button"
                    onClick={() => setKycStep(2)}
                    className="flex-1 bg-slate-50 hover:bg-slate-100 border text-slate-700 py-3 rounded-xl uppercase transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!biometricsSuccess}
                    onClick={startKycSubmission}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl uppercase transition cursor-pointer font-bold tracking-wide"
                  >
                    SUBMIT ENROLLMENT
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MOCK WALLET access SIGNATURE CONFIRMATION MODAL POP-UP */}
      {walletConnectModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-mono text-xs">
          <div className="bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl p-6 max-w-sm w-full space-y-4 text-left relative">
            <button 
              onClick={() => setWalletConnectModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-350 rounded-full bg-slate-900 p-1 border border-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-500" />
                <span>Web3 Client Access signature</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Authorize contract interaction from your private ledger extension key.</p>
            </div>

            <form onSubmit={handleWalletLinkSignatureSubmit} className="space-y-4 text-xs select-none">
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2 font-mono text-[10px] text-slate-400 leading-relaxed">
                <div>Origin Request: <span className="text-white">https://vex.custody.gateway</span></div>
                <div>Network Node: <span className="text-indigo-400">Zurich Testnet (Sandbox)</span></div>
                <div>Hash Protocol: <span className="text-amber-500">ED25519-SOL-SIG</span></div>
                
                <div className="border-t border-slate-800 pt-2 text-slate-300">
                  <span className="block text-slate-400 text-[8px] uppercase font-bold mb-1">Message Payload</span>
                  <code>"I hereby verify possession of private blockchain ledger keys and authorize VEX-CUSTODY API node integrations under session 991845."</code>
                </div>
              </div>

              <div className="flex gap-2 font-bold text-[10px]">
                <button
                  type="button"
                  onClick={() => setWalletConnectModal(false)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 py-3 rounded-xl uppercase transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={signingProgress}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-slate-950 py-3 rounded-xl uppercase transition cursor-pointer font-black tracking-wide flex items-center justify-center gap-1.5"
                >
                  {signingProgress ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>CONFIRM SIGNATURE</span>
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
