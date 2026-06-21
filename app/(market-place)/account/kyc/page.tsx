'use client';

import { useRef, useState } from 'react';
import {
  ShieldCheck,
  UploadCloud,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Wallet,
  Link2,
  Link2Off,
  Loader2,
  X,
  ExternalLink,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import {
  useKycStatus,
  useSubmitKycDocuments,
  useKycDocumentUrl,
} from '@/features/kyc/queries/kyc.queries';
import { useAuthStore } from '@/stores/auth.store';
import {
  connectWallet,
  signMessage,
  ensureSepoliaNetwork,
} from '@/features/wallet/utils/metamask';
import {
  requestWalletChallenge,
  linkWallet,
  unlinkWallet,
} from '@/features/wallet/services/wallet.service';
import {
  normalizeWalletAddress,
  truncateWalletAddress,
  getEtherscanAddressUrl,
} from '@/features/wallet/types/wallet.types';

const DOC_TYPES = [
  { value: 'national_id', label: 'National ID' },
  { value: 'passport', label: 'Passport' },
  { value: 'drivers_license', label: "Driver's Licence" },
  { value: 'other', label: 'Other Document' },
];

const DOC_TYPE_LABELS: Record<string, string> = {
  national_id: 'National ID',
  passport: 'Passport',
  drivers_license: "Driver's Licence",
  other: 'Other Document',
};

const STATUS_STYLE: Record<string, string> = {
  verified: 'bg-surface-success/15 text-emerald-400 border border-emerald-500/10',
  approved: 'bg-surface-success/15 text-emerald-400 border border-emerald-500/10',
  pending: 'bg-surface-warning/15 text-amber-400 border border-amber-500/10',
  under_review: 'bg-surface-warning/15 text-amber-400 border border-amber-500/10',
  rejected: 'bg-surface-danger/15 text-text-danger border border-text-danger/10',
  not_started: 'bg-surface-highlight text-text-muted border border-border-primary',
};

export default function AccountKycPage() {
  const { currentUser, updateUser } = useAuthStore();
  const { data: kycData, isLoading: loadingKyc } = useKycStatus();
  const submit = useSubmitKycDocuments();
  const getDocUrl = useKycDocumentUrl();
  const fileRef = useRef<HTMLInputElement>(null);

  const [documentType, setDocumentType] = useState('national_id');
  const [files, setFiles] = useState<File[]>([]);
  const [viewingDocId, setViewingDocId] = useState<string | null>(null);

  // MetaMask/Wallet State
  const [walletStep, setWalletStep] = useState<'idle' | 'connect' | 'sign' | 'linking'>('idle');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [challengeMessage, setChallengeMessage] = useState<string>('');
  const [walletError, setWalletError] = useState<string>('');
  const [walletLoading, setWalletLoading] = useState(false);

  const status: string =
    kycData?.kycStatus ?? currentUser?.kycStatus ?? 'not_started';
  const isVerified = status === 'verified' || status === 'approved';
  const isPendingReview = status === 'pending' || status === 'under_review';
  const isRejected = status === 'rejected';

  const handleKycSubmit = () => {
    if (files.length === 0) return;
    submit.mutate(
      { files, documentType },
      {
        onSuccess: () => {
          setFiles([]);
          if (fileRef.current) fileRef.current.value = '';
        },
      },
    );
  };

  const handleViewDocument = (docId: string) => {
    setViewingDocId(docId);
    getDocUrl.mutate(docId, {
      onSuccess: (url) => {
        setViewingDocId(null);
        if (url) {
          window.open(url, '_blank', 'noopener,noreferrer');
        } else {
          toast.error('Failed to retrieve signed view URL');
        }
      },
      onError: () => {
        setViewingDocId(null);
        toast.error('Failed to retrieve signed view URL');
      },
    });
  };

  // Wallet Linking Handlers
  const handleConnectWallet = async () => {
    setWalletError('');
    setWalletLoading(true);
    try {
      await ensureSepoliaNetwork();
      const address = await connectWallet();
      setWalletAddress(normalizeWalletAddress(address));
      const challenge = await requestWalletChallenge(address);
      setChallengeMessage(challenge.message);
      setWalletStep('sign');
    } catch (err: any) {
      setWalletError(err.message || 'Failed to connect Metamask');
      toast.error(err.message || 'Failed to connect Metamask');
    } finally {
      setWalletLoading(false);
    }
  };

  const handleSignChallenge = async () => {
    setWalletError('');
    setWalletLoading(true);
    try {
      const signature = await signMessage(challengeMessage, walletAddress);
      setWalletStep('linking');
      const updatedUser = await linkWallet(walletAddress, signature);
      updateUser(updatedUser);
      setWalletStep('idle');
      setWalletAddress('');
      setChallengeMessage('');
      toast.success('Wallet linked successfully');
    } catch (err: any) {
      setWalletError(err.message || 'Failed to link wallet');
      toast.error(err.message || 'Failed to link wallet');
      setWalletStep('idle');
    } finally {
      setWalletLoading(false);
    }
  };

  const handleUnlinkWallet = async () => {
    setWalletError('');
    setWalletLoading(true);
    try {
      const updatedUser = await unlinkWallet();
      updateUser(updatedUser);
      toast.success('Wallet unlinked successfully');
    } catch (err: any) {
      const errMsg = err.message || 'Failed to unlink wallet';
      setWalletError(errMsg);
      if (err.status === 409) {
        setWalletError('You have active or funded lease escrows. Complete or cancel them before unlinking.');
      }
      toast.error(errMsg);
    } finally {
      setWalletLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">Compliance</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-white">KYC &amp; verification</h1>
      </div>

      {/* Verification Status Card */}
      <section className="rounded-lg border border-border-primary bg-surface-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className={`rounded-lg p-3 ${isVerified ? 'bg-surface-success/10 text-emerald-400' : 'bg-surface-highlight text-text-muted'}`}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Verification status</h2>
              <p className="mt-1 text-sm text-text-muted">
                KYC approval is required before listing a property, purchasing, or moving funds in escrow.
              </p>
            </div>
          </div>
          <span
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider border shrink-0 sm:self-center self-start ${
              STATUS_STYLE[status] ?? STATUS_STYLE.not_started
            }`}
          >
            {loadingKyc ? 'Loading…' : status.replace('_', ' ')}
          </span>
        </div>

        {kycData?.reviewNote && (
          <div className="mt-4 text-xs bg-surface-danger/5 border border-text-danger/20 text-text-danger rounded-lg p-3 flex items-start gap-2">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Rejection reason:</span> {kycData.reviewNote}
            </div>
          </div>
        )}
      </section>

      {/* Submitted Documents List */}
      <section className="rounded-lg border border-border-primary bg-surface-card p-6">
        <h2 className="text-sm font-semibold text-white mb-3">Submitted documents</h2>

        {(!kycData?.documents || kycData.documents.length === 0) ? (
          <div className="text-center py-8 border border-dashed border-border-primary rounded-lg bg-surface-input/30">
            <FileText size={28} className="mx-auto text-text-placeholder mb-2" />
            <p className="text-sm text-text-muted">No documents uploaded yet</p>
            <p className="text-xs text-text-placeholder mt-1">Upload an identity document below to begin the verification process.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {kycData.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-border-primary bg-surface-input"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-surface-card p-2 text-text-muted border border-border-primary mt-0.5">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {DOC_TYPE_LABELS[doc.type] ?? doc.type}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                    {doc.hash && (
                      <p className="text-[10px] font-mono text-text-placeholder mt-1 select-all">
                        SHA-256: {doc.hash.slice(0, 8)}…{doc.hash.slice(-8)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-border-primary/50 pt-2 sm:pt-0">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border capitalize ${
                      STATUS_STYLE[doc.status] ?? STATUS_STYLE.not_started
                    }`}
                  >
                    {doc.status}
                  </span>

                  <button
                    onClick={() => handleViewDocument(doc.id)}
                    disabled={viewingDocId !== null}
                    className="flex items-center gap-1.5 text-xs text-accent-400 hover:text-accent-500 font-medium transition-colors disabled:opacity-50"
                  >
                    {viewingDocId === doc.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <ExternalLink size={13} />
                    )}
                    View File
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upload KYC Documents Section */}
      <section className="rounded-lg border border-border-primary bg-surface-card p-6">
        <h2 className="text-sm font-semibold text-white">
          {isVerified
            ? 'Upload additional documents'
            : isPendingReview
            ? 'Submit additional documents'
            : isRejected
            ? 'Resubmit identity documents'
            : 'Submit identity documents'}
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Upload a clear image or PDF. Accepted files: national ID, passport, or driver&apos;s licence.
        </p>

        {isVerified && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-lg border border-emerald-500/10 bg-surface-success/5 text-emerald-400 text-xs">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>Your account is verified. You may still upload additional supporting documents if needed.</span>
          </div>
        )}

        {isPendingReview && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-lg border border-amber-500/10 bg-surface-warning/5 text-amber-400 text-xs">
            <Clock size={14} className="shrink-0" />
            <span>Your account verification is currently pending review. You can upload additional or updated documents below if needed.</span>
          </div>
        )}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
              Document type
            </span>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-lg border border-border-primary bg-surface-input px-3 text-sm text-white outline-none focus:border-accent-400"
            >
              {DOC_TYPES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
              File(s)
            </span>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="mt-1.5 block w-full text-sm text-text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-700 cursor-pointer"
            />
          </label>
        </div>

        {files.length > 0 && (
          <ul className="mt-3 space-y-1 text-xs text-text-muted">
            {files.map((f) => (
              <li key={f.name} className="flex items-center gap-2">
                <UploadCloud size={13} className="text-accent-400" />
                {f.name} <span className="text-text-placeholder">({Math.round(f.size / 1024)} KB)</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 flex justify-end">
          <Button onClick={handleKycSubmit} loading={submit.isPending} disabled={files.length === 0}>
            <UploadCloud size={16} />
            Submit for review
          </Button>
        </div>
      </section>

      {/* Blockchain Wallet Card */}
      <section className="rounded-lg border border-border-primary bg-surface-card p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
          <Wallet size={16} className="text-accent-400" />
          <span>Blockchain Wallet</span>
        </div>
        <p className="text-sm text-text-muted mb-4 leading-relaxed">
          Link your Ethereum wallet to enable key platform blockchain operations including purchase transactions, title verification, and lease escrow.
          {!isVerified && <span className="text-amber-400 ml-1">Requires KYC verification first.</span>}
        </p>

        {walletError && (
          <div className="mb-4 flex items-start gap-2 p-3 bg-surface-danger/5 border border-text-danger/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-text-danger flex-shrink-0 mt-0.5" />
            <p className="text-sm text-text-danger">{walletError}</p>
          </div>
        )}

        {currentUser?.walletStatus === 'LINKED' || currentUser?.walletStatus === 'VERIFIED' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-surface-success/5 border border-emerald-500/20 rounded-lg p-4">
              <div className="w-9 h-9 rounded-lg bg-surface-success/10 flex items-center justify-center shrink-0 border border-emerald-500/10">
                <Wallet size={16} className="text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-emerald-400">
                    Wallet {currentUser.walletStatus === 'VERIFIED' ? 'Verified' : 'Linked'}
                  </p>
                  {currentUser.linkedWalletAddress && (
                    <a
                      href={getEtherscanAddressUrl(currentUser.linkedWalletAddress)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-accent-400 hover:text-accent-500 flex items-center gap-0.5"
                    >
                      Etherscan <ExternalLink size={8} />
                    </a>
                  )}
                </div>
                <p className="text-[10px] font-mono text-text-muted mt-0.5 truncate select-all">
                  {currentUser.linkedWalletAddress}
                </p>
              </div>
            </div>

            <Button
              variant="destructive"
              onClick={handleUnlinkWallet}
              loading={walletLoading}
              className="flex items-center gap-1.5"
            >
              <Link2Off size={14} />
              Unlink Wallet
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {walletStep === 'idle' && (
              <Button
                onClick={handleConnectWallet}
                loading={walletLoading}
                disabled={!isVerified}
                className="flex items-center gap-1.5"
              >
                <Link2 size={14} />
                Connect Wallet
              </Button>
            )}

            {walletStep === 'sign' && (
              <div className="space-y-4">
                <div className="p-3 bg-surface-input border border-border-primary rounded-lg">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">Sign in your wallet</p>
                  <pre className="text-[10px] font-mono text-white whitespace-pre-wrap break-all leading-relaxed select-all">
                    {challengeMessage}
                  </pre>
                </div>
                <div className="text-xs text-amber-400 bg-surface-warning/5 border border-amber-500/10 rounded-lg p-3">
                  Please open MetaMask and sign the message above. Copy and paste the signature below.
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleSignChallenge}
                    loading={walletLoading}
                    className="flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={14} />
                    Sign Message
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setWalletStep('idle');
                      setChallengeMessage('');
                      setWalletAddress('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {walletStep === 'linking' && (
              <div className="flex flex-col items-center justify-center py-6 border border-border-primary rounded-lg bg-surface-input">
                <Loader2 className="w-8 h-8 text-accent-400 animate-spin mb-2" />
                <p className="text-xs text-text-muted">Linking address to your account...</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
