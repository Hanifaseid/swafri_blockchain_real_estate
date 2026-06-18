'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import { 
  useRentalApplication, 
  useWithdrawRentalApplication,
  useReviewRentalApplication,
  useUpdateScreening,
  useUpdateAppointment,
  useCreateLeaseFromApplication
} from '@/features/rental-applications/queries/rental-application.queries';
import { 
  FileText, Loader2, Calendar, MapPin, DollarSign, 
  Users, Briefcase, CheckCircle2, XCircle, Clock, ShieldCheck,
  Building2, Mail, Phone, User, Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const { currentUser } = useAuthStore();
  
  const { data: app, isLoading } = useRentalApplication(id);
  const { mutate: withdraw, isPending: withdrawing } = useWithdrawRentalApplication();
  
  const isTenant = currentUser?.role === 'TENANT';
  const isOwner = ['PROPERTY_OWNER', 'ADMIN', 'SUPER_ADMIN'].includes(currentUser?.role || '');

  if (!currentUser) return null;
  
  if (isLoading) return (
    <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
  );
  
  if (!app) return (
    <div className="p-8 text-center text-red-500">Application not found</div>
  );

  const normalizedStatus = (app.status || '').toUpperCase();
  const isActive = normalizedStatus !== 'WITHDRAWN' && normalizedStatus !== 'REJECTED';
  const canReview = isOwner && isActive;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6 bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <button onClick={() => router.back()} className="text-xs text-gray-500 hover:text-gray-900 mb-2 inline-block transition-colors">
            ← Back to Applications
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <FileText className="w-6 h-6 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Application #{app.id.slice(-6)}</h1>
            <span className={cn(
              "px-3 py-1 text-xs font-medium uppercase rounded-full border",
              normalizedStatus === 'APPROVED' ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
              normalizedStatus === 'REJECTED' || normalizedStatus === 'WITHDRAWN' ? "bg-red-50 border-red-200 text-red-700" :
              "bg-amber-50 border-amber-200 text-amber-700"
            )}>
              {app.status.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Home size={14} className="text-gray-400" />
            <p className="text-sm text-gray-600">Listing ID: <span className="font-mono text-xs text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{app.listingId}</span></p>
          </div>
        </div>
        
        {isTenant && isActive && normalizedStatus !== 'APPROVED' && (
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to withdraw this application?')) {
                withdraw(app.id, { onSuccess: () => router.push('/applications') });
              }
            }}
            disabled={withdrawing}
            className="px-6 py-2.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded-xl font-medium transition-all hover:shadow-lg disabled:opacity-50"
          >
            {withdrawing ? <Loader2 size={16} className="animate-spin inline" /> : 'Withdraw Application'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 bg-emerald-50 rounded-lg">
                <User size={16} className="text-emerald-500" />
              </div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Applicant Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={12} className="text-emerald-500" /> Dates
                </p>
                <p className="text-sm font-medium text-gray-900">{app.desiredStartDate} → {app.desiredEndDate}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users size={12} className="text-emerald-500" /> Occupants
                </p>
                <p className="text-sm font-medium text-gray-900">{app.occupants} Person(s)</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign size={12} className="text-emerald-500" /> Monthly Income
                </p>
                <p className="text-sm font-bold text-gray-900">${app.monthlyIncome.toLocaleString()} / mo</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase size={12} className="text-emerald-500" /> Employer
                </p>
                <p className="text-sm font-medium text-gray-900">{app.employer || 'N/A'}</p>
              </div>
            </div>
            {app.message && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Mail size={14} className="text-emerald-500" />
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Message to Owner</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100">
                  <p className="text-sm text-gray-700 italic">"{app.message}"</p>
                </div>
              </div>
            )}
          </div>

          {/* Screening Results View */}
          {app.screeningProvider && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-emerald-50 rounded-lg">
                  <ShieldCheck size={16} className="text-emerald-500" />
                </div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Screening Results</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Provider</p>
                  <p className="text-sm font-medium text-gray-900">{app.screeningProvider}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Score</p>
                  <p className="text-sm font-bold text-emerald-600">{app.screeningScore || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Owner Actions */}
        <div className="space-y-6">
          {/* View Lease Banner — visible to ALL roles when a lease exists */}
          {(app.leaseId || (app as any).lease?.id) && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-lg border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                  <FileText className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">Lease Agreement Created</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                A formal lease agreement has been generated from this application.
              </p>
              <Link
                href={`/leases/${app.leaseId || (app as any).lease?.id}`}
                className="w-full block text-center py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-lg"
              >
                Open Lease →
              </Link>
              <p className="text-[10px] text-slate-500 font-mono text-center mt-2">
                ID: {app.leaseId || (app as any).lease?.id}
              </p>
            </div>
          )}

          {canReview && (
             <OwnerActionsPanel app={app} />
          )}
          
          {isTenant && normalizedStatus === 'APPROVED' && !(app.leaseId || (app as any).lease?.id) && (
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 p-6 rounded-2xl shadow-sm text-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-emerald-900 mb-2">Application Approved! 🎉</h3>
              <p className="text-sm text-emerald-700 leading-relaxed">
                Congratulations! The property owner has approved your application and is drafting the lease agreement.
              </p>
            </div>
          )}

          {!isOwner && app.adminNote && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Mail size={14} className="text-amber-600" />
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Message from Owner</h4>
              </div>
              <p className="text-sm text-amber-900">{app.adminNote}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Owner Actions Panel ──────────────────────────────────────────────────────

function OwnerActionsPanel({ app }: { app: any }) {
  const router = useRouter();
  const { mutate: review, isPending: reviewing } = useReviewRentalApplication();
  const { mutate: updateScreening, isPending: screening } = useUpdateScreening();
  const { mutate: createLease, isPending: leasing } = useCreateLeaseFromApplication();
  
  const [note, setNote] = React.useState('');
  const [showLeaseForm, setShowLeaseForm] = React.useState(false);
  const [leaseForm, setLeaseForm] = React.useState({
    monthlyRent: '',
    depositAmount: '',
    currency: 'USD',
    startDate: app.desiredStartDate || '',
    endDate: app.desiredEndDate || '',
    terms: 'Standard residential lease agreement terms apply. Tenant agrees to maintain the property in good condition.',
  });

  const normalizedStatus = (app.status || '').toUpperCase();

  if (normalizedStatus === 'APPROVED') {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-50 rounded-lg">
            <CheckCircle2 className="text-emerald-500" size={16} />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">Application Approved</h3>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          This tenant has been approved. Draft and send the formal lease agreement to proceed.
        </p>

        {!showLeaseForm ? (
          <button 
            onClick={() => setShowLeaseForm(true)}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-sm font-medium rounded-xl transition-all hover:shadow-lg"
          >
            Draft Lease Agreement
          </button>
        ) : (
          <div className="pt-4 border-t border-gray-100 space-y-4">
            <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Lease Terms</p>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Monthly Rent</label>
                <input
                  type="number"
                  value={leaseForm.monthlyRent}
                  onChange={e => setLeaseForm(f => ({ ...f, monthlyRent: e.target.value }))}
                  placeholder="e.g. 1500"
                  className="w-full px-3 py-2 text-sm text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Deposit Amount</label>
                <input
                  type="number"
                  value={leaseForm.depositAmount}
                  onChange={e => setLeaseForm(f => ({ ...f, depositAmount: e.target.value }))}
                  placeholder="e.g. 3000"
                  className="w-full px-3 py-2 text-sm text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Start Date</label>
                <input
                  type="date"
                  value={leaseForm.startDate}
                  onChange={e => setLeaseForm(f => ({ ...f, startDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">End Date</label>
                <input
                  type="date"
                  value={leaseForm.endDate}
                  onChange={e => setLeaseForm(f => ({ ...f, endDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Currency</label>
                <select
                  value={leaseForm.currency}
                  onChange={e => setLeaseForm(f => ({ ...f, currency: e.target.value }))}
                  className="w-full px-3 py-2 text-sm text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                >
                  <option value="USD">USD</option>
                  <option value="USDC">USDC</option>
                  <option value="ETH">ETH</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Terms & Conditions</label>
              <textarea
                value={leaseForm.terms}
                onChange={e => setLeaseForm(f => ({ ...f, terms: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 text-sm text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none transition-all"
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => setShowLeaseForm(false)}
                className="flex-1 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (!leaseForm.monthlyRent || !leaseForm.depositAmount) {
                    return;
                  }
                  createLease({
                    id: app.id,
                    payload: {
                      monthlyRent: Number(leaseForm.monthlyRent),
                      depositAmount: Number(leaseForm.depositAmount),
                      currency: leaseForm.currency,
                      startDate: leaseForm.startDate,
                      endDate: leaseForm.endDate,
                      terms: leaseForm.terms,
                    }
                  }, {
                    onSuccess: (lease) => router.push(`/leases/${lease.id}`)
                  });
                }}
                disabled={leasing || !leaseForm.monthlyRent || !leaseForm.depositAmount}
                className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-semibold rounded-xl disabled:opacity-50 transition-all hover:shadow-lg"
              >
                {leasing ? 'Creating...' : 'Create Lease Draft'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Owner Review</h3>
      
      {normalizedStatus !== 'APPROVED' && normalizedStatus !== 'SCREENING' && (
        <div className="space-y-3">
          <textarea 
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Optional note to tenant..."
            style={{ color: '#111827' }}
            className="w-full p-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none h-20 bg-gray-50 transition-all"
          />
          <div className="grid grid-cols-2 gap-2">
            <button 
              disabled={reviewing}
              onClick={() => review({ id: app.id, payload: { status: 'screening', note }})}
              className="py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-semibold transition-all"
            >
              Start Screening
            </button>
            <button 
              disabled={reviewing}
              onClick={() => review({ id: app.id, payload: { status: 'approved', note }})}
              className="py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl text-xs font-semibold transition-all"
            >
              Direct Approve
            </button>
          </div>
          <button 
            disabled={reviewing}
            onClick={() => review({ id: app.id, payload: { status: 'rejected', note }})}
            className="w-full py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-semibold transition-all"
          >
            Reject Application
          </button>
        </div>
      )}

      {normalizedStatus === 'SCREENING' && (
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-xl flex gap-2 items-center">
            <div className="p-1 bg-blue-100 rounded-full">
              <ShieldCheck size={12} className="text-blue-600" />
            </div>
            Awaiting background screening results.
          </div>
          <button 
            disabled={screening}
            onClick={() => updateScreening({ id: app.id, payload: { status: 'passed', provider: 'TransUnion', score: 750, reference: 'REF-' + Date.now(), notes: 'Background check cleared successfully' }})}
            className="w-full py-2.5 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition-all hover:shadow-lg"
          >
            {screening ? <Loader2 size={14} className="animate-spin inline mr-2" /> : null}
            {screening ? 'Updating...' : 'Update Screening (Passed)'}
          </button>
          
          <div className="pt-4 border-t border-gray-100 mt-2 space-y-2">
            <p className="text-[10px] uppercase font-semibold tracking-wider text-gray-400 mb-2">Final Decision</p>
            <div className="grid grid-cols-2 gap-2">
              <button 
                disabled={reviewing}
                onClick={() => review({ id: app.id, payload: { status: 'approved', note: 'Screening passed, application approved.' }})}
                className="py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl text-xs font-semibold transition-all"
              >
                Approve Application
              </button>
              <button 
                disabled={reviewing}
                onClick={() => review({ id: app.id, payload: { status: 'rejected', note: 'Screening failed.' }})}
                className="py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-semibold transition-all"
              >
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}