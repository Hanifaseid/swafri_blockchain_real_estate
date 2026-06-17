'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
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
  Users, Briefcase, CheckCircle2, XCircle, Clock, ShieldCheck 
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
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button onClick={() => router.back()} className="text-xs text-black/40 hover:text-black mb-2 inline-block">
            ← Back to Applications
          </button>
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-emerald-500" />
            <h1 className="text-2xl font-light text-[#0f172a] tracking-tight">Application #{app.id.slice(-6)}</h1>
            <span className={cn(
              "px-3 py-1 text-xs font-mono uppercase rounded-lg border",
              normalizedStatus === 'APPROVED' ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
              normalizedStatus === 'REJECTED' || normalizedStatus === 'WITHDRAWN' ? "bg-red-50 border-red-200 text-red-700" :
              "bg-amber-50 border-amber-200 text-amber-700"
            )}>
              {app.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-sm text-black/50 mt-1">For Listing ID: <span className="font-mono text-xs">{app.listingId}</span></p>
        </div>
        
        {isTenant && isActive && normalizedStatus !== 'APPROVED' && (
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to withdraw this application?')) {
                withdraw(app.id, { onSuccess: () => router.push('/applications') });
              }
            }}
            disabled={withdrawing}
            className="px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-800 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {withdrawing ? <Loader2 size={16} className="animate-spin inline" /> : 'Withdraw Application'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200">
            <h3 className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-4">Applicant Details</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-mono text-black/40 mb-1 flex items-center gap-1"><Calendar size={12}/> Dates</p>
                <p className="text-sm">{app.desiredStartDate} to {app.desiredEndDate}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-black/40 mb-1 flex items-center gap-1"><Users size={12}/> Occupants</p>
                <p className="text-sm">{app.occupants} Person(s)</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-black/40 mb-1 flex items-center gap-1"><DollarSign size={12}/> Income</p>
                <p className="text-sm font-medium">${app.monthlyIncome.toLocaleString()} / mo</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-black/40 mb-1 flex items-center gap-1"><Briefcase size={12}/> Employer</p>
                <p className="text-sm">{app.employer || 'N/A'}</p>
              </div>
            </div>
            {app.message && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-[10px] font-mono text-black/40 mb-2">Message to Owner</p>
                <p className="text-sm text-black/70 italic bg-gray-50 p-4 rounded-xl">"{app.message}"</p>
              </div>
            )}
          </div>

          {/* Screening Results View */}
          {app.screeningProvider && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
               <h3 className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-4 flex items-center gap-2"><ShieldCheck size={14}/> Screening Results</h3>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <p className="text-[10px] font-mono text-black/40 mb-1">Provider</p>
                   <p className="text-sm">{app.screeningProvider}</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-mono text-black/40 mb-1">Score</p>
                   <p className="text-sm">{app.screeningScore || 'N/A'}</p>
                 </div>
               </div>
            </div>
          )}
        </div>

        {/* Right Column: Owner Actions */}
        <div className="space-y-6">
          {canReview && (
             <OwnerActionsPanel app={app} />
          )}
          
          {isTenant && normalizedStatus === 'APPROVED' && (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl shadow-sm text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-emerald-900 mb-2">Application Approved!</h3>
              <p className="text-sm text-emerald-700 leading-relaxed">
                Congratulations, the property owner has approved your rental application. 
                They are currently drafting the formal lease agreement. You will be notified once it is ready for your signature and funding.
              </p>
            </div>
          )}

          {!isOwner && app.adminNote && (
            <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">Message from Owner</h4>
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
  const { mutate: review, isPending: reviewing } = useReviewRentalApplication();
  const { mutate: updateScreening, isPending: screening } = useUpdateScreening();
  const { mutate: createLease, isPending: leasing } = useCreateLeaseFromApplication();
  
  const [note, setNote] = React.useState('');
  const [actionStep, setActionStep] = React.useState<'review'|'screening'|'lease'>('review');

  const normalizedStatus = (app.status || '').toUpperCase();

  if (normalizedStatus === 'APPROVED') {
    return (
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-black/80 flex items-center gap-2">
          <CheckCircle2 className="text-emerald-500" size={16}/> Application Approved
        </h3>
        <p className="text-xs text-black/50 leading-relaxed">
          You have approved this tenant. The next step is to generate a lease agreement.
        </p>
        <button 
          onClick={() => setActionStep('lease')}
          className="w-full py-2.5 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Draft Lease Agreement
        </button>
        
        {actionStep === 'lease' && (
          <div className="pt-4 border-t border-gray-100 space-y-3">
             <button 
              onClick={() => createLease({
                id: app.id,
                payload: {
                  monthlyRent: app.monthlyIncome > 3000 ? 1500 : 1000, // mock payload logic
                  depositAmount: 1500,
                  currency: 'USD',
                  startDate: app.desiredStartDate,
                  endDate: app.desiredEndDate,
                  terms: 'Standard 1 year lease terms apply.'
                }
              })}
              disabled={leasing}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg"
             >
               {leasing ? 'Processing...' : 'Confirm & Generate Lease'}
             </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
      <h3 className="text-sm font-semibold text-black/80">Owner Review</h3>
      
      {normalizedStatus !== 'APPROVED' && normalizedStatus !== 'SCREENING' && (
        <div className="space-y-3">
          <textarea 
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Optional note to tenant..."
            className="w-full p-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 resize-none h-20"
          />
          <div className="grid grid-cols-2 gap-2">
            <button 
              disabled={reviewing}
              onClick={() => review({ id: app.id, payload: { status: 'screening', note }})}
              className="py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-semibold"
            >
              Start Screening
            </button>
            <button 
              disabled={reviewing}
              onClick={() => review({ id: app.id, payload: { status: 'approved', note }})}
              className="py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl text-xs font-semibold"
            >
              Direct Approve
            </button>
          </div>
          <button 
            disabled={reviewing}
            onClick={() => review({ id: app.id, payload: { status: 'rejected', note }})}
            className="w-full py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-semibold mt-2"
          >
            Reject Application
          </button>
        </div>
      )}

      {normalizedStatus === 'SCREENING' && (
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-xl flex gap-2">
            <ShieldCheck size={14} className="shrink-0"/>
            Awaiting background screening results.
          </div>
          <button 
            disabled={screening}
            onClick={() => updateScreening({ id: app.id, payload: { status: 'passed', provider: 'TransUnion', score: 750, reference: 'REF-' + Date.now(), notes: 'Background check cleared successfully' }})}
            className="w-full py-2 bg-black text-white hover:bg-gray-800 rounded-xl text-xs font-semibold disabled:opacity-50"
          >
            {screening ? 'Updating...' : 'Update Screening (Passed)'}
          </button>
          
          <div className="pt-4 border-t border-gray-100 mt-2 space-y-2">
            <p className="text-[10px] uppercase font-semibold tracking-wider text-gray-500 mb-2">Final Decision</p>
            <div className="grid grid-cols-2 gap-2">
              <button 
                disabled={reviewing}
                onClick={() => review({ id: app.id, payload: { status: 'approved', note: 'Screening passed, application approved.' }})}
                className="py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl text-xs font-semibold"
              >
                Approve Application
              </button>
              <button 
                disabled={reviewing}
                onClick={() => review({ id: app.id, payload: { status: 'rejected', note: 'Screening failed.' }})}
                className="py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-semibold"
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
