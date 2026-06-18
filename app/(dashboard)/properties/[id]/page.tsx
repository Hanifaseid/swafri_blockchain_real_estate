'use client';

import { use, useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Upload, CheckCircle2, XCircle, Clock, AlertCircle,
  Loader2, Building2, MapPin, Bed, Bath, Maximize2, Calendar,
  Image as ImageIcon, FileText, BarChart2, ShieldCheck, Trash2, Star, Send, GripVertical,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { Modal } from '@/components/ui/Modal';
import {
  useListing, useTransitionListing,
  useListingDocuments, useDocumentSignedUrl,
  useUploadPhotos, useDeletePhoto, useSetCoverPhoto, useReorderPhotos,
  useListingAnalytics, useListingTitle,
  useMintTitle, useDisputeTitle, useClearTitleDispute, useRevokeTitle,
} from '@/features/listings/queries/listing.queries';
import { useSendInquiry } from '@/features/inquiries/queries/inquiry.queries';
import { useSubmitOffer } from '@/features/offers/queries/offer.queries';
import type { TransitionAction, RejectionReason } from '@/features/listings/types/listing.types';
import { apiClient } from '@/lib/api/axios-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-500', submitted: 'bg-amber-50 text-amber-600',
  under_review: 'bg-blue-50 text-blue-600', approved: 'bg-emerald-50 text-emerald-700',
  published: 'bg-emerald-100 text-emerald-800', rejected: 'bg-red-50 text-red-600',
  suspended: 'bg-orange-50 text-orange-600', rented: 'bg-sky-50 text-sky-600',
  sold: 'bg-purple-50 text-purple-600', archived: 'bg-gray-100 text-gray-400',
};
const VERIFY_STYLE: Record<string, string> = {
  unverified: 'bg-gray-100 text-gray-500', pending: 'bg-amber-50 text-amber-600',
  verified: 'bg-emerald-50 text-emerald-700', rejected: 'bg-red-50 text-red-600',
  suspended: 'bg-orange-50 text-orange-600',
};

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { currentUser } = useAuthStore();
  const { data: listing, isLoading, refetch } = useListing(id);
  const { mutate: transition, isPending: transitioning } = useTransitionListing(id);
  const { data: docs = [] } = useListingDocuments(id);
  const { data: analytics } = useListingAnalytics(id);
  const { data: titleInfo } = useListingTitle(id);
  const { mutate: getDocUrl } = useDocumentSignedUrl();
  const { mutate: doUploadPhotos, isPending: uploadingPhotos } = useUploadPhotos(id);
  const { mutate: doDeletePhoto } = useDeletePhoto(id);
  const { mutate: doSetCover } = useSetCoverPhoto(id);
  const { mutate: doReorderPhotos } = useReorderPhotos(id);
  const { mutate: doMintTitle, isPending: minting } = useMintTitle(id);
  const { mutate: doDisputeTitle, isPending: disputing } = useDisputeTitle(id);
  const { mutate: doClearDispute } = useClearTitleDispute(id);
  const { mutate: doRevokeTitle } = useRevokeTitle(id);
  const { mutate: doSendInquiry, isPending: sendingInquiry } = useSendInquiry();
  const { mutate: submitOffer, isPending: creatingOffer } = useSubmitOffer();

  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef   = useRef<HTMLInputElement>(null);
  const [showRejectModal, setShowRejectModal]   = useState(false);
  const [rejectReason, setRejectReason]         = useState<RejectionReason>('missing_document');
  const [rejectNote, setRejectNote]             = useState('');
  const [titleAction, setTitleAction]           = useState<'dispute' | 'clear' | 'revoke' | null>(null);
  const [titleReason, setTitleReason]           = useState('');
  const [uploadingDocs, setUploadingDocs]       = useState(false);
  const [showInquiryForm, setShowInquiryForm]   = useState(false);
  const [inquiryMsg, setInquiryMsg]             = useState('');
  const [inquiryType, setInquiryType]           = useState<'rent' | 'buy' | 'general'>('general');
  const [docReviewTarget, setDocReviewTarget]   = useState<string | null>(null);
  const [docReviewDecision, setDocReviewDecision] = useState<'approve' | 'reject'>('approve');
  const [docReviewNote, setDocReviewNote]       = useState('');
  const [reviewingDoc, setReviewingDoc]         = useState(false);
  const [docUploadType, setDocUploadType]       = useState('title_deed');

  // Handle document review (admin only)
  const handleDocReview = async (docId: string, decision: 'approve' | 'reject', note?: string) => {
    setReviewingDoc(true);
    try {
      await apiClient.post(ENDPOINTS.ADMIN.DOC_REVIEW(id, docId), { decision, note });
      toast.success(decision === 'approve' ? 'Document approved.' : 'Document rejected.');
      refetch();
      // Re-fetch docs
    } catch {
      toast.error('Review failed.');
    } finally {
      setReviewingDoc(false);
      setDocReviewTarget(null);
      setDocReviewNote('');
    }
  };
  const [showOfferModal, setShowOfferModal]     = useState(false);
  const [offerAmount, setOfferAmount]           = useState<number>(0);
  const [offerMessage, setOfferMessage]         = useState('');
  const [previewPhotos, setPreviewPhotos]       = useState<{url: string, file: File}[]>([]);
  const [dragIdx, setDragIdx]                   = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx]           = useState<number | null>(null);

  const handleDragStart = useCallback((idx: number) => {
    setDragIdx(idx);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIdx(idx);
  }, []);

  const handleDrop = useCallback((idx: number) => {
    if (dragIdx === null || dragIdx === idx || !listing?.photos) return;
    const photos = [...listing.photos];
    const [moved] = photos.splice(dragIdx, 1);
    photos.splice(idx, 0, moved);
    const order = photos.map(p => p.publicId);
    doReorderPhotos(order);
    setDragIdx(null);
    setDragOverIdx(null);
  }, [dragIdx, listing?.photos, doReorderPhotos]);

  const handleDragEnd = useCallback(() => {
    setDragIdx(null);
    setDragOverIdx(null);
  }, []);

  useEffect(() => {
    if (listing?.price) setOfferAmount(listing.price);
  }, [listing?.price]);

  if (!currentUser) return null;
  const role    = currentUser.role;
  const isOwner = role === 'PROPERTY_OWNER' || listing?.createdBy === currentUser.id;
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>;
  if (!listing)  return <div className="p-8 text-center"><p className="text-sm text-black/40">Listing not found.</p><Link href="/properties" className="text-emerald-500 text-sm mt-3 inline-block">← Back</Link></div>;

  const coverPhoto = listing.photos?.find((p) => p.isCover) ?? listing.photos?.[0];
  const price = listing.listingType === 'rent' ? `$${listing.monthlyRent?.toLocaleString()}/mo` : `$${listing.price?.toLocaleString()}`;

  const ownerActions: { action: TransitionAction; label: string; style: string }[] = [];
  if (isOwner) {
    if (listing.status === 'draft' || listing.status === 'rejected') ownerActions.push({ action: 'submit', label: 'Submit for Review', style: 'bg-emerald-600 hover:bg-emerald-700 text-white' });
    if (listing.status === 'published') {
      ownerActions.push({ action: 'mark_rented', label: 'Mark Rented', style: 'bg-sky-600 hover:bg-sky-700 text-white' });
      ownerActions.push({ action: 'mark_sold',   label: 'Mark Sold',   style: 'bg-purple-600 hover:bg-purple-700 text-white' });
    }
    if (listing.status === 'rented') ownerActions.push({ action: 'unmark_rented', label: 'Unmark Rented', style: 'border border-gray-300 text-black/60 hover:bg-gray-50' });
    if (listing.status === 'sold')   ownerActions.push({ action: 'unmark_sold',   label: 'Unmark Sold',   style: 'border border-gray-300 text-black/60 hover:bg-gray-50' });
    if (listing.status !== 'archived') ownerActions.push({ action: 'archive', label: 'Archive', style: 'border border-gray-300 text-red-500 hover:bg-red-50' });
  }

  const adminActions: { action: TransitionAction; label: string; style: string }[] = [];
  if (isAdmin) {
    if (listing.status === 'submitted')    adminActions.push({ action: 'start_review', label: 'Start Review', style: 'bg-blue-600 hover:bg-blue-700 text-white' });
    if (listing.status === 'under_review') {
      adminActions.push({ action: 'approve', label: 'Approve', style: 'bg-emerald-600 hover:bg-emerald-700 text-white' });
      adminActions.push({ action: 'reject',  label: 'Reject',  style: 'bg-red-600 hover:bg-red-700 text-white' });
    }
    if (listing.status === 'approved')  adminActions.push({ action: 'publish',   label: 'Publish',   style: 'bg-emerald-700 hover:bg-emerald-800 text-white' });
    if (listing.status === 'published') adminActions.push({ action: 'suspend',   label: 'Suspend',   style: 'bg-orange-600 hover:bg-orange-700 text-white' });
    if (listing.status === 'suspended') adminActions.push({ action: 'unsuspend', label: 'Unsuspend', style: 'bg-gray-700 hover:bg-gray-800 text-white' });
  }

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingDocs(true);
    try {
      const form = new FormData();
      form.append('type', docUploadType);
      files.forEach((f) => form.append('documents', f));
      await apiClient.post(ENDPOINTS.LISTINGS.UPLOAD_DOCS(id), form, { 
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 0 
      });
      toast.success('Documents uploaded.');
      refetch();
    } catch { toast.error('Upload failed.'); }
    finally { setUploadingDocs(false); if (docInputRef.current) docInputRef.current.value = ''; }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-5">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <Link href="/properties" className="text-black/30 hover:text-black/60"><ArrowLeft size={18} /></Link>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">Listing Detail</p>
          <h1 className="text-xl font-semibold text-[#0f172a] line-clamp-1">{listing.title}</h1>
        </div>
      </div>

      {/* Cover + status + actions */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {coverPhoto && <div className="h-56 overflow-hidden"><img src={coverPhoto.url} alt={listing.title} className="w-full h-full object-cover" /></div>}
        <div className="p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={cn('text-[10px] font-mono uppercase px-2 py-0.5 rounded', STATUS_STYLE[listing.status] ?? 'bg-gray-100 text-gray-500')}>{listing.status}</span>
              <span className={cn('text-[10px] font-mono uppercase px-2 py-0.5 rounded', VERIFY_STYLE[listing.verificationStatus] ?? 'bg-gray-100 text-gray-500')}>{listing.verificationStatus}</span>
              {listing.availabilityStatus && <span className="text-[10px] font-mono uppercase bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{listing.availabilityStatus}</span>}
            </div>
            <p className="text-lg font-bold text-emerald-600">{price}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ownerActions.map(({ action, label, style }) => (
              <button key={action} type="button" disabled={transitioning}
                onClick={() => { if (action === 'submit' && currentUser.kycStatus !== 'verified') { toast.error('KYC must be verified to submit.'); return; } transition({ action }); }}
                className={cn('text-xs font-semibold px-3 py-2 rounded-xl transition-colors disabled:opacity-50', style)}>
                {label}
              </button>
            ))}
            {adminActions.map(({ action, label, style }) => (
              <button key={action} type="button" disabled={transitioning}
                onClick={() => { if (action === 'reject') { setShowRejectModal(true); return; } transition({ action }); }}
                className={cn('text-xs font-semibold px-3 py-2 rounded-xl transition-colors disabled:opacity-50', style)}>
                {label}
              </button>
            ))}
            {role === 'TENANT' && listing.status === 'published' && (
              <button type="button" onClick={() => setShowOfferModal(true)}
                className="text-xs font-semibold px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">
                Make Offer
              </button>
            )}
            {isOwner && (listing.status === 'draft' || listing.status === 'rejected') && (
              <Link href={`/properties/${id}/edit`} className="text-xs font-semibold px-3 py-2 rounded-xl border border-gray-300 text-black/60 hover:bg-gray-50">Edit</Link>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <p className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-4">Details</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {listing.bedrooms   !== undefined && <span className="flex items-center gap-1.5 text-sm text-black/60"><Bed size={13} className="text-black/30" />{listing.bedrooms} beds</span>}
          {listing.bathrooms  !== undefined && <span className="flex items-center gap-1.5 text-sm text-black/60"><Bath size={13} className="text-black/30" />{listing.bathrooms} baths</span>}
          {listing.area       && <span className="flex items-center gap-1.5 text-sm text-black/60"><Maximize2 size={13} className="text-black/30" />{listing.area.value} {listing.area.unit}</span>}
          {listing.yearBuilt  && <span className="flex items-center gap-1.5 text-sm text-black/60"><Calendar size={13} className="text-black/30" />Built {listing.yearBuilt}</span>}
          {listing.parkingSpaces && <span className="flex items-center gap-1.5 text-sm text-black/60">🅿 {listing.parkingSpaces} parking</span>}
          {listing.furnishingStatus && <span className="text-[10px] font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded capitalize">{listing.furnishingStatus.replace('_',' ')}</span>}
        </div>
        <div className="flex items-start gap-2 text-sm text-black/60 mb-3">
          <MapPin size={13} className="text-black/30 mt-0.5 shrink-0" />
          {listing.address.street}, {listing.address.city}, {listing.address.country}
        </div>
        {listing.description && <p className="text-sm text-black/55 leading-relaxed mb-3 font-light">{listing.description}</p>}
        {listing.neighborhoodInfo && <p className="text-xs text-black/40 mb-2"><span className="font-medium text-black/60">Neighbourhood:</span> {listing.neighborhoodInfo}</p>}
        {listing.utilityDetails && <p className="text-xs text-black/40 mb-2"><span className="font-medium text-black/60">Utilities:</span> {listing.utilityDetails}</p>}
        {listing.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">{listing.amenities.map((a) => <span key={a} className="text-[10px] font-mono bg-gray-100 text-black/50 px-2 py-0.5 rounded">{a}</span>)}</div>
        )}
      </div>

      <Modal open={showOfferModal} onOpenChange={setShowOfferModal} title="Make an Offer" description={`Submit an offer for ${listing?.title}`}>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-1 block">Offer amount</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-black/60">{listing?.currency}</span>
              <input
                type="number"
                min={0}
                value={offerAmount}
                onChange={(e) => setOfferAmount(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-black/80 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-1 block">Message</label>
            <textarea
              rows={4}
              value={offerMessage}
              onChange={(e) => setOfferMessage(e.target.value)}
              placeholder="Add a note to the owner (optional)"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-black/80 focus:outline-none focus:border-emerald-400 resize-none"
            />
          </div>
          <button
            type="button"
            disabled={creatingOffer || offerAmount <= 0}
            onClick={() => {
              if (!listing) return;
              submitOffer({
                listingId: id,
                offerPrice: offerAmount,
                currency: listing.currency,
                message: offerMessage.trim() || undefined,
              }, {
                onSuccess: () => {
                  setShowOfferModal(false);
                  setOfferMessage('');
                },
              });
            }}
            className="w-full rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
          >
            {creatingOffer ? <Loader2 size={14} className="animate-spin inline-block mr-2" /> : null}
            Submit Offer
          </button>
        </div>
      </Modal>

      {/* Inquiry form for tenants */}
      {role === 'TENANT' && listing.status === 'published' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">Send an Inquiry</p>
            <button type="button" onClick={() => setShowInquiryForm((v) => !v)}
              className="text-xs text-emerald-500 hover:text-emerald-600 font-medium">
              {showInquiryForm ? 'Cancel' : '+ Ask a question'}
            </button>
          </div>
          {showInquiryForm && (
            <div className="space-y-3">
              <select value={inquiryType} onChange={(e) => setInquiryType(e.target.value as 'rent' | 'buy' | 'general')}
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm text-black/70 bg-white focus:outline-none focus:border-emerald-400">
                <option value="general">General Question</option>
                {listing.listingType === 'rent' && <option value="rent">Interested in Renting</option>}
                {listing.listingType === 'sale' && <option value="buy">Interested in Buying</option>}
              </select>
              <textarea value={inquiryMsg} onChange={(e) => setInquiryMsg(e.target.value)} rows={4}
                placeholder="Is this property still available? I'd like to schedule a viewing…"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-black/70 placeholder:text-black/25 focus:outline-none focus:border-emerald-400 resize-none" />
              <button type="button" disabled={sendingInquiry || !inquiryMsg.trim()}
                onClick={() => doSendInquiry({ listingId: id, message: inquiryMsg.trim(), inquiryType }, {
                  onSuccess: () => { setInquiryMsg(''); setShowInquiryForm(false); },
                })}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors w-full justify-center">
                {sendingInquiry ? <Loader2 size={13} className="animate-spin" /> : null}
                Send Inquiry
              </button>
            </div>
          )}
        </div>
      )}

      {/* Photos section */}
      {(isOwner || isAdmin) && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-black/35 flex items-center gap-1.5"><ImageIcon size={10} /> Photos</p>
            {isOwner && (
              <button type="button" onClick={() => photoInputRef.current?.click()} disabled={uploadingPhotos}
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50">
                {uploadingPhotos ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} Upload Photos
              </button>
            )}
            <input ref={photoInputRef} type="file" multiple accept="image/*" className="hidden"
              onChange={(e) => { 
                const f = Array.from(e.target.files ?? []); 
                if (f.length) {
                  const previews = f.map(file => ({ url: URL.createObjectURL(file), file }));
                  setPreviewPhotos(previews);
                  doUploadPhotos(f, {
                    onSettled: () => {
                      previews.forEach(p => URL.revokeObjectURL(p.url));
                      setPreviewPhotos([]);
                    }
                  });
                }
                if (photoInputRef.current) photoInputRef.current.value = ''; 
              }} />
          </div>
          {isOwner && listing.photos && listing.photos.length > 1 && (
            <p className="text-[9px] text-black/30 font-mono mb-2">Drag photos to reorder</p>
          )}
          {(listing.photos?.length > 0) || previewPhotos.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {(listing.photos || []).map((photo, idx) => (
                <div
                  key={photo.publicId}
                  draggable={isOwner}
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={() => handleDrop(idx)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    'relative group rounded-lg overflow-hidden aspect-square transition-all cursor-grab active:cursor-grabbing',
                    dragIdx === idx && 'opacity-40 scale-95',
                    dragOverIdx === idx && dragIdx !== idx && 'ring-2 ring-emerald-400 ring-offset-2 scale-[1.02]',
                  )}
                >
                  <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  {photo.isCover && <span className="absolute top-1 left-1 bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">COVER</span>}
                  {isOwner && (
                    <>
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical size={14} className="text-white drop-shadow-md" />
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!photo.isCover && <button type="button" onClick={(e) => { e.stopPropagation(); doSetCover(photo.publicId); }} className="bg-white/90 text-black text-[9px] font-bold px-2 py-1 rounded"><Star size={10} /></button>}
                        <button type="button" onClick={(e) => { e.stopPropagation(); doDeletePhoto(photo.publicId); }} className="bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded"><Trash2 size={10} /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {previewPhotos.map((preview, i) => (
                <div key={`preview-${i}`} className="relative rounded-lg overflow-hidden aspect-square border border-gray-200">
                  <img src={preview.url} alt="uploading" className="w-full h-full object-cover opacity-40 blur-[2px]" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <Loader2 size={24} className="animate-spin text-emerald-600" />
                    <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-1 rounded tracking-widest shadow-sm">UPLOADING...</span>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-black/35 font-light">No photos yet. Upload photos to improve your listing.</p>}
        </div>
      )}

      {/* Documents */}
      {(isOwner || isAdmin) && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-4 flex items-center gap-1.5">
            <FileText size={10} /> Ownership Documents
          </p>

          {/* Owner upload section */}
          {isOwner && (
            <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
              <p className="text-xs font-medium text-black/60">Upload a document</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-1.5 block">Document Type</label>
                  <select value={docUploadType} onChange={(e) => setDocUploadType(e.target.value)}
                    className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm text-black/70 bg-white focus:outline-none focus:border-emerald-400">
                    <option value="title_deed">Title Deed</option>
                    <option value="tax_record">Tax Record</option>
                    <option value="utility_bill">Utility Bill</option>
                    <option value="ownership_certificate">Ownership Certificate</option>
                    <option value="lease_authority">Lease Authority</option>
                    <option value="government_doc">Government Document</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button type="button" onClick={() => docInputRef.current?.click()} disabled={uploadingDocs}
                    className="flex items-center gap-2 h-9 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold rounded-xl transition-colors w-full justify-center">
                    {uploadingDocs ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                    {uploadingDocs ? 'Uploading…' : 'Choose File'}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-black/35">PDF, JPG, PNG — max 5 MB. Images and PDFs accepted.</p>
              <input ref={docInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleDocUpload} />
            </div>
          )}

          {/* Verification status banner */}
          {listing.verificationStatus === 'unverified' && isOwner && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 mb-3">
              <AlertCircle size={13} className="shrink-0 mt-0.5" /> Upload a title deed to start verification. Required before submitting for review.
            </div>
          )}
          {listing.verificationStatus === 'pending' && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 mb-3">
              <Clock size={13} /> Documents submitted. Admin review in progress.
            </div>
          )}
          {listing.verificationStatus === 'verified' && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-700 mb-3">
              <CheckCircle2 size={13} /> Ownership verified. Listing can be published.
            </div>
          )}

          {/* Document list */}
          {docs.length > 0 ? (
            <div className="space-y-2">
              {docs.map((doc) => (
                <div key={doc.id} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-black/70 font-mono capitalize font-medium">{doc.type.replace(/_/g,' ')}</span>
                      <p className="text-[10px] text-black/35 font-mono mt-0.5">SHA-256: {doc.hash?.slice(0,16)}…</p>
                      {doc.reviewNote && <p className="text-[10px] text-amber-600 mt-0.5">Note: {doc.reviewNote}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-[10px] font-mono uppercase px-2 py-0.5 rounded',
                        doc.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                        doc.status === 'rejected'  ? 'bg-red-50 text-red-500' :
                        'bg-amber-50 text-amber-600')}>
                        {doc.status}
                      </span>
                      <button type="button"
                        onClick={() => getDocUrl({ listingId: id, docId: doc.id }, { onSuccess: (url) => { if (url) window.open(url, '_blank'); } })}
                        className="text-[10px] font-mono text-blue-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition-colors">
                        View
                      </button>
                    </div>
                  </div>

                  {/* Admin review buttons */}
                  {isAdmin && doc.status === 'pending' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                      <button type="button"
                        onClick={() => handleDocReview(doc.id, 'approve')}
                        className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors">
                        <CheckCircle2 size={11} /> Approve
                      </button>
                      <button type="button"
                        onClick={() => { setDocReviewTarget(doc.id); setDocReviewDecision('reject'); }}
                        className="flex items-center gap-1.5 text-[10px] font-semibold text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors">
                        <XCircle size={11} /> Reject
                      </button>                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-black/35 font-light">No documents uploaded yet.</p>
          )}
        </div>
      )}

      {/* Analytics */}
      {analytics && (isOwner || isAdmin) && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-4 flex items-center gap-1.5"><BarChart2 size={10} /> Analytics</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {[
              { label: 'Views', value: analytics.counts.view },
              { label: 'Favorites', value: analytics.counts.favorite },
              { label: 'Inquiries', value: analytics.counts.inquiry },
              { label: 'Leads', value: analytics.leadCount },
              { label: 'Conv.', value: `${(analytics.conversionRate * 100).toFixed(1)}%` },
            ].map(({ label, value }) => (
              <div key={label} className="text-center bg-gray-50 rounded-xl p-3 border border-gray-200">
                <p className="text-lg font-bold text-black/80">{value}</p>
                <p className="text-[9px] font-mono uppercase text-black/35 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* On-chain title */}
      {(isOwner || isAdmin) && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-4 flex items-center gap-1.5"><ShieldCheck size={10} /> On-Chain Title</p>
          {titleInfo ? (
            <div className="space-y-3">
              <div className={cn('flex items-center gap-2 rounded-xl p-3 text-xs', titleInfo.verified ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-gray-50 border border-gray-200 text-black/60')}>
                {titleInfo.verified ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                Token #{titleInfo.tokenId} — {titleInfo.verified ? 'Verified on-chain ✓' : 'Not verified'}
              </div>
              <p className="text-[10px] font-mono text-black/40 break-all">Contract: {titleInfo.contractAddress}</p>
              {isAdmin && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <button type="button" onClick={() => setTitleAction('dispute')} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-100">Dispute</button>
                  <button type="button" onClick={() => setTitleAction('clear')}   className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100">Clear Dispute</button>
                  <button type="button" onClick={() => setTitleAction('revoke')}  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100">Revoke</button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-black/40 font-light">No on-chain title minted yet.</p>
              {isAdmin && listing.verificationStatus === 'verified' && !listing.tokenId && (
                <button type="button" onClick={() => doMintTitle()} disabled={minting}
                  className="flex items-center gap-2 bg-black hover:bg-gray-900 disabled:bg-gray-200 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
                  {minting ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />} Mint Title
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Reject modal */}
      {showRejectModal && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setShowRejectModal(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-2xl p-6 border border-gray-200 shadow-2xl">
            <h3 className="text-sm font-semibold text-black mb-4">Reject Listing</h3>
            <div className="space-y-3">
              <select value={rejectReason} onChange={(e) => setRejectReason(e.target.value as RejectionReason)}
                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm text-black/70 bg-white focus:outline-none focus:border-red-400">
                {['missing_document','invalid_ownership_proof','wrong_location','poor_quality','suspicious','duplicate','other'].map((r) => (
                  <option key={r} value={r}>{r.replace(/_/g,' ')}</option>
                ))}
              </select>
              <textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} rows={3} placeholder="Note for the owner…"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-black/70 focus:outline-none focus:border-red-400 resize-none" />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowRejectModal(false)} className="text-xs text-black/40 px-4 py-2">Cancel</button>
                <button type="button" disabled={transitioning}
                  onClick={() => { transition({ action: 'reject', reason: rejectReason, note: rejectNote || undefined }); setShowRejectModal(false); }}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-5 py-2 rounded-xl disabled:opacity-50">
                  Reject
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Title action modal */}
      {titleAction && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setTitleAction(null)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-2xl p-6 border border-gray-200 shadow-2xl">
            <h3 className="text-sm font-semibold text-black mb-4 capitalize">{titleAction} Title</h3>
            <textarea value={titleReason} onChange={(e) => setTitleReason(e.target.value)} rows={3} placeholder="Reason (required)…"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-black/70 focus:outline-none resize-none mb-3" />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setTitleAction(null)} className="text-xs text-black/40 px-4 py-2">Cancel</button>
              <button type="button" disabled={!titleReason.trim() || disputing}
                onClick={() => {
                  if (titleAction === 'dispute') doDisputeTitle(titleReason);
                  else if (titleAction === 'clear') doClearDispute(titleReason);
                  else if (titleAction === 'revoke') doRevokeTitle(titleReason);
                  setTitleAction(null); setTitleReason('');
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-5 py-2 rounded-xl disabled:opacity-50 capitalize">
                {titleAction}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Document reject modal */}
      {docReviewTarget && docReviewDecision === 'reject' && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setDocReviewTarget(null)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-2xl p-6 border border-gray-200 shadow-2xl">
            <h3 className="text-sm font-semibold text-black mb-4">Reject Document</h3>
            <textarea value={docReviewNote} onChange={(e) => setDocReviewNote(e.target.value)}
              rows={3} placeholder="Reason for rejection (shown to owner)…"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-black/70 focus:outline-none focus:border-red-400 resize-none mb-3" />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setDocReviewTarget(null)} className="text-xs text-black/40 px-4 py-2">Cancel</button>
              <button type="button" disabled={reviewingDoc}
                onClick={() => handleDocReview(docReviewTarget, 'reject', docReviewNote || undefined)}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-5 py-2 rounded-xl disabled:opacity-50">
                Reject Document
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
