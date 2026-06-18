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
import { FileSignature, Loader2, ArrowLeft, ShieldCheck, AlertTriangle, CheckCircle2, Wallet } from 'lucide-react';
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
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button onClick={() => router.back()} className="text-xs text-black/40 hover:text-black mb-2 inline-block">
            ← Back to Leases
          </button>
          <div className="flex items-center gap-3">
            <FileSignature className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Lease Agreement</h1>
            <span className={cn("px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded-lg border", statusBadge)}>
              {status}
            </span>
          </div>
          <p className="text-xs font-mono text-gray-500 mt-2">ID: {lease.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Lease Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">Terms & Financials</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Monthly Rent</p>
                <p className="font-medium text-lg">{lease.monthlyRent.toLocaleString()} {lease.currency}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Security Deposit</p>
                <p className="font-medium text-lg">{lease.depositAmount.toLocaleString()} {lease.currency}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Start Date</p>
                <p className="font-medium">{new Date(lease.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">End Date</p>
                <p className="font-medium">{new Date(lease.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Additional Terms</p>
              <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 whitespace-pre-wrap font-mono">
                {lease.terms || 'Standard lease terms apply.'}
              </div>
            </div>
          </div>

          {/* Escrow Verification Panel */}
          {escrow && (
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-emerald-50">On-Chain Escrow Verification</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400 text-xs mb-1">Contract Status</p>
                  <p className="font-mono">{escrow.status}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Balance</p>
                  <p className="font-mono">{escrow.balance}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-400 text-xs mb-1">Contract Address</p>
                  <p className="font-mono text-xs break-all text-slate-300">{escrow.contractAddress}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Actions Panel */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900">Lease Actions</h3>

            {/* DRAFT STATE */}
            {status === 'draft' && (isOwner || isAdmin) && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">The lease is currently a draft. Propose it to the tenant to move forward.</p>
                <button
                  onClick={() => propose(lease.id)}
                  disabled={proposing}
                  className="w-full py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {proposing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Propose Lease'}
                </button>
              </div>
            )}

            {status === 'draft' && isTenant && (
              <p className="text-xs text-gray-500 text-center py-4">Waiting for the property owner to propose the lease draft.</p>
            )}

            {/* PROPOSED STATE */}
            {status === 'proposed' && (
              <div className="space-y-3">
                <p className="text-xs text-blue-600 bg-blue-50 p-3 rounded-xl border border-blue-100">
                  Lease has been proposed. The next step is funding the smart contract escrow.
                </p>
                {isAdmin && (
                  <button
                    onClick={() => fund(lease.id)}
                    disabled={funding}
                    className="w-full py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {funding ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Fund Escrow (Admin)'}
                  </button>
                )}
                <button
                  onClick={() => cancel(lease.id)}
                  disabled={cancelling}
                  className="w-full py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Lease'}
                </button>
              </div>
            )}

            {/* FUNDED STATE */}
            {status === 'funded' && (
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>Escrow is funded! The lease is ready to be activated, which will release the first month's rent to the landlord.</p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => activate(lease.id)}
                    disabled={activating}
                    className="w-full py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {activating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Activate Lease (Admin)'}
                  </button>
                )}
              </div>
            )}

            {/* ACTIVE STATE */}
            {status === 'active' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-semibold">Lease is Active</span>
                </div>
                
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to flag a dispute?')) dispute(lease.id);
                  }}
                  disabled={disputing}
                  className="w-full py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Flag Dispute
                </button>

                {isAdmin && (
                  <div className="pt-4 border-t border-gray-100 space-y-2 mt-4">
                    <p className="text-[10px] uppercase font-semibold text-gray-500 mb-2">Admin Actions</p>
                    <button
                      onClick={() => {
                        if (confirm('Complete lease and refund deposit to tenant?')) complete(lease.id);
                      }}
                      disabled={completing}
                      className="w-full py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {completing ? 'Processing...' : 'Complete Lease'}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Terminate lease and release deposit to landlord?')) terminate(lease.id);
                      }}
                      disabled={terminating}
                      className="w-full py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
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
                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    Lease Disputed
                  </div>
                  <p className="text-xs">This lease has been flagged for dispute. An administrator will review and resolve it.</p>
                </div>

                {isAdmin && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-[10px] uppercase font-semibold text-gray-500 mb-2">Resolve Dispute</p>
                    <LeaseDisputeResolver leaseId={lease.id} />
                  </div>
                )}
              </div>
            )}

            {/* TERMINAL STATES */}
            {(status === 'completed' || status === 'terminated' || status === 'cancelled') && (
              <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-sm font-medium text-gray-600">Lease is {status}</p>
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
        className="w-full text-sm p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 bg-white"
      >
        <option value="refund_deposit">Refund Deposit (To Tenant)</option>
        <option value="release_deposit">Release Deposit (To Landlord)</option>
        <option value="cancel">Cancel Lease (Return Funds)</option>
      </select>
      
      <textarea 
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Resolution notes..."
        className="w-full p-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 resize-none h-20"
      />
      
      <button
        onClick={() => resolve({ id: leaseId, payload: { decision, note }})}
        disabled={isPending}
        className="w-full py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
      >
        {isPending ? 'Resolving...' : 'Confirm Resolution'}
      </button>
    </div>
  );
}
