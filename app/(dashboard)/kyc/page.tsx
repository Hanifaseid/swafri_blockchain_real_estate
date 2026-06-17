'use client';

import { useState } from 'react';
import {
  BadgeCheck, Clock, CheckCircle2, XCircle, AlertCircle,
  Wallet, Link2, Link2Off, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuthStore } from '@/stores/auth.store';
import { useKycStatus, useSubmitKycDocuments } from '@/features/kyc/queries/kyc.queries';
import { useWalletChallenge, useLinkWallet, useUnlinkWallet } from '@/features/auth/queries/auth.queries';
import { cn } from '@/lib/utils';

const KYC_STEPS = [
  { key: 'not_started',  label: 'Not Started',  Icon: AlertCircle,  color: 'text-black/30',   bg: 'bg-gray-100' },
  { key: 'pending',      label: 'Submitted',     Icon: Clock,        color: 'text-amber-500',  bg: 'bg-amber-50' },
  { key: 'under_review', label: 'Under Review',  Icon: Clock,        color: 'text-blue-500',   bg: 'bg-blue-50' },
  { key: 'approved',     label: 'Approved',      Icon: CheckCircle2, color: 'text-emerald-500',bg: 'bg-emerald-50' },
  { key: 'rejected',     label: 'Rejected',      Icon: XCircle,      color: 'text-red-500',    bg: 'bg-red-50' },
] as const;

export default function KycPage() {
  const { currentUser, updateUser } = useAuthStore();

  const { data: kycData, isLoading: loadingKyc } = useKycStatus();
  const { mutate: submitKyc, isPending: submitting } = useSubmitKycDocuments();

  const [walletAddress, setWalletAddress] = useState('');
  const [signature, setSignature]         = useState('');
  const [challengeMsg, setChallengeMsg]   = useState('');
  const [walletStep, setWalletStep]       = useState<'idle' | 'sign'>('idle');

  const { mutate: getChallenge,  isPending: gettingChallenge } = useWalletChallenge();
  const { mutate: doLinkWallet,  isPending: linkingWallet }    = useLinkWallet();
  const { mutate: doUnlinkWallet, isPending: unlinkingWallet } = useUnlinkWallet();

  if (!currentUser) return null;

  const kycStatus      = kycData?.kycStatus ?? currentUser.kycStatus.toLowerCase();
  const currentStepIdx = KYC_STEPS.findIndex((s) => s.key === kycStatus);
  const canSubmitKyc   = kycStatus === 'not_started' || kycStatus === 'rejected';
  const isKycApproved  = kycStatus === 'approved';
  const walletIsLinked = currentUser.walletStatus !== 'NOT_LINKED';

  // ── Wallet handlers ──
  const handleRequestChallenge = () => {
    if (!/^0x[0-9a-fA-F]{40}$/.test(walletAddress.trim())) {
      toast.error('Enter a valid Ethereum address (0x...).');
      return;
    }
    getChallenge(walletAddress.trim(), {
      onSuccess: (msg) => {
        const message = typeof msg === 'string' ? msg : (msg as { message?: string }).message ?? String(msg);
        setChallengeMsg(message);
        setWalletStep('sign');
      },
      onError: () => toast.error('Failed to get challenge.'),
    });
  };

  const handleLinkWallet = () => {
    if (!signature.trim()) { toast.error('Paste your signature.'); return; }
    doLinkWallet({ walletAddress: walletAddress.trim(), signature: signature.trim() }, {
      onSuccess: (updated) => {
        updateUser({ walletStatus: updated.walletStatus, linkedWalletAddress: updated.linkedWalletAddress });
        setWalletStep('idle'); setWalletAddress(''); setSignature(''); setChallengeMsg('');
        toast.success('Wallet linked.');
      },
      onError: (err) => toast.error((err as Error).message),
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <BadgeCheck className="w-6 h-6 text-emerald-500 shrink-0" />
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">Verification</p>
          <h1 className="text-2xl font-light text-[#0f172a] tracking-tight">KYC & Wallet</h1>
        </div>
      </div>

      <div className="space-y-5">
        {/* ── KYC card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-5">Identity Verification</p>

          {loadingKyc ? (
            <div className="flex items-center gap-2 text-black/40 text-sm">
              <Loader2 size={16} className="animate-spin" /> Loading…
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
                        isActive ? 'opacity-100' : isPast ? 'opacity-60' : 'opacity-30')}>
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

              {/* Review note */}
              {kycData?.reviewNote && (
                <div className="text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-xl p-3 mb-4">
                  Admin note: {kycData.reviewNote}
                </div>
              )}

              {/* Status message */}
              {kycStatus === 'approved' && (
                <div className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4">
                  <CheckCircle2 size={14} /> Identity verified. You can perform trusted platform actions.
                </div>
              )}
              {kycStatus === 'rejected' && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  <XCircle size={14} /> KYC rejected. Please start verification again.
                </div>
              )}
              {(kycStatus === 'pending' || kycStatus === 'under_review') && (
                <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                  <Clock size={14} /> Documents under admin review. You will be notified once approved.
                </div>
              )}
              {kycStatus === 'not_started' && (
                <p className="text-xs text-black/40 mb-4 leading-relaxed">
                  Start identity verification to unlock property publishing, escrow, and purchase transactions.
                  Our 3rd-party KYC provider will guide you through the process.
                </p>
              )}

              {/* CTA button */}
              {canSubmitKyc && (
                <button
                  type="button"
                  onClick={() => submitKyc({ files: [], documentType: 'kyc_verification' })}
                  disabled={submitting}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  {submitting
                    ? <><Loader2 size={14} className="animate-spin" /> Starting…</>
                    : <><BadgeCheck size={14} /> Start KYC Verification</>}
                </button>
              )}
            </>
          )}
        </div>

        {/* ── Wallet card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-2 flex items-center gap-1.5">
            <Wallet size={10} /> Blockchain Wallet
          </p>
          <p className="text-xs text-black/40 mb-5 leading-relaxed">
            Link your Ethereum wallet for fractional purchases, escrow, and on-chain transactions.
            {!isKycApproved && <span className="text-amber-500 ml-1">KYC approval required first.</span>}
          </p>

          {walletIsLinked ? (
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
                    {currentUser.linkedWalletAddress ?? 'Address on server'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => doUnlinkWallet(undefined, {
                  onSuccess: (u) => { updateUser({ walletStatus: u.walletStatus, linkedWalletAddress: undefined }); toast.success('Wallet unlinked.'); },
                  onError: (e) => toast.error((e as Error).message),
                })}
                disabled={unlinkingWallet}
                className="flex items-center gap-2 text-red-500 hover:text-red-600 text-xs font-medium transition-colors disabled:opacity-50"
              >
                {unlinkingWallet ? <Loader2 size={13} className="animate-spin" /> : <Link2Off size={13} />}
                Unlink Wallet
              </button>
            </div>
          ) : walletStep === 'idle' ? (
            <div className="space-y-3">
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x... your Ethereum address"
                disabled={!isKycApproved}
                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm font-mono text-black/70 placeholder:text-black/25 focus:outline-none focus:border-emerald-400 transition-all disabled:bg-gray-50 disabled:opacity-50"
              />
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
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-2">Sign this message in your wallet</p>
                <pre className="text-[10px] font-mono text-black/60 whitespace-pre-wrap break-all leading-relaxed">{challengeMsg}</pre>
              </div>
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                Open MetaMask → Personal Sign → paste the message above → copy the signature.
              </div>
              <textarea
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Paste 0x... signature here"
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-mono text-black/70 placeholder:text-black/25 focus:outline-none focus:border-emerald-400 transition-all resize-none"
              />
              <div className="flex gap-3">
                <button type="button" onClick={handleLinkWallet}
                  disabled={linkingWallet || !signature.trim()}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors">
                  {linkingWallet ? <Loader2 size={13} className="animate-spin" /> : <Link2 size={13} />}
                  Link Wallet
                </button>
                <button type="button"
                  onClick={() => { setWalletStep('idle'); setChallengeMsg(''); setSignature(''); }}
                  className="text-xs text-black/40 hover:text-black/60 px-3">
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
