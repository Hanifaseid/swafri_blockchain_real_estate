'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Archive,
  ArrowLeft,
  Check,
  ExternalLink,
  Eye,
  FileText,
  ImagePlus,
  Loader2,
  Save,
  Send,
  Star,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  useDeleteListing,
  useDeletePhoto,
  useDocumentSignedUrl,
  useListing,
  useListingAnalytics,
  useListingDocuments,
  useListingYield,
  useSetCoverPhoto,
  useTransitionListing,
  useUpdateListing,
  useUploadListingDocuments,
  useUploadPhotos,
} from '@/features/listings/queries/listing.queries';
import type {
  CreateListingInput,
  Listing,
  ListingCategory,
  ListingStatus,
  ListingType,
  PropertyType,
  TransitionAction,
} from '@/features/listings/types/listing.types';
import type { ListingDocumentType } from '@/features/listings/services/listing.service';
import { cn, formatCurrency } from '@/lib/utils';

const PROPERTY_TYPES: PropertyType[] = [
  'apartment',
  'house',
  'villa',
  'condominium',
  'land',
  'commercial_space',
  'office',
  'warehouse',
  'shop',
  'mixed_use',
];

const DOCUMENT_TYPES: ListingDocumentType[] = [
  'title_deed',
  'ownership_certificate',
  'tax_record',
  'utility_bill',
  'lease_authority',
  'government_document',
  'other',
];

const label = 'mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-text-muted';
const field =
  'h-11 w-full rounded-lg border border-border-primary bg-surface-input px-3 text-sm text-white outline-none placeholder:text-text-placeholder focus:border-accent-400';
const card = 'rounded-xl border border-border-primary bg-surface-card p-5';

const STATUS_TEXT: Record<ListingStatus, string> = {
  draft: 'Draft listings can be updated and submitted for review.',
  submitted: 'Submitted listings are waiting for admin review.',
  under_review: 'Admin review is in progress.',
  approved: 'Approved listings are ready for admin publishing.',
  published: 'Published listings are visible in marketplace discovery.',
  rejected: 'Rejected listings can be updated and resubmitted.',
  suspended: 'Suspended listings require admin action.',
  rented: 'This listing is marked rented.',
  sold: 'This listing is marked sold.',
  archived: 'Archived listings are hidden from active owner workflows.',
};

type FormState = {
  listingType: ListingType;
  category: ListingCategory;
  propertyType: PropertyType;
  title: string;
  description: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  areaValue: string;
  areaUnit: 'sqm' | 'sqft';
  amenities: string;
  street: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
  lng: string;
  lat: string;
};

export default function AccountListingManagePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data: listing, isLoading } = useListing(id);
  const { data: docs = [] } = useListingDocuments(id);
  const analytics = useListingAnalytics(id);
  const yieldSummary = useListingYield(id);

  const update = useUpdateListing(id);
  const transition = useTransitionListing(id);
  const deleteListing = useDeleteListing();
  const uploadPhotos = useUploadPhotos(id);
  const deletePhoto = useDeletePhoto(id);
  const setCover = useSetCoverPhoto(id);
  const uploadDocs = useUploadListingDocuments(id);
  const signedUrl = useDocumentSignedUrl();

  const [draft, setDraft] = useState<Partial<FormState>>({});
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [docType, setDocType] = useState<ListingDocumentType>('title_deed');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);

  const actions = useMemo(() => (listing ? ownerActions(listing) : []), [listing]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-text-muted">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading listing...
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="rounded-xl border border-border-primary bg-surface-card p-8 text-center">
        <p className="font-medium text-white">Listing not found</p>
        <p className="mt-1 text-sm text-text-muted">It may have been deleted or you may not have access.</p>
        <Button asChild className="mt-5">
          <Link href="/account/listings">Back to my listings</Link>
        </Button>
      </div>
    );
  }

  const form: FormState = { ...listingToForm(listing), ...draft };
  const setForm = (next: FormState) => setDraft(next);
  const priceLabel = formatCurrency(listing.price ?? listing.monthlyRent ?? 0, listing.currency ?? 'USD');
  const busy = update.isPending || transition.isPending || deleteListing.isPending;

  const saveDetails = async () => {
    if (!form.title.trim() || !form.street.trim() || !form.city.trim() || !form.country.trim()) {
      toast.error('Title and address fields are required.');
      return;
    }
    const lng = Number(form.lng);
    const lat = Number(form.lat);
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      toast.error('Longitude and latitude are required.');
      return;
    }

    const payload: Partial<CreateListingInput> = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      listingType: form.listingType,
      category: form.category,
      propertyType: form.propertyType,
      currency: listing.currency ?? 'USD',
      price: form.listingType === 'sale' ? Number(form.price) : undefined,
      monthlyRent: form.listingType === 'rent' ? Number(form.price) : undefined,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
      area: form.areaValue ? { value: Number(form.areaValue), unit: form.areaUnit } : undefined,
      amenities: form.amenities
        ? form.amenities.split(',').map((item) => item.trim()).filter(Boolean)
        : [],
      address: {
        street: form.street.trim(),
        city: form.city.trim(),
        region: form.region.trim() || undefined,
        country: form.country.trim(),
        postalCode: form.postalCode.trim() || undefined,
      },
      location: { type: 'Point', coordinates: [lng, lat] },
    };

    await update.mutateAsync(payload);
    setDraft({});
  };

  const runTransition = (action: TransitionAction) => {
    transition.mutate({ action });
  };

  const deleteCurrentListing = () => {
    deleteListing.mutate(id, {
      onSuccess: () => {
        setConfirmDelete(false);
        router.push('/account/listings');
      },
    });
  };

  const openDocument = async (docId: string) => {
    const url = await signedUrl.mutateAsync({ listingId: id, docId });
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-3 text-white/70 hover:bg-white/8 hover:text-white">
            <Link href="/account/listings">
              <ArrowLeft size={15} />
              My listings
            </Link>
          </Button>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">Property owner</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-white">{listing.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-text-muted">{STATUS_TEXT[listing.status]}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/discovery/${listing.id}`}>
              <Eye size={15} />
              Public view
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => setConfirmDelete(true)} loading={deleteListing.isPending}>
            <Trash2 size={15} />
            Delete
          </Button>
        </div>
      </div>

      <section className={card}>
        <div className="grid gap-5 md:grid-cols-4">
          <StatusTile label="Status" value={listing.status.replaceAll('_', ' ')} />
          <StatusTile label="Verification" value={listing.verificationStatus.replaceAll('_', ' ')} />
          <StatusTile label="Price" value={`${priceLabel}${listing.listingType === 'rent' ? '/mo' : ''}`} />
          <StatusTile label="Media" value={`${listing.photos?.length ?? 0} photos / ${docs.length} docs`} />
        </div>
        {actions.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-border-secondary pt-5">
            {actions.map((action) => (
              <Button
                key={action.action}
                size="sm"
                variant={action.variant}
                loading={busy}
                onClick={() => {
                  if (action.action === 'archive') setConfirmArchive(true);
                  else runTransition(action.action);
                }}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </section>

      <section className={card}>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Listing details</h2>
            <p className="mt-1 text-sm text-text-muted">These fields are sent to the backend listing update endpoint.</p>
          </div>
          <Button onClick={saveDetails} loading={update.isPending}>
            <Save size={15} />
            Save changes
          </Button>
        </div>

        <div className="mt-5 grid gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Field labelText="Listing type">
              <select value={form.listingType} onChange={(e) => setForm({ ...form, listingType: e.target.value as ListingType })} className={field}>
                <option value="sale">For sale</option>
                <option value="rent">For rent</option>
              </select>
            </Field>
            <Field labelText="Category">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ListingCategory })} className={field}>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </Field>
            <Field labelText="Property type">
              <select value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value as PropertyType })} className={field}>
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>{type.replaceAll('_', ' ')}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field labelText="Title">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={field} />
          </Field>
          <Field labelText="Description">
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className={cn(field, 'h-auto py-2.5')} />
          </Field>

          <div className="grid gap-4 md:grid-cols-4">
            <Field labelText={form.listingType === 'sale' ? 'Sale price' : 'Monthly rent'}>
              <input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={field} />
            </Field>
            <Field labelText="Bedrooms">
              <input type="number" min={0} value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} className={field} />
            </Field>
            <Field labelText="Bathrooms">
              <input type="number" min={0} value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} className={field} />
            </Field>
            <Field labelText="Amenities">
              <input value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} placeholder="Parking, balcony" className={field} />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Field labelText="Area">
              <input type="number" min={0} value={form.areaValue} onChange={(e) => setForm({ ...form, areaValue: e.target.value })} className={field} />
            </Field>
            <Field labelText="Area unit">
              <select value={form.areaUnit} onChange={(e) => setForm({ ...form, areaUnit: e.target.value as 'sqm' | 'sqft' })} className={field}>
                <option value="sqm">sqm</option>
                <option value="sqft">sqft</option>
              </select>
            </Field>
            <Field labelText="Longitude">
              <input type="number" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} className={field} />
            </Field>
            <Field labelText="Latitude">
              <input type="number" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} className={field} />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            <Field labelText="Street">
              <input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className={field} />
            </Field>
            <Field labelText="City">
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={field} />
            </Field>
            <Field labelText="Region">
              <input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className={field} />
            </Field>
            <Field labelText="Country">
              <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className={field} />
            </Field>
            <Field labelText="Postal code">
              <input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} className={field} />
            </Field>
          </div>
        </div>
      </section>

      <section className={card}>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Photos</h2>
            <p className="mt-1 text-sm text-text-muted">Upload public gallery photos, remove old images, and choose the cover image.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setPhotoFiles(Array.from(e.target.files ?? []))}
              className="max-w-full text-sm text-text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-700"
            />
            <Button size="sm" onClick={() => uploadPhotos.mutate(photoFiles)} loading={uploadPhotos.isPending} disabled={photoFiles.length === 0}>
              <ImagePlus size={14} />
              Upload
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(listing.photos ?? []).map((photo) => (
            <div key={photo.publicId} className="overflow-hidden rounded-lg border border-border-primary bg-surface-highlight">
              <div className="relative aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={listing.title} className="h-full w-full object-cover" />
                {photo.isCover && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-1 text-[11px] font-semibold text-emerald-950">
                    <Star size={11} />
                    Cover
                  </span>
                )}
              </div>
              <div className="flex gap-2 p-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setCover.mutate(photo.publicId)} disabled={photo.isCover}>
                  Cover
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deletePhoto.mutate(photo.publicId)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
          {listing.photos.length === 0 && (
            <div className="rounded-lg border border-dashed border-border-primary p-8 text-center text-sm text-text-muted">
              No photos uploaded yet.
            </div>
          )}
        </div>
      </section>

      <section className={card}>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Ownership documents</h2>
            <p className="mt-1 text-sm text-text-muted">Private documents are visible only to you and authorized admins.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={docType} onChange={(e) => setDocType(e.target.value as ListingDocumentType)} className={cn(field, 'w-auto')}>
              {DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>{type.replaceAll('_', ' ')}</option>
              ))}
            </select>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={(e) => setDocFiles(Array.from(e.target.files ?? []))}
              className="max-w-full text-sm text-text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-700"
            />
            <Button size="sm" onClick={() => uploadDocs.mutate({ type: docType, files: docFiles })} loading={uploadDocs.isPending} disabled={docFiles.length === 0}>
              <FileText size={14} />
              Upload
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {docs.map((doc) => (
            <div key={doc.id} className="flex flex-col gap-3 rounded-lg border border-border-primary bg-surface-highlight p-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold capitalize text-white">{doc.type.replaceAll('_', ' ')}</p>
                <p className="mt-1 text-xs text-text-muted">
                  {doc.status} {doc.hash ? ` / ${doc.hash.slice(0, 12)}...` : ''}
                </p>
                {doc.reviewNote && <p className="mt-1 text-xs text-amber-300">{doc.reviewNote}</p>}
              </div>
              <Button size="sm" variant="outline" onClick={() => openDocument(doc.id)} loading={signedUrl.isPending}>
                <ExternalLink size={14} />
                View
              </Button>
            </div>
          ))}
          {docs.length === 0 && (
            <div className="rounded-lg border border-dashed border-border-primary p-8 text-center text-sm text-text-muted">
              Upload a title deed or equivalent ownership document before submitting for review.
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className={card}>
          <h2 className="text-sm font-semibold text-white">Lead analytics</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <StatusTile label="Views" value={String(analytics.data?.counts?.view ?? 0)} />
            <StatusTile label="Favorites" value={String(analytics.data?.counts?.favorite ?? 0)} />
            <StatusTile label="Inquiries" value={String(analytics.data?.counts?.inquiry ?? 0)} />
            <StatusTile label="Offers/apps" value={String((analytics.data?.counts?.offer ?? 0) + (analytics.data?.counts?.rental_application ?? 0))} />
          </div>
        </div>
        <div className={card}>
          <h2 className="text-sm font-semibold text-white">Rental yield</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <StatusTile label="Gross rent" value={formatCurrency(yieldSummary.data?.grossRent ?? 0, yieldSummary.data?.currency ?? listing.currency ?? 'USD')} />
            <StatusTile label="Maintenance" value={formatCurrency(yieldSummary.data?.maintenanceCost ?? 0, yieldSummary.data?.currency ?? listing.currency ?? 'USD')} />
            <StatusTile label="Net income" value={formatCurrency(yieldSummary.data?.netIncome ?? 0, yieldSummary.data?.currency ?? listing.currency ?? 'USD')} />
            <StatusTile label="Annualized" value={yieldSummary.data?.annualizedYield == null ? 'N/A' : `${yieldSummary.data.annualizedYield.toFixed(2)}%`} />
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete listing"
        description="This permanently deletes the listing and cannot be undone."
        confirmLabel="Delete"
        confirmVariant="destructive"
        loading={deleteListing.isPending}
        onConfirm={deleteCurrentListing}
      />
      <ConfirmDialog
        open={confirmArchive}
        onOpenChange={setConfirmArchive}
        title="Archive listing"
        description="The listing will leave active owner workflows. Admin and audit records remain in the backend."
        confirmLabel="Archive"
        confirmVariant="destructive"
        loading={transition.isPending}
        onConfirm={() => {
          setConfirmArchive(false);
          runTransition('archive');
        }}
      />
    </div>
  );
}

function Field({ labelText, children }: { labelText: string; children: ReactNode }) {
  return (
    <label>
      <span className={label}>{labelText}</span>
      {children}
    </label>
  );
}

function StatusTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border-primary bg-surface-highlight p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">{label}</p>
      <p className="mt-2 truncate text-sm font-semibold capitalize text-white">{value}</p>
    </div>
  );
}

function listingToForm(listing: Listing): FormState {
  return {
    listingType: listing.listingType,
    category: listing.category,
    propertyType: listing.propertyType,
    title: listing.title ?? '',
    description: listing.description ?? '',
    price: String(listing.price ?? listing.monthlyRent ?? ''),
    bedrooms: listing.bedrooms == null ? '' : String(listing.bedrooms),
    bathrooms: listing.bathrooms == null ? '' : String(listing.bathrooms),
    areaValue: listing.area?.value == null ? '' : String(listing.area.value),
    areaUnit: listing.area?.unit ?? 'sqm',
    amenities: listing.amenities?.join(', ') ?? '',
    street: listing.address?.street ?? '',
    city: listing.address?.city ?? '',
    region: listing.address?.region ?? '',
    country: listing.address?.country ?? '',
    postalCode: listing.address?.postalCode ?? '',
    lng: String(listing.location?.coordinates?.[0] ?? ''),
    lat: String(listing.location?.coordinates?.[1] ?? ''),
  };
}

function ownerActions(listing: Listing): Array<{
  action: TransitionAction;
  label: string;
  variant: 'default' | 'outline' | 'destructive';
  icon: ReactNode;
}> {
  const actions: Array<{
    action: TransitionAction;
    label: string;
    variant: 'default' | 'outline' | 'destructive';
    icon: ReactNode;
  }> = [];

  if (listing.status === 'draft' || listing.status === 'rejected') {
    actions.push({ action: 'submit', label: 'Submit for review', variant: 'default', icon: <Send size={14} /> });
  }
  if (listing.status === 'published' && listing.listingType === 'rent') {
    actions.push({ action: 'mark_rented', label: 'Mark rented', variant: 'outline', icon: <Check size={14} /> });
  }
  if (listing.status === 'published' && listing.listingType === 'sale') {
    actions.push({ action: 'mark_sold', label: 'Mark sold', variant: 'outline', icon: <Check size={14} /> });
  }
  if (listing.status === 'rented') {
    actions.push({ action: 'unmark_rented', label: 'Return to published', variant: 'outline', icon: <Check size={14} /> });
  }
  if (listing.status === 'sold') {
    actions.push({ action: 'unmark_sold', label: 'Return to published', variant: 'outline', icon: <Check size={14} /> });
  }
  if (listing.status !== 'archived') {
    actions.push({ action: 'archive', label: 'Archive', variant: 'destructive', icon: <Archive size={14} /> });
  }

  return actions;
}
