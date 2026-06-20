'use client';

import { useState, useRef } from 'react';
import {
  BadgeCheck, Clock, CheckCircle2, XCircle, AlertCircle,
  Wallet, Link2, Link2Off, Loader2, X,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuthStore } from '@/stores/auth.store';
import { useKycStatus, useSubmitKycDocuments } from '@/features/kyc/queries/kyc.queries';
import { useWalletChallenge, useLinkWallet, useUnlinkWallet } from '@/features/auth/queries/auth.queries';
import { useUsers } from '@/features/users/queries/users.queries';
import { useAdminKycDetails, useReviewUserKyc, useAdminKycDocUrl } from '@/features/kyc/queries/kyc.admin.queries';
import { cn } from '@/lib/utils';
import { ENDPOINTS } from '@/lib/api/endpoints';import { WalletLinkFlow } from '@/features/wallet/components/WalletLinkFlow';
import { WalletUnlinkDialog } from '@/features/wallet/components/WalletUnlinkDialog';
import { WalletStatusBadge, getWalletStatusDisplay } from '@/features/wallet/components/WalletStatusBadge';
import { getEtherscanAddressUrl } from '@/features/wallet/types/wallet.types';
import { updateSessionUser } from '@/lib/auth/session';
import { Button } from '@/components/ui/Button';


const KYC_STEPS = [
  { key: 'not_started',  label: 'Not Started',  Icon: AlertCircle,  color: 'text-black/30',   bg: 'bg-gray-100' },
  { key: 'pending',      label: 'Pending',      Icon: Clock,        color: 'text-amber-500',  bg: 'bg-amber-50' },
  { key: 'verified',     label: 'Verified',     Icon: CheckCircle2, color: 'text-emerald-500',bg: 'bg-emerald-50' },
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
  const [documentType, setDocumentType]   = useState<'national_id' | 'passport' | 'drivers_license' | 'other'>('national_id');
  const [kycFiles, setKycFiles]           = useState<File[]>([]);
  const kycInputRef = useRef<HTMLInputElement>(null);

  const { mutate: getChallenge,  isPending: gettingChallenge } = useWalletChallenge();
  const { mutate: doLinkWallet,  isPending: linkingWallet }    = useLinkWallet();
  const { mutate: doUnlinkWallet, isPending: unlinkingWallet } = useUnlinkWallet();
  const [showWalletLink, setShowWalletLink] = useState(false);
  const [showWalletUnlink, setShowWalletUnlink] = useState(false);

  const [activeTab, setActiveTab] = useState<'mine' | 'queue'>('mine');

  if (!currentUser) return null;
  const isAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN';

  let kycStatus = (kycData?.kycStatus ?? currentUser.kycStatus).toLowerCase();

  const currentStepIdx = KYC_STEPS.findIndex((s) => s.key === kycStatus);
  const canSubmitKyc   = kycStatus === 'not_started' || kycStatus === 'rejected';
  const isKycApproved  = kycStatus === 'verified';
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

  // ── Wallet handlers ──
  const handleWalletLinkSuccess = (user: any) => {
    updateUser(user);
    updateSessionUser(user);
    setShowWalletLink(false);
  };
  const handleWalletUnlinkSuccess = (user: any) => {
    updateUser(user);
    updateSessionUser(user);
    setShowWalletUnlink(false);
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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <BadgeCheck className="w-6 h-6 text-emerald-500 shrink-0" />
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">Verification</p>
            <h1 className="text-2xl font-light text-[#0f172a] tracking-tight">KYC & Wallet</h1>
          </div>
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setActiveTab('mine')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
                activeTab === 'mine' ? "bg-white text-black shadow-sm" : "text-black/50 hover:text-black"
              )}
            >
              My Verification
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
                activeTab === 'queue' ? "bg-white text-black shadow-sm" : "text-black/50 hover:text-black"
              )}
            >
              Admin Queue
            </button>
          </div>
        )}
      </div>

      {activeTab === 'queue' ? (
        <AdminKycQueue />
      ) : (
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
              {kycStatus === 'verified' && (
                <div className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4">
                  <CheckCircle2 size={14} /> Identity verified. You can perform trusted platform actions.
                </div>
              )}
              {kycStatus === 'rejected' && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  <XCircle size={14} /> KYC rejected. Please start verification again.
                </div>
              )}
              {kycStatus === 'pending' && (
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

              {/* Document type selector */}
              {canSubmitKyc && (
                <div className="mb-4">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-1.5 block">
                    Document Type
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as any)}
                    className="w-full h-11 rounded-2xl border border-gray-200 px-3 text-sm text-black/70 bg-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="national_id">National ID</option>
                    <option value="passport">Passport</option>
                    <option value="drivers_license">Driver&apos;s License</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}

              {/* File upload */}
              {canSubmitKyc && (
                <div className="mb-4">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-1.5 block">
                    Upload Documents
                  </label>
                  <button
                    type="button"
                    onClick={() => kycInputRef.current?.click()}
                    className="w-full h-11 rounded-2xl border border-dashed border-gray-300 px-3 text-sm text-black/50 hover:border-emerald-400 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Link2 size={14} />
                    {kycFiles.length > 0 ? `${kycFiles.length} file(s) selected` : 'Choose files...'}
                  </button>
                  <input
                    ref={kycInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setKycFiles(files);
                    }}
                  />
                  {kycFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {kycFiles.map((file, i) => (
                        <div key={i} className="text-xs text-black/60 flex items-center gap-2">
                          <span className="truncate">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => setKycFiles(kycFiles.filter((_, idx) => idx !== i))}
                            className="text-red-500 hover:text-red-600"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* CTA button */}
              {canSubmitKyc && (
                <button
                  type="button"
                  onClick={() => submitKyc({ files: kycFiles, documentType })}
                  disabled={submitting || kycFiles.length === 0}
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
            Link your Ethereum wallet for purchase offers, lease escrow, title verification, and on-chain transactions.
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

         {/* ── Blockchain Wallet ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-1">
                Blockchain Wallet
              </p>
              <div className="flex items-center gap-2">
                <WalletStatusBadge 
                  walletStatus={currentUser.walletStatus} 
                  walletAddress={currentUser.linkedWalletAddress}
                />
              </div>
            </div>
            {currentUser.walletStatus === 'LINKED' && currentUser.linkedWalletAddress && (
              <a
                href={getEtherscanAddressUrl(currentUser.linkedWalletAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                View on Etherscan →
              </a>
            )}
          </div>
          {currentUser.walletStatus === 'LINKED' && currentUser.linkedWalletAddress && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-black/50 mb-1">Wallet Address</p>
              <p className="text-sm font-mono text-black">{currentUser.linkedWalletAddress}</p>
            </div>
          )}
          {showWalletLink && (
            <div className="mb-4">
              <WalletLinkFlow
                onSuccess={handleWalletLinkSuccess}
                onCancel={() => setShowWalletLink(false)}
              />
            </div>
          )}
          {showWalletUnlink && currentUser.linkedWalletAddress && (
            <div className="mb-4">
              <WalletUnlinkDialog
                walletAddress={currentUser.linkedWalletAddress}
                onSuccess={handleWalletUnlinkSuccess}
                onCancel={() => setShowWalletUnlink(false)}
              />
            </div>
          )}
          {!showWalletLink && !showWalletUnlink && (
            <div className="flex gap-3">
              {(currentUser.walletStatus === 'NOT_LINKED' || 
                currentUser.walletStatus === 'REVOKED') && (
                <Button
                  onClick={() => setShowWalletLink(true)}
                  size="md"
                  className="flex-1"
                >
                  <Wallet size={14} />
                  {getWalletStatusDisplay(currentUser.walletStatus, currentUser.linkedWalletAddress).action}
                </Button>
              )}
              {(currentUser.walletStatus === 'LINKED' || currentUser.walletStatus === 'VERIFIED') && (
                <Button
                  onClick={() => setShowWalletUnlink(true)}
                  variant="destructive"
                  size="md"
                  className="flex-1"
                >
                  Unlink Wallet
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}

// ─── Admin KYC Queue ──────────────────────────────────────────────────────────

function AdminKycQueue() {
  const { data: users = [], isLoading } = useUsers({ kycStatus: 'pending' as any });
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  if (isLoading) return <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-5">
      {users.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <BadgeCheck className="w-10 h-10 text-black/15 mx-auto mb-3" />
          <p className="text-sm text-black/40 font-light">No pending KYC reviews.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {users.map((u, i) => (
            <div key={u.id}>
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setSelectedUser(selectedUser === u.id ? null : u.id)}
              >
                <div>
                  <p className="text-sm font-medium text-black/80">{u.name}</p>
                  <p className="text-[10px] font-mono text-black/40">{u.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-600">Pending</span>
                  <span className="text-[10px] text-emerald-500 hover:text-emerald-600 font-medium">
                    {selectedUser === u.id ? 'Close' : 'Review →'}
                  </span>
                </div>
              </div>
              
              {selectedUser === u.id && (
                <div className="px-4 pb-4 bg-gray-50/50 border-t border-gray-100 pt-4">
                  <AdminKycReview userId={u.id} onReviewed={() => setSelectedUser(null)} />
                </div>
              )}
              
              {i < users.length - 1 && <div className="border-b border-gray-100" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminKycReview({ userId, onReviewed }: { userId: string, onReviewed: () => void }) {
  const { data: kycDetails, isLoading } = useAdminKycDetails(userId);
  const { mutate: review, isPending } = useReviewUserKyc();
  const [note, setNote] = useState('');

  if (isLoading) return <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>;
  if (!kycDetails) return <div className="text-sm text-red-500">Failed to load documents.</div>;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-2">Submitted Documents</p>
        {kycDetails.documents.length === 0 ? (
          <p className="text-xs text-black/40">No documents found.</p>
        ) : (
          <div className="grid gap-2">
            {kycDetails.documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3">
                <div>
                  <p className="text-xs font-medium text-black/70">{doc.type.replace('_', ' ')}</p>
                  <p className="text-[10px] font-mono text-black/40">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                </div>
                <KycDocLink userId={userId} docId={doc.id} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3 pt-2">
        <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">Admin Decision</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note to the user..."
          rows={2}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-black/70 placeholder:text-black/25 focus:outline-none focus:border-emerald-400 resize-none"
        />
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => review({ userId, decision: 'approve', note }, { onSuccess: onReviewed })}
            className="flex-1 flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold py-2 rounded-xl transition-colors"
          >
            {isPending ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
            Approve
          </button>
          <button
            type="button"
            disabled={isPending || !note.trim()}
            onClick={() => review({ userId, decision: 'reject', note }, { onSuccess: onReviewed })}
            className="flex-1 flex justify-center items-center gap-2 bg-red-50 hover:bg-red-100 disabled:bg-gray-50 disabled:text-gray-400 text-red-600 text-xs font-semibold py-2 rounded-xl transition-colors"
            title={!note.trim() ? "A note is required for rejection" : ""}
          >
            {isPending ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

function KycDocLink({ userId, docId }: { userId: string, docId: string }) {
  const { data: url, isLoading } = useAdminKycDocUrl(userId, docId);

  if (isLoading) return <Loader2 size={13} className="animate-spin text-emerald-500" />;
  if (!url) return <span className="text-[10px] text-red-500">Error loading link</span>;

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noreferrer"
      className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
    >
      <Link2 size={12} /> View File
    </a>
  );
}
