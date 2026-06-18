'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import {
  useLeaseDetail,
  useProposeLease,
  useFundLease,
  useActivateLease,
  useCancelLease,
  useCompleteLease,
  useTerminateLease,
  useDisputeLease,
  useResolveDispute,
  useEscrowVerification,
} from '@/features/leases/queries/lease.queries';
import { FileSignature, Loader2, ArrowLeft, ShieldCheck, AlertTriangle, CheckCircle2, Wallet, Calendar, DollarSign, FileText, Home, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LeaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const { currentUser } = useAuthStore();
  
  const { data: lease, isLoading } = useLeaseDetail(id);
  const { data: escrow } = useEscrowVerification(id);

  const { mutate: propose, isPending: proposing } = useProposeLease();
  const { mutate: fund, isPending: funding } = useFundLease();
  const { mutate: activate, isPending: activating } = useActivateLease();
  const { mutate: cancel, isPending: cancelling } = useCancelLease();
  const { mutate: complete, isPending: completing } = useCompleteLease();
  const { mutate: terminate, isPending: terminating } = useTerminateLease();
  const { mutate: dispute, isPending: disputing } = useDisputeLease();

  if (!currentUser) return null;

  const isTenant = currentUser.role === 'TENANT';
  const isOwner = currentUser.role === 'PROPERTY_OWNER';
  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!lease) {
    return <div className="p-8 text-center text-red-500">Lease not found</div>;
  }

  const status = (lease.status || '').toLowerCase();
  
  let statusBadge = 'bg-gray-100 text-gray-700 border-gray-200';
  if (status === 'draft' || status === 'proposed') statusBadge = 'bg-amber-50 text-amber-700 border-amber-200';
  if (status === 'funded') statusBadge = 'bg-blue-50 text-blue-700 border-blue-200';
  if (status === 'active' || status === 'completed') statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'cancelled' || status === 'terminated' || status === 'disputed') statusBadge = 'bg-red-50 text-red-700 border-red-200';

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <button onClick={() => router.back()} className="text-xs text-gray-500 hover:text-gray-900 mb-2 inline-block transition-colors">
            ← Back to Leases
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <FileSignature className="w-6 h-6 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Lease Agreement</h1>
            <span className={cn("px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded-full border", statusBadge)}>
              {status}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <FileText size={14} className="text-gray-400" />
            <p className="text-xs font-mono text-gray-600">ID: <span className="text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{lease.id}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-full">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-xs font-medium text-emerald-700">Escrow Protected</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Lease Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 rounded-lg">
                <FileText size={16} className="text-emerald-500" />
              </div>
              <h3 className="font-semibold text-gray-900">Terms & Financials</h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign size={12} className="text-emerald-500" /> Monthly Rent
                </p>
                <p className="font-bold text-xl text-gray-900">{lease.monthlyRent.toLocaleString()} {lease.currency}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Wallet size={12} className="text-emerald-500" /> Security Deposit
                </p>
                <p className="font-bold text-xl text-gray-900">{lease.depositAmount.toLocaleString()} {lease.currency}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={12} className="text-emerald-500" /> Start Date
                </p>
                <p className="font-medium text-gray-900">{new Date(lease.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={12} className="text-emerald-500" /> End Date
                </p>
                <p className="font-medium text-gray-900">{new Date(lease.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={14} className="text-emerald-500" />
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Additional Terms</p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {lease.terms || 'Standard lease terms apply.'}
                </p>
              </div>
            </div>
          </div>

          {/* Escrow Verification Panel */}
          {escrow && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-lg border border-slate-700 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                  <Wallet className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-white">On-Chain Escrow Verification</h3>
                <span className="ml-auto px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-mono rounded-full border border-emerald-500/30">
                  Active
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider mb-1">Contract Status</p>
                  <p className="font-mono text-emerald-400">{escrow.status}</p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider mb-1">Balance</p>
                  <p className="font-mono text-white">{escrow.balance}</p>
                </div>
                <div className="col-span-2 bg-white/5 p-3 rounded-xl border border-white/10">
                  <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider mb-1">Contract Address</p>
                  <p className="font-mono text-xs break-all text-slate-300">{escrow.contractAddress}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Actions Panel */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 rounded-lg">
                <ShieldCheck size={16} className="text-emerald-500" />
              </div>
              <h3 className="font-semibold text-gray-900">Lease Actions</h3>
            </div>

            {/* DRAFT STATE */}
            {status === 'draft' && (isOwner || isAdmin) && (
              <div className="space-y-3">
                <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  The lease is currently a draft. Propose it to the tenant to move forward.
                </p>
                <button
                  onClick={() => propose(lease.id)}
                  disabled={proposing}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-lg disabled:opacity-50"
                >
                  {proposing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Propose Lease'}
                </button>
              </div>
            )}

            {status === 'draft' && isTenant && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center">
                <p className="text-xs text-amber-700">Waiting for the property owner to propose the lease draft.</p>
              </div>
            )}

            {/* PROPOSED STATE */}
            {status === 'proposed' && (
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-700 flex items-start gap-2">
                  <ShieldCheck size={14} className="shrink-0 mt-0.5 text-blue-500" />
                  <p>Lease has been proposed. The next step is funding the smart contract escrow.</p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => fund(lease.id)}
                    disabled={funding}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-lg disabled:opacity-50"
                  >
                    {funding ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Fund Escrow (Admin)'}
                  </button>
                )}
                <button
                  onClick={() => cancel(lease.id)}
                  disabled={cancelling}
                  className="w-full py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-semibold transition-all"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Lease'}
                </button>
              </div>
            )}

            {/* FUNDED STATE */}
            {status === 'funded' && (
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs">
                  <div className="p-0.5 bg-emerald-100 rounded-full shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  </div>
                  <p className="text-emerald-700">Escrow is funded! The lease is ready to be activated, which will release the first month rent to the landlord.</p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => activate(lease.id)}
                    disabled={activating}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-lg disabled:opacity-50"
                  >
                    {activating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Activate Lease (Admin)'}
                  </button>
                )}
              </div>
            )}

            {/* ACTIVE STATE */}
            {status === 'active' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <div className="p-0.5 bg-emerald-100 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-semibold text-emerald-700">Lease is Active</span>
                </div>
                
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to flag a dispute?')) dispute(lease.id);
                  }}
                  disabled={disputing}
                  className="w-full py-2.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Flag Dispute
                </button>

                {isAdmin && (
                  <div className="pt-4 border-t border-gray-100 space-y-2 mt-4">
                    <p className="text-[10px] uppercase font-semibold text-gray-400 mb-2 tracking-wider">Admin Actions</p>
                    <button
                      onClick={() => {
                        if (confirm('Complete lease and refund deposit to tenant?')) complete(lease.id);
                      }}
                      disabled={completing}
                      className="w-full py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-semibold transition-all"
                    >
                      {completing ? 'Processing...' : 'Complete Lease'}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Terminate lease and release deposit to landlord?')) terminate(lease.id);
                      }}
                      disabled={terminating}
                      className="w-full py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-semibold transition-all"
                    >
                      {terminating ? 'Processing...' : 'Terminate Lease'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* DISPUTED STATE */}
            {status === 'disputed' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-red-50 to-orange-50 text-red-700 p-4 rounded-xl border border-red-200 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <div className="p-1 bg-red-100 rounded-full">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                    Lease Disputed
                  </div>
                  <p className="text-xs text-red-600">This lease has been flagged for dispute. An administrator will review and resolve it.</p>
                </div>

                {isAdmin && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-[10px] uppercase font-semibold text-gray-400 mb-2 tracking-wider">Resolve Dispute</p>
                    <LeaseDisputeResolver leaseId={lease.id} />
                  </div>
                )}
              </div>
            )}

            {/* TERMINAL STATES */}
            {(status === 'completed' || status === 'terminated' || status === 'cancelled') && (
              <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center justify-center gap-2 mb-1">
                  {status === 'completed' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                  {(status === 'terminated' || status === 'cancelled') && <XCircle className="w-5 h-5 text-red-500" />}
                </div>
                <p className="text-sm font-medium text-gray-700 capitalize">Lease is {status}</p>
                <p className="text-xs text-gray-400 mt-1">No further actions can be taken.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-component for resolving disputes ───────────────────────────
function LeaseDisputeResolver({ leaseId }: { leaseId: string }) {
  const { mutate: resolve, isPending } = useResolveDispute();
  const [decision, setDecision] = React.useState<'release_deposit' | 'refund_deposit' | 'cancel'>('refund_deposit');
  const [note, setNote] = React.useState('');

  return (
    <div className="space-y-3">
      <select 
        value={decision}
        onChange={e => setDecision(e.target.value as any)}
        className="w-full text-sm text-gray-900 p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white transition-all"
      >
        <option value="refund_deposit">Refund Deposit (To Tenant)</option>
        <option value="release_deposit">Release Deposit (To Landlord)</option>
        <option value="cancel">Cancel Lease (Return Funds)</option>
      </select>
      
      <textarea 
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Resolution notes..."
        style={{ color: '#111827' }}
        className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none h-20 bg-gray-50 transition-all"
      />
      
      <button
        onClick={() => resolve({ id: leaseId, payload: { decision, note }})}
        disabled={isPending}
        className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-lg disabled:opacity-50"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirm Resolution'}
      </button>
    </div>
  );
}