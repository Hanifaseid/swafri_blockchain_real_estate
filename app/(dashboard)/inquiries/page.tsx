'use client';

import { useState } from 'react';
import { MessageSquare, Loader2, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useMyInquiries, useReceivedInquiries, useUpdateInquiry } from '@/features/inquiries/queries/inquiry.queries';
import type { Inquiry, InquiryStatus } from '@/features/inquiries/types/inquiry.types';
import { getInquiryListingTitle, getInquirerName } from '@/features/inquiries/types/inquiry.types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const STATUS_STYLE: Record<string, string> = {
  open:          'bg-amber-50 text-amber-600',
  responded:     'bg-emerald-50 text-emerald-600',
  in_discussion: 'bg-blue-50 text-blue-600',
  closed:        'bg-gray-100 text-gray-500',
  spam:          'bg-red-50 text-red-500',
};

export default function InquiriesPage() {
  const { currentUser } = useAuthStore();
  if (!currentUser) return null;

  const isOwner = currentUser.role === 'PROPERTY_OWNER';
  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-6 h-6 text-emerald-500 shrink-0" />
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">Communication</p>
          <h1 className="text-2xl font-light text-[#0f172a] tracking-tight">Inquiries</h1>
        </div>
      </div>

      {isOwner || isAdmin ? <OwnerView /> : <TenantView />}
    </div>
  );
}

// ─── Tenant: My sent inquiries ────────────────────────────────────────────────

function TenantView() {
  const { data: inquiries = [], isLoading } = useMyInquiries();

  if (isLoading) return <LoadingSpinner />;

  if (inquiries.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
        <MessageSquare className="w-10 h-10 text-black/15 mx-auto mb-3" />
        <p className="text-sm text-black/40 font-light mb-2">No inquiries sent yet.</p>
        <p className="text-xs text-black/30">Browse properties and send an inquiry from a listing page.</p>
        <Link href="/properties" className="inline-block mt-4 text-xs text-emerald-500 hover:text-emerald-600 font-medium">Browse Properties →</Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-black/35 font-mono">{inquiries.length} inquiries sent</p>
      {inquiries.map((inq) => <InquiryCard key={inq.id} inquiry={inq} mode="sent" />)}
    </div>
  );
}

// ─── Owner/Admin: Received inquiries ─────────────────────────────────────────

function OwnerView() {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const { data: received = [], isLoading: loadingRec } = useReceivedInquiries();
  const { data: sent     = [], isLoading: loadingSent } = useMyInquiries();

  const isLoading = activeTab === 'received' ? loadingRec : loadingSent;
  const items     = activeTab === 'received' ? received   : sent;

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        {(['received', 'sent'] as const).map((tab) => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)}
            className={cn('text-xs font-medium px-4 py-2 rounded-lg capitalize transition-all',
              activeTab === tab ? 'bg-white text-black shadow-sm' : 'text-black/50 hover:text-black/70')}>
            {tab === 'received' ? 'Received' : 'Sent'}
          </button>
        ))}
      </div>

      {isLoading ? <LoadingSpinner /> : items.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <MessageSquare className="w-10 h-10 text-black/15 mx-auto mb-3" />
          <p className="text-sm text-black/40 font-light">No {activeTab} inquiries.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-black/35 font-mono">{items.length} inquiries</p>
          {items.map((inq) => <InquiryCard key={inq.id} inquiry={inq} mode={activeTab === 'received' ? 'received' : 'sent'} />)}
        </div>
      )}
    </div>
  );
}

// ─── Inquiry Card ─────────────────────────────────────────────────────────────

function InquiryCard({ inquiry, mode }: { inquiry: Inquiry; mode: 'sent' | 'received' }) {
  const [expanded, setExpanded] = useState(false);
  const [responseText, setResponseText] = useState(inquiry.response ?? '');
  const [newStatus, setNewStatus] = useState<InquiryStatus>(inquiry.status);
  const { mutate: update, isPending } = useUpdateInquiry(inquiry.id);

  const listingTitle = getInquiryListingTitle(inquiry);
  const listingId    = typeof inquiry.listing === 'string' ? inquiry.listing : inquiry.listing?.id;
  const inquirerName = getInquirerName(inquiry);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-4 cursor-pointer" onClick={() => setExpanded((v) => !v)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={cn('text-[10px] font-mono uppercase px-2 py-0.5 rounded', STATUS_STYLE[inquiry.status] ?? 'bg-gray-100 text-gray-500')}>{inquiry.status}</span>
            <span className="text-[10px] font-mono uppercase bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{inquiry.inquiryType}</span>
          </div>
          <p className="text-sm font-medium text-black/80 truncate">
            {mode === 'received' ? `From: ${inquirerName}` : `Re: ${listingTitle}`}
          </p>
          <p className="text-xs text-black/40 mt-0.5 truncate">{inquiry.message}</p>
        </div>
        <div className="flex items-center gap-2 ml-3 shrink-0">
          <span className="text-[10px] text-black/30 font-mono">{new Date(inquiry.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
          {expanded ? <ChevronUp size={14} className="text-black/30" /> : <ChevronDown size={14} className="text-black/30" />}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
          {/* Listing link */}
          {listingId && (
            <Link href={`/properties/${listingId}`} className="text-xs text-emerald-500 hover:text-emerald-600 font-mono">
              View Listing: {listingTitle} →
            </Link>
          )}

          {/* Original message */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-1.5">Message</p>
            <p className="text-sm text-black/70 leading-relaxed bg-gray-50 rounded-xl p-3">{inquiry.message}</p>
          </div>

          {/* Owner's existing response */}
          {inquiry.response && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-1.5">Response</p>
              <p className="text-sm text-black/70 leading-relaxed bg-emerald-50 rounded-xl p-3">{inquiry.response}</p>
            </div>
          )}

          {/* Owner: respond form */}
          {mode === 'received' && (
            <div className="space-y-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">
                {inquiry.response ? 'Update Response' : 'Write Response'}
              </p>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={3}
                placeholder="Type your response…"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-black/70 placeholder:text-black/25 focus:outline-none focus:border-emerald-400 resize-none"
              />
              <div className="flex items-center justify-between gap-3">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as InquiryStatus)}
                  className="h-9 rounded-lg border border-gray-200 px-3 text-sm text-black/70 bg-white focus:outline-none focus:border-emerald-400"
                >
                  {(['open','responded','in_discussion','closed'] as InquiryStatus[]).map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={isPending || (!responseText.trim() && newStatus === inquiry.status)}
                  onClick={() => update({ response: responseText.trim() || undefined, status: newStatus })}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                  {isPending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  {inquiry.response ? 'Update' : 'Send Response'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LoadingSpinner() {
  return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>;
}
