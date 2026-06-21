'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowRight, Check, FileText, ImagePlus, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ListingLocationPicker } from '@/components/map/ListingLocationPicker';
import { cn } from '@/lib/utils';
import { useGeocode, useCreateListing } from '@/features/listings/queries/listing.queries';
import { uploadPhotos, uploadDocuments, transitionListing } from '@/features/listings/services/listing.service';
import type {
  CreateListingInput,
  GeocodeResult,
  ListingType,
  ReverseGeocodeResult,
} from '@/features/listings/types/listing.types';
import { useAuthStore } from '@/stores/auth.store';

const PROPERTY_TYPES = [
  'apartment', 'house', 'villa', 'condominium', 'land',
  'commercial_space', 'office', 'warehouse', 'shop', 'mixed_use',
] as const;

const label = 'mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-text-muted';
const field =
  'h-11 w-full rounded-lg border border-border-primary bg-surface-input px-3 text-sm text-white outline-none placeholder:text-text-placeholder focus:border-accent-400';
const card = 'rounded-xl border border-border-primary bg-surface-card p-6';

export default function NewListingPage() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const createListing = useCreateListing();

  const [phase, setPhase] = useState<'details' | 'media'>('details');
  const [createdId, setCreatedId] = useState<string | null>(null);

  // ── Details ──
  const [listingType, setListingType] = useState<ListingType>('sale');
  const [category, setCategory] = useState<'residential' | 'commercial'>('residential');
  const [propertyType, setPropertyType] = useState<string>('apartment');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [areaValue, setAreaValue] = useState('');
  const [areaUnit, setAreaUnit] = useState<'sqm' | 'sqft'>('sqm');
  const [amenities, setAmenities] = useState('');

  // ── Location ──
  const [locQuery, setLocQuery] = useState('');
  const geo = useGeocode(locQuery);
  const [coords, setCoords] = useState<{ lng: number; lat: number } | null>(null);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  // ── Media phase ──
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [photosDone, setPhotosDone] = useState(false);
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [docType, setDocType] = useState('title_deed');
  const [docUploading, setDocUploading] = useState(false);
  const [docsDone, setDocsDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isSale = listingType === 'sale';

  const applyLocationResult = (r: GeocodeResult | ReverseGeocodeResult) => {
    const address = r.address ?? {};
    if (address.street) setStreet(address.street);
    else if (!street && r.label) setStreet(String(r.label).split(',')[0]);
    if (address.city) setCity(address.city);
    if (address.country) setCountry(address.country);
    setLocQuery(r.label ?? `${r.lat.toFixed(5)}, ${r.lng.toFixed(5)}`);
  };

  const pickPlace = (r: GeocodeResult) => {
    setCoords({ lng: r.lng, lat: r.lat });
    applyLocationResult(r);
  };

  const pickMapLocation = (nextCoords: { lng: number; lat: number }, result?: ReverseGeocodeResult | null) => {
    setCoords(nextCoords);
    if (result) {
      applyLocationResult(result);
      return;
    }
    setLocQuery(`${nextCoords.lat.toFixed(5)}, ${nextCoords.lng.toFixed(5)}`);
  };

  const canCreate =
    title.trim() &&
    propertyType &&
    street.trim() &&
    city.trim() &&
    country.trim() &&
    coords &&
    (isSale ? !!price : !!price); // price field holds rent too

  const handleCreate = async () => {
    if (currentUser?.role !== 'PROPERTY_OWNER') {
      toast.error('Listing creation is available to property owners.');
      return;
    }
    if (!canCreate || !coords) {
      toast.error('Please complete the required fields and pick a location.');
      return;
    }
    const input: CreateListingInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      listingType,
      category,
      propertyType: propertyType as CreateListingInput['propertyType'],
      currency: 'USD',
      ...(isSale ? { price: Number(price) } : { monthlyRent: Number(price) }),
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      area: areaValue ? { value: Number(areaValue), unit: areaUnit } : undefined,
      amenities: amenities
        ? amenities.split(',').map((a) => a.trim()).filter(Boolean)
        : undefined,
      address: { street: street.trim(), city: city.trim(), country: country.trim() },
      location: { type: 'Point', coordinates: [coords.lng, coords.lat] },
    };

    const listing = await createListing.mutateAsync(input).catch(() => null);
    if (listing?.id) {
      setCreatedId(listing.id);
      setPhase('media');
    }
  };

  const handleUploadPhotos = async () => {
    if (!createdId || photos.length === 0) return;
    setUploading(true);
    try {
      await uploadPhotos(createdId, photos);
      setPhotosDone(true);
      toast.success(`${photos.length} photo(s) uploaded.`);
    } catch (e: any) {
      toast.error(e?.message ?? 'Photo upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadDocuments = async () => {
    if (!createdId || docFiles.length === 0) return;
    setDocUploading(true);
    try {
      await uploadDocuments(createdId, docFiles, docType);
      setDocsDone(true);
      toast.success('Ownership document uploaded for verification.');
    } catch (e: any) {
      toast.error(e?.message ?? 'Document upload failed.');
    } finally {
      setDocUploading(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!createdId) return;
    setSubmitting(true);
    try {
      await transitionListing(createdId, { action: 'submit' });
      toast.success('Listing submitted for review.');
      router.push('/account/listings');
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not submit. You can submit later from My Listings.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header + steps */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">Property owner</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-white">List a property</h1>
        <div className="mt-4 flex items-center gap-3 text-xs font-medium">
          <Step n={1} label="Details" active={phase === 'details'} done={phase === 'media'} />
          <span className="h-px w-8 bg-border-primary" />
          <Step n={2} label="Photos & submit" active={phase === 'media'} done={false} />
        </div>
      </div>

      {phase === 'details' ? (
        <>
          {/* Type / category / property type */}
          <section className={card}>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <span className={label}>Listing type</span>
                <div className="flex overflow-hidden rounded-lg border border-border-primary">
                  {(['sale', 'rent'] as ListingType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setListingType(t)}
                      className={cn(
                        'flex-1 py-2.5 text-sm font-semibold capitalize transition-colors',
                        listingType === t ? 'bg-amber-400 text-emerald-950' : 'bg-surface-input text-text-muted',
                      )}
                    >
                      For {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className={label}>Category</span>
                <select value={category} onChange={(e) => setCategory(e.target.value as typeof category)} className={field}>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              <div>
                <span className={label}>Property type</span>
                <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className={field}>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <span className={label}>{isSale ? 'Sale price (USD)' : 'Monthly rent (USD)'}</span>
                <input type="number" min={0} step="any" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" className={field} />
              </div>
            </div>
          </section>

          {/* About */}
          <section className={card}>
            <h2 className="mb-4 text-sm font-semibold text-white">About the property</h2>
            <div className="grid gap-4">
              <div>
                <span className={label}>Title</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sunlit 2-bed apartment with parkview" className={field} />
              </div>
              <div>
                <span className={label}>Description</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe the property, its highlights, and the neighbourhood."
                  className={cn(field, 'h-auto py-2.5')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <span className={label}>Bedrooms</span>
                  <input type="number" min={0} value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className={field} />
                </div>
                <div>
                  <span className={label}>Bathrooms</span>
                  <input type="number" min={0} value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className={field} />
                </div>
                <div>
                  <span className={label}>Area</span>
                  <input type="number" min={0} value={areaValue} onChange={(e) => setAreaValue(e.target.value)} className={field} />
                </div>
                <div>
                  <span className={label}>Unit</span>
                  <select value={areaUnit} onChange={(e) => setAreaUnit(e.target.value as 'sqm' | 'sqft')} className={field}>
                    <option value="sqm">sqm</option>
                    <option value="sqft">sqft</option>
                  </select>
                </div>
              </div>
              <div>
                <span className={label}>Amenities (comma-separated)</span>
                <input value={amenities} onChange={(e) => setAmenities(e.target.value)} placeholder="Parking, Elevator, Balcony" className={field} />
              </div>
            </div>
          </section>

          {/* Location */}
          <section className={card}>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
              <MapPin size={16} className="text-accent-400" /> Location
            </h2>
            <div className="relative">
              <input
                value={locQuery}
                onChange={(e) => setLocQuery(e.target.value)}
                placeholder="Search an address or place to pin the property"
                className={field}
              />
              {geo.data && geo.data.length > 0 && locQuery.length >= 3 && (
                <div className="absolute z-10 mt-1 max-h-52 w-full overflow-auto rounded-lg border border-border-primary bg-surface-input shadow-2xl">
                  {geo.data.map((r) => (
                    <button
                      key={`${r.lat}-${r.lng}-${r.label}`}
                      type="button"
                      onClick={() => pickPlace(r)}
                      className="flex w-full items-start gap-2 border-b border-border-secondary px-3 py-2 text-left text-sm text-white/80 last:border-b-0 hover:bg-surface-highlight"
                    >
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4">
              <ListingLocationPicker coords={coords} onPick={pickMapLocation} />
            </div>
            {coords && (
              <p className="mt-2 flex items-center gap-2 text-xs text-emerald-400">
                <Check size={13} /> Pinned at {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                <button onClick={() => setCoords(null)} className="ml-1 text-text-muted underline hover:text-white">change</button>
              </p>
            )}
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <span className={label}>Street</span>
                <input value={street} onChange={(e) => setStreet(e.target.value)} className={field} />
              </div>
              <div>
                <span className={label}>City</span>
                <input value={city} onChange={(e) => setCity(e.target.value)} className={field} />
              </div>
              <div>
                <span className={label}>Country</span>
                <input value={country} onChange={(e) => setCountry(e.target.value)} className={field} />
              </div>
            </div>
          </section>

          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted">Your listing is saved as a draft; you add photos next.</p>
            <Button onClick={handleCreate} loading={createListing.isPending} disabled={!canCreate}>
              Save &amp; continue
              <ArrowRight size={16} />
            </Button>
          </div>
        </>
      ) : (
        /* ── Phase 2: photos + submit ── */
        <>
          <section className={card}>
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-surface-success px-3 py-2 text-sm text-emerald-400">
              <Check size={16} /> Draft created. Add photos, then submit for review.
            </div>
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
              <ImagePlus size={16} className="text-accent-400" /> Photos
            </h2>
            <p className="mb-4 text-sm text-text-muted">High-quality images get more interest. JPG or PNG.</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                setPhotos(Array.from(e.target.files ?? []));
                setPhotosDone(false);
              }}
              className="block w-full text-sm text-text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-700"
            />
            {photos.length > 0 && (
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-text-muted">{photos.length} file(s) selected</span>
                <Button size="sm" variant="outline" onClick={handleUploadPhotos} loading={uploading} disabled={photosDone}>
                  {photosDone ? (<><Check size={14} /> Uploaded</>) : (<><ImagePlus size={14} /> Upload</>)}
                </Button>
              </div>
            )}
          </section>

          <section className={card}>
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
              <FileText size={16} className="text-accent-400" /> Ownership document
            </h2>
            <p className="mb-4 text-sm text-text-muted">
              Upload your title deed (or equivalent proof). An admin reviews it before the listing is
              published and prepared for digital title anchoring. Private - never shown publicly.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <span className={label}>Document type</span>
                <select value={docType} onChange={(e) => setDocType(e.target.value)} className={field}>
                  <option value="title_deed">Title deed</option>
                  <option value="ownership_certificate">Ownership certificate</option>
                  <option value="tax_record">Tax record</option>
                  <option value="utility_bill">Utility bill</option>
                  <option value="lease_authority">Lease authority</option>
                  <option value="government_document">Government document</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <span className={label}>File(s)</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    setDocFiles(Array.from(e.target.files ?? []));
                    setDocsDone(false);
                  }}
                  className="mt-0.5 block w-full text-sm text-text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-700"
                />
              </div>
            </div>
            {docFiles.length > 0 && (
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-text-muted">{docFiles.length} file(s) selected</span>
                <Button size="sm" variant="outline" onClick={handleUploadDocuments} loading={docUploading} disabled={docsDone}>
                  {docsDone ? (<><Check size={14} /> Uploaded</>) : (<><FileText size={14} /> Upload document</>)}
                </Button>
              </div>
            )}
          </section>

          <section className={card}>
            <h2 className="text-sm font-semibold text-white">Submit for review</h2>
            <p className="mt-1 text-sm text-text-muted">
              An admin verifies your ownership document before the listing is published and prepared for digital title anchoring.
              You can also finish later from <span className="text-accent-400">My Listings</span>.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={handleSubmitForReview} loading={submitting}>
                <Send size={16} /> Submit for review
              </Button>
              <Button variant="ghost" onClick={() => router.push('/account/listings')}>
                Save as draft &amp; exit
              </Button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Step({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold',
          done ? 'bg-emerald-600 text-white' : active ? 'bg-amber-400 text-emerald-950' : 'bg-surface-input text-text-muted',
        )}
      >
        {done ? <Check size={13} /> : n}
      </span>
      <span className={active || done ? 'text-white' : 'text-text-muted'}>{label}</span>
    </div>
  );
}
