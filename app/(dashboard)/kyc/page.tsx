'use client';

import { useRef, useState } from 'react';
import {
  BadgeCheck, Clock, CheckCircle2, XCircle, AlertCircle,
  Wallet, Upload, X, Link2, Link2Off, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuthStore } from '@/stores/auth.store';
import { useKycStatus, useSubmitKycDocuments } from '@/features/kyc/queries/kyc.queries';
import { useWalletChallenge, useLinkWallet, useUnlinkWallet } from '@/features/auth/queries/auth.queries';
import { cn } from '@/lib/utils';

// ─── KYC status step config ────────────────────────────────────────────────────

const KYC_STEPS = [
  { key: 'not_started',  label: 'Not Started',  Icon: AlertCircle,  color: 'text-black/30',   bg: 'bg-gray-100' },
  { key: 'pending',      label: 'Submitted',     Icon: Clock,        color: 'text-amber-500',  bg: 'bg-amber-50' },
  { key: 'under_review', label: 'Under Review',  Icon: Clock,        color: 'text-blue-500',   bg: 'bg-blue-50' },
  { key: 'approved',     label: 'Approved',      Icon: CheckCircle2, color: 'text-emerald-500',bg: 'bg-emerald-50' },
  { key: 'rejected',     label: 'Rejected',      Icon: XCircle,      color: 'text-red-500',    bg: 'bg-red-50' },
] as const;

const DOC_TYPES = [
  { value: 'national_id',   label: 'National ID' },
  { value: 'passport',      label: 'Passport' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'utility_bill',  label: 'Utility Bill (proof of address)' },
];

// ─── KycPage ──────────────────────────────────────────────────────────────────

export default function KycPage() {
  const { currentUser, updateUser } = useAuthStore();

  // KYC data from API
  const { data: kycData, isLoading: loadingKyc } = useKycStatus();
  const { mutate: submitDocs, isPending: submitting } = useSubmitKycDocuments();

  // Document upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [docType, setDocType] = useState('national_id');

  // Wallet state
  const [walletAddress, setWalletAddress] = useState('');
  const [signature, setSignature] = useState('');
  const [challengeMsg, setChallengeMsg] = useState('');
  const [walletStep, setWalletStep] = useState<'idle' | 'challenge' | 'sign'>('idle');

  const { mutate: getChallenge, isPending: gettingChallenge } = useWalletChallenge();
  const { mutate: doLinkWallet, isPending: linkingWallet } = useLinkWallet();
  const { mutate: doUnlinkWallet, isPending: unlinkingWallet } = useUnlinkWallet();

  if (!currentUser) return null;

  // Use API data if available, fall back to session
  const kycStatus = kycData?.kycStatus ?? currentUser.kycStatus.toLowerCase();
  const currentStepIdx = KYC_STEPS.findIndex((s) => s.key === kycStatus);
  const canSubmitKyc = kycStatus === 'not_started' || kycStatus === 'rejected';
  const isKycApproved = kycStatus === 'approved';

  // ── KYC document upload ──
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setSelectedFiles((prev) => [...prev, ...files].slice(0, 5)); // max 5 files
  };

  const removeFile = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitKyc = () => {
    if (selectedFiles.length === 0) { toast.error('Please select at least one document.'); return; }
    submitDocs({ files: selectedFiles, documentType: docType }, {
      onSuccess: () => setSelectedFiles([]),
    });
  };

  // ── Wallet connect ──
  const handleRequestChallenge = () => {
    if (!walletAddress.trim()) { toast.error('Enter your wallet address.'); return; }
    if (!/^0x[0-9a-fA-F]{40}$/.test(walletAddress.trim())) {
      toast.error('Invalid Ethereum wallet address.');
      return;
    }
    getChallenge(walletAddress.trim(), {
      onSuccess: (msg) => {
        // API returns the full message to sign, not just a nonce
        const message = typeof msg === 'string' ? msg : (msg as { message?: string }).message ?? String(msg);
        setChallengeMsg(message);
        setWalletStep('sign');
        toast.success('Challenge received. Sign the message in your wallet.');
      },
      onError: () => toast.error('Failed to get wallet challenge.'),
    });
  };

  const handleLinkWallet = () => {
    if (!signature.trim()) { toast.error('Paste your wallet signature.'); return; }
    doLinkWallet({ walletAddress: walletAddress.trim(), signature: signature.trim() }, {
      onSuccess: (updated) => {
        updateUser({ walletStatus: updated.walletStatus, linkedWalletAddress: updated.linkedWalletAddress });
        setWalletStep('idle');
        setWalletAddress('');
        setSignature('');
        setChallengeMsg('');
        toast.success('Wallet linked successfully.');
      },
      onError: (err) => toast.error((err as Error).message),
    });
  };

  const handleUnlinkWallet = () => {
    doUnlinkWallet(undefined, {
      onSuccess: (updated) => {
        updateUser({ walletStatus: updated.walletStatus, linkedWalletAddress: undefined });
        toast.success('Wallet unlinked.');
      },
      onError: (err) => toast.error((err as Error).message),
    });
  };

  const walletIsLinked = currentUser.walletStatus !== 'NOT_LINKED';

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <BadgeCheck className="w-6 h-6 text-emerald-500 shrink-0" />
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">Verification</p>
          <h1 className="text-2xl font-light text-[#0f172a] tracking-tight">KYC & Wallet</h1>
        </div>
      </div>

      <div className="space-y-5">
        {/* ── KYC Status card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-5">
            Identity Verification (KYC)
          </p>

          {loadingKyc ? (
            <div className="flex items-center gap-2 text-black/40 text-sm">
              <Loader2 size={16} className="animate-spin" /> Loading KYC status…
            </div>
          ) : (
            <>
              {/* Step progress */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-5">
                {KYC_STEPS.map(({ key, label, Icon, color, bg }, i) => {
                  const isActive = key === kycStatus;
                  const isPast   = i < currentStepIdx;
                  return (
                    <div key={key} className="flex items-center gap-2 shrink-0">
                      <div className={cn('flex flex-col items-center gap-1.5 transition-opacity',
                        isActive ? 'opacity-100' : isPast ? 'opacity-60' : 'opacity-30'
                      )}>
                        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', isActive ? bg : 'bg-gray-100')}>
                          <Icon size={15} className={isActive ? color : 'text-black/30'} />
                        </div>
                        <span className="text-[8px] font-mono uppercase tracking-wider text-black/40 whitespace-nowrap">{label}</span>
                      </div>
                      {i < KYC_STEPS.length - 1 && (
                        <div className={cn('w-6 h-px shrink-0 mb-4', i < currentStepIdx ? 'bg-emerald-400/50' : 'bg-black/10')} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Review note if any */}
              {kycData?.reviewNote && (
                <div className="text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-xl p-3 mb-4">
                  Admin note: {kycData.reviewNote}
                </div>
              )}

              {/* Status context message */}
              {kycStatus === 'not_started' && (
                <p className="text-xs text-black/40 mb-4 leading-relaxed">
                  Upload identity documents to start verification. You need KYC approval to publish properties, participate in escrow, or complete purchase transactions.
                </p>
              )}
              {kycStatus === 'approved' && (
                <div className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4">
                  <CheckCircle2 size={14} /> Identity verified. You can perform trusted platform actions.
                </div>
              )}
              {kycStatus === 'rejected' && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  <XCircle size={14} /> KYC rejected. Please resubmit with valid documents.
                </div>
              )}
              {(kycStatus === 'pending' || kycStatus === 'under_review') && (
                <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                  <Clock size={14} /> Your documents are under admin review. You will be notified once approved.
                </div>
              )}

              {/* Submitted documents */}
              {kycData && kycData.documents.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-black/30 mb-2">Submitted Documents</p>
                  <div className="space-y-2">
                    {kycData.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                        <span className="text-sm text-black/70 font-mono">{doc.type}</span>
                        <span className={cn('text-[10px] font-mono uppercase px-2 py-0.5 rounded',
                          doc.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                          doc.status === 'rejected' ? 'bg-red-50 text-red-500' :
                          'bg-amber-50 text-amber-600'
                        )}>
                          {doc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document upload form */}
              {canSubmitKyc && (
                <div className="border border-dashed border-gray-300 rounded-2xl p-5 mt-2">
                  <p className="text-xs font-semibold text-black/60 mb-3">Submit KYC Documents</p>

                  <div className="mb-3">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-1.5 block">
                      Document Type
                    </label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm text-black/70 bg-white focus:outline-none focus:border-emerald-400 transition-all"
                    >
                      {DOC_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* File drop zone */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border border-dashed border-gray-300 hover:border-emerald-400 rounded-xl py-6 flex flex-col items-center gap-2 transition-colors text-black/40 hover:text-emerald-500 bg-gray-50 hover:bg-emerald-50/30"
                  >
                    <Upload size={20} />
                    <span className="text-xs font-medium">Click to upload documents</span>
                    <span className="text-[10px] text-black/30">PDF, JPG, PNG — max 5 files</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Selected files */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                          <span className="text-xs text-black/60 truncate max-w-[200px] font-mono">{file.name}</span>
                          <button type="button" onClick={() => removeFile(idx)} className="text-black/30 hover:text-red-400 ml-2">
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSubmitKyc}
                    disabled={submitting || selectedFiles.length === 0}
                    className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {submitting ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : 'Submit Documents'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Wallet section ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-2 flex items-center gap-1.5">
            <Wallet size={10} /> Blockchain Wallet
          </p>
          <p className="text-xs text-black/40 mb-5 leading-relaxed">
            Link your Ethereum wallet to participate in fractional purchases, escrow, and on-chain transactions.
            {!isKycApproved && (
              <span className="text-amber-500 ml-1">KYC approval required before linking a wallet.</span>
            )}
          </p>

          {walletIsLinked ? (
            /* ── Linked state ── */
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <Wallet size={15} className="text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-emerald-700 mb-0.5">
                    Wallet {currentUser.walletStatus === 'VERIFIED' ? 'Verified' : 'Linked'}
                  </p>
                  <p className="text-[10px] font-mono text-emerald-600/70 truncate">
                    {currentUser.linkedWalletAddress ?? 'Address stored on server'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleUnlinkWallet}
                disabled={unlinkingWallet}
                className="flex items-center gap-2 text-red-500 hover:text-red-600 text-xs font-medium transition-colors disabled:opacity-50"
              >
                {unlinkingWallet ? <Loader2 size={13} className="animate-spin" /> : <Link2Off size={13} />}
                Unlink Wallet
              </button>
            </div>
          ) : walletStep === 'idle' ? (
            /* ── Connect step 1: enter address ── */
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-1.5 block">
                  Wallet Address (Ethereum)
                </label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x..."
                  disabled={!isKycApproved}
                  className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm font-mono text-black/70 placeholder:text-black/25 focus:outline-none focus:border-emerald-400 transition-all disabled:bg-gray-50 disabled:opacity-50"
                />
              </div>
              <button
                type="button"
                onClick={handleRequestChallenge}
                disabled={gettingChallenge || !isKycApproved || !walletAddress.trim()}
                className="flex items-center gap-2 bg-black hover:bg-gray-900 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                {gettingChallenge ? <Loader2 size={13} className="animate-spin" /> : <Link2 size={13} />}
                Get Signing Challenge
              </button>
            </div>
          ) : (
            /* ── Connect step 2: sign + submit ── */
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-2">Message to Sign</p>
                <pre className="text-[10px] font-mono text-black/60 whitespace-pre-wrap break-all leading-relaxed">
                  {challengeMsg}
                </pre>
              </div>

              <div className="text-xs text-black/50 leading-relaxed bg-amber-50 border border-amber-200 rounded-xl p-3">
                <strong className="text-amber-700">How to sign:</strong> Use MetaMask, WalletConnect, or any Ethereum wallet to sign the message above. Then paste the signature below.
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-1.5 block">
                  Wallet Signature
                </label>
                <textarea
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Paste your 0x... signature here"
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-mono text-black/70 placeholder:text-black/25 focus:outline-none focus:border-emerald-400 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleLinkWallet}
                  disabled={linkingWallet || !signature.trim()}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  {linkingWallet ? <Loader2 size={13} className="animate-spin" /> : <Link2 size={13} />}
                  Link Wallet
                </button>
                <button
                  type="button"
                  onClick={() => { setWalletStep('idle'); setChallengeMsg(''); setSignature(''); }}
                  className="text-xs text-black/40 hover:text-black/60 transition-colors px-3 py-2.5"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
