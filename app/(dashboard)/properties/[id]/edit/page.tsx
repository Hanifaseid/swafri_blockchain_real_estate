'use client';

import { use, useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Loader2, Crosshair, Search } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Link from 'next/link';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useAuthStore } from '@/stores/auth.store';
import { useListing, useUpdateListing } from '@/features/listings/queries/listing.queries';
import { inputClass, inputErrorClass } from '@/components/forms/styles';
import { cn } from '@/lib/utils';
import { geocode, reverseGeocode, type GeoResult } from '@/features/geo/services/geo.service';

const editSchema = z.object({
  title:            z.string().min(5).max(200),
  description:      z.string().max(5000).optional(),
  listingType:      z.enum(['sale', 'rent']),
  category:         z.enum(['residential', 'commercial']),
  propertyType:     z.string().min(1, 'Required'),
  price:            z.number().positive().optional(),
  monthlyRent:      z.number().positive().optional(),
  currency:         z.string().default('USD'),
  bedrooms:         z.number().int().min(0).optional(),
  bathrooms:        z.number().int().min(0).optional(),
  areaValue:        z.number().positive().optional(),
  areaUnit:         z.enum(['sqm', 'sqft']).default('sqm'),
  furnishingStatus: z.enum(['furnished', 'semi_furnished', 'unfurnished']).optional(),
  street:           z.string().min(1, 'Required'),
  city:             z.string().min(1, 'Required'),
  region:           z.string().optional(),
  country:          z.string().min(1, 'Required'),
  postalCode:       z.string().optional(),
  longitude:        z.number({ invalid_type_error: 'Enter valid longitude' }),
  latitude:         z.number({ invalid_type_error: 'Enter valid latitude' }),
  amenities:        z.string().optional(),
  neighborhoodInfo: z.string().optional(),
  utilityDetails:   z.string().optional(),
  rentalTerms:      z.string().optional(),
  saleTerms:        z.string().optional(),
  legalNotes:       z.string().optional(),
});

type FormValues = z.infer<typeof editSchema>;

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const { data: listing, isLoading } = useListing(id);
  const { mutate: update, isPending } = useUpdateListing(id);
  const [showMap, setShowMap] = useState(false);
  const [mapCenterOverride, setMapCenterOverride] = useState<[number, number] | null>(null);
  const [locationSearchOverride, setLocationSearchOverride] = useState<string | null>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<GeoResult[]>([]);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [locationSearchTouched, setLocationSearchTouched] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapCenterRef = useRef<[number, number]>([9.1450, 40.4897]);
  const searchRequestIdRef = useRef(0);

  const listingMapCenter: [number, number] = listing?.location?.coordinates
    ? [listing.location.coordinates[1], listing.location.coordinates[0]]
    : [9.1450, 40.4897];
  const mapCenter = mapCenterOverride ?? listingMapCenter;
  const listingLocationLabel = listing
    ? [listing.address.street, listing.address.city, listing.address.country].filter(Boolean).join(', ')
    : '';
  const locationSearch = locationSearchOverride ?? listingLocationLabel;

  const { register, handleSubmit, control, setValue, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(editSchema),
  });

  const listingType = useWatch({ control, name: 'listingType' }) ?? 'rent';

  const updateMapMarker = useCallback((lat: number, lng: number) => {
    const nextCenter: [number, number] = [lat, lng];
    mapCenterRef.current = nextCenter;
    setMapCenterOverride(nextCenter);

    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
      }
    }
  }, []);

  const applyGeoResult = useCallback((result: GeoResult | null, lat: number, lng: number) => {
    setValue('latitude', lat);
    setValue('longitude', lng);
    updateMapMarker(lat, lng);

    if (!result) return;

    setLocationSearchTouched(false);
    setLocationSearchOverride(result.label);
    const address = result.address ?? {};
    const street = [address.house_number, address.road].filter(Boolean).join(' ').trim();

    if (street) setValue('street', street);
    if (address.city || address.town || address.village) setValue('city', address.city || address.town || address.village || '');
    if (address.state || address.region || address.county) setValue('region', address.state || address.region || address.county || '');
    if (address.country) setValue('country', address.country);
    if (address.postcode) setValue('postalCode', address.postcode);
  }, [setValue, updateMapMarker]);

  // Populate form once listing loads
  useEffect(() => {
    if (!listing) return;
    reset({
      title:            listing.title,
      description:      listing.description ?? '',
      listingType:      listing.listingType,
      category:         listing.category,
      propertyType:     listing.propertyType,
      price:            listing.price,
      monthlyRent:      listing.monthlyRent,
      currency:         listing.currency ?? 'USD',
      bedrooms:         listing.bedrooms,
      bathrooms:        listing.bathrooms,
      areaValue:        listing.area?.value,
      areaUnit:         listing.area?.unit ?? 'sqm',
      furnishingStatus: listing.furnishingStatus,
      street:           listing.address.street,
      city:             listing.address.city,
      region:           listing.address.region ?? '',
      country:          listing.address.country,
      postalCode:       listing.address.postalCode ?? '',
      longitude:        listing.location.coordinates[0],
      latitude:         listing.location.coordinates[1],
      amenities:        listing.amenities?.join(', ') ?? '',
      neighborhoodInfo: listing.neighborhoodInfo ?? '',
      utilityDetails:   listing.utilityDetails ?? '',
      rentalTerms:      listing.rentalTerms ?? '',
      saleTerms:        listing.saleTerms ?? '',
      legalNotes:       listing.legalNotes ?? '',
    });
  }, [listing, reset]);

  useEffect(() => {
    mapCenterRef.current = mapCenter;
  }, [mapCenter]);

  useEffect(() => {
    if (showMap && mapContainerRef.current && !mapRef.current) {
      const container = mapContainerRef.current;
      container.style.height = '300px';
      container.style.width = '100%';

      const map = L.map(container).setView(mapCenterRef.current, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      if (listing?.location?.coordinates) {
        const [lng, lat] = listing.location.coordinates;
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }

      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        applyGeoResult(null, lat, lng);

        try {
          const result = await reverseGeocode(lat, lng);
          applyGeoResult(result, lat, lng);
        } catch {
          toast.error('Failed to look up address for the selected point.');
        }
      });

      setTimeout(() => {
        map.invalidateSize();
      }, 100);

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [showMap, listing?.location?.coordinates, applyGeoResult]);

  useEffect(() => {
    const query = locationSearch.trim();

    if (!locationSearchTouched || query.length < 3) {
      return;
    }

    const requestId = searchRequestIdRef.current + 1;
    searchRequestIdRef.current = requestId;

    const timeoutId = window.setTimeout(async () => {
      setSearchingLocation(true);
      try {
        const results = await geocode(query);
        if (searchRequestIdRef.current !== requestId) return;
        setLocationSuggestions(results.slice(0, 5));
      } catch {
        if (searchRequestIdRef.current !== requestId) return;
        toast.error('Failed to search location. Please try again.');
        setLocationSuggestions([]);
      } finally {
        if (searchRequestIdRef.current === requestId) {
          setSearchingLocation(false);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [locationSearch, locationSearchTouched]);

  if (!currentUser) return null;

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>;
  }

  if (!listing) {
    return <div className="p-8 text-center"><p className="text-sm text-black/40">Listing not found.</p><Link href="/properties" className="text-emerald-500 text-sm mt-2 inline-block">← Back</Link></div>;
  }

  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';
  const isOwner = listing.createdBy === currentUser.id;
  const canEdit = isAdmin || (isOwner && (listing.status === 'draft' || listing.status === 'rejected'));

  if (!canEdit) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-black/40">
          {isOwner
            ? `This listing cannot be edited in its current status (${listing.status}).`
            : 'You do not have permission to edit this listing.'}
        </p>
        <Link href={`/properties/${id}`} className="text-emerald-500 text-sm mt-2 inline-block">← Back to listing</Link>
      </div>
    );
  }

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        applyGeoResult(null, latitude, longitude);

        try {
          const result = await reverseGeocode(latitude, longitude);
          applyGeoResult(result, latitude, longitude);
        } catch {
          toast.error('Location captured, but address lookup failed.');
        }

        toast.success('Location captured successfully');
        setGettingLocation(false);
      },
      () => {
        toast.error('Failed to get location. Please enable location services.');
        setGettingLocation(false);
      }
    );
  };

  const handleSelectLocation = (suggestion: GeoResult) => {
    const [lon, lat] = suggestion.location.coordinates;
    searchRequestIdRef.current += 1;
    setSearchingLocation(false);
    applyGeoResult(suggestion, lat, lon);
    setLocationSuggestions([]);
  };

  const onSubmit = (data: FormValues) => {
    const input = {
      title:            data.title,
      description:      data.description,
      listingType:      data.listingType,
      category:         data.category,
      propertyType:     data.propertyType as import('@/features/listings/types/listing.types').PropertyType,
      ...(data.listingType === 'sale' ? { price: data.price } : { monthlyRent: data.monthlyRent }),
      currency:         data.currency,
      bedrooms:         data.bedrooms,
      bathrooms:        data.bathrooms,
      area:             data.areaValue ? { value: data.areaValue, unit: data.areaUnit } : undefined,
      furnishingStatus: data.furnishingStatus,
      amenities:        data.amenities ? data.amenities.split(',').map((s) => s.trim()).filter(Boolean) : [],
      neighborhoodInfo: data.neighborhoodInfo,
      utilityDetails:   data.utilityDetails,
      rentalTerms:      data.rentalTerms,
      saleTerms:        data.saleTerms,
      legalNotes:       data.legalNotes,
      address: {
        street:     data.street,
        city:       data.city,
        region:     data.region,
        country:    data.country,
        postalCode: data.postalCode,
      },
      location: {
        type: 'Point' as const,
        coordinates: [data.longitude, data.latitude] as [number, number],
      },
    };

    update(input, {
      onSuccess: () => {
        toast.success('Listing updated.');
        router.push(`/properties/${id}`);
      },
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/properties/${id}`} className="text-black/30 hover:text-black/60"><ArrowLeft size={18} /></Link>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">Edit Listing</p>
          <h1 className="text-2xl font-light text-[#0f172a] tracking-tight line-clamp-1">{listing.title}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>

        {/* Listing type */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-4">Listing Type</p>
          <div className="grid grid-cols-2 gap-3">
            {(['rent', 'sale'] as const).map((type) => (
              <button key={type} type="button"
                onClick={() => { setValue('listingType', type); }}
                className={cn('py-3 rounded-xl border text-sm font-medium transition-all capitalize',
                  listingType === type ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-black/50 hover:border-gray-300')}>
                For {type === 'rent' ? 'Rent' : 'Sale'}
              </button>
            ))}
          </div>
        </div>

        {/* Basic info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">Basic Information</p>

          <F label="Title" error={errors.title?.message} required>
            <input {...register('title')} className={cn(inputClass, errors.title && inputErrorClass)} />
          </F>
          <F label="Description" error={errors.description?.message}>
            <textarea {...register('description')} rows={4} className={cn(inputClass, 'h-auto resize-none py-2')} />
          </F>

          <div className="grid grid-cols-2 gap-4">
            <F label="Category" error={errors.category?.message} required>
              <select {...register('category')} className={inputClass}>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </F>
            <F label="Property Type" error={errors.propertyType?.message} required>
              <select {...register('propertyType')} className={cn(inputClass, errors.propertyType && inputErrorClass)}>
                {['apartment','house','villa','condominium','land','commercial_space','office','warehouse','shop','mixed_use'].map((t) => (
                  <option key={t} value={t}>{t.replace('_',' ')}</option>
                ))}
              </select>
            </F>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {listingType === 'sale' ? (
              <F label="Sale Price" error={errors.price?.message} required>
                <input type="number" {...register('price', { valueAsNumber: true })} className={cn(inputClass, errors.price && inputErrorClass)} />
              </F>
            ) : (
              <F label="Monthly Rent" error={errors.monthlyRent?.message} required>
                <input type="number" {...register('monthlyRent', { valueAsNumber: true })} className={cn(inputClass, errors.monthlyRent && inputErrorClass)} />
              </F>
            )}
            <F label="Currency">
              <select {...register('currency')} className={inputClass}>
                {['USD','ETB','EUR','GBP'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </F>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <F label="Bedrooms"><input type="number" {...register('bedrooms', { valueAsNumber: true })} className={inputClass} /></F>
            <F label="Bathrooms"><input type="number" {...register('bathrooms', { valueAsNumber: true })} className={inputClass} /></F>
            <F label="Furnishing">
              <select {...register('furnishingStatus')} className={inputClass}>
                <option value="">Not specified</option>
                <option value="furnished">Furnished</option>
                <option value="semi_furnished">Semi-furnished</option>
                <option value="unfurnished">Unfurnished</option>
              </select>
            </F>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <F label="Area Value"><input type="number" {...register('areaValue', { valueAsNumber: true })} className={inputClass} /></F>
            <F label="Area Unit"><select {...register('areaUnit')} className={inputClass}><option value="sqm">sqm</option><option value="sqft">sqft</option></select></F>
          </div>

          <F label="Amenities" hint="Comma-separated: parking, gym, pool">
            <input {...register('amenities')} className={inputClass} />
          </F>
          <F label="Neighbourhood Info">
            <input {...register('neighborhoodInfo')} className={inputClass} />
          </F>
          <F label="Utility Details">
            <input {...register('utilityDetails')} className={inputClass} />
          </F>
          {listingType === 'rent' && (
            <F label="Rental Terms"><textarea {...register('rentalTerms')} rows={2} className={cn(inputClass, 'h-auto py-2 resize-none')} /></F>
          )}
          {listingType === 'sale' && (
            <F label="Sale Terms"><textarea {...register('saleTerms')} rows={2} className={cn(inputClass, 'h-auto py-2 resize-none')} /></F>
          )}
          <F label="Legal Notes"><textarea {...register('legalNotes')} rows={2} className={cn(inputClass, 'h-auto py-2 resize-none')} /></F>
        </div>

        {/* Address */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">Address</p>
          <F label="Street" error={errors.street?.message} required><input {...register('street')} className={cn(inputClass, errors.street && inputErrorClass)} /></F>
          <div className="grid grid-cols-2 gap-4">
            <F label="City" error={errors.city?.message} required><input {...register('city')} className={cn(inputClass, errors.city && inputErrorClass)} /></F>
            <F label="Region"><input {...register('region')} className={inputClass} /></F>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <F label="Country" error={errors.country?.message} required><input {...register('country')} className={cn(inputClass, errors.country && inputErrorClass)} /></F>
            <F label="Postal Code"><input {...register('postalCode')} className={inputClass} /></F>
          </div>
        </div>

        {/* Coordinates */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><MapPin size={14} className="text-black/40" /><p className="text-[10px] font-mono uppercase tracking-widest text-black/35">GPS Coordinates</p></div>
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={gettingLocation}
              className="flex items-center gap-1.5 text-xs bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-black/60 px-3 py-2 rounded-lg transition-colors"
            >
              {gettingLocation ? <Loader2 size={12} className="animate-spin" /> : <Crosshair size={12} />}
              Use Current Location
            </button>
          </div>

          <div className="relative">
            <div className="relative">
              {searchingLocation ? (
                <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30 animate-spin pointer-events-none" />
              ) : (
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30 pointer-events-none" />
              )}
              <input
                type="text"
                value={locationSearch}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setLocationSearchTouched(true);
                  setLocationSearchOverride(nextValue);

                  if (nextValue.trim().length < 3) {
                    searchRequestIdRef.current += 1;
                    setSearchingLocation(false);
                    setLocationSuggestions([]);
                  }
                }}
                placeholder="Search location (e.g., Bole, Addis Ababa)"
                className="w-full h-11 rounded-2xl border border-gray-200 pl-10 pr-3 text-sm text-black/70 placeholder:text-black/25 focus:outline-none focus:border-emerald-400"
              />
            </div>
            {(locationSuggestions.length > 0 || (locationSearchTouched && locationSearch.trim().length >= 3 && !searchingLocation)) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                {locationSuggestions.length > 0 ? locationSuggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.label}-${index}`}
                    type="button"
                    onClick={() => handleSelectLocation(suggestion)}
                    className="w-full text-left px-4 py-3 text-sm text-black/70 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium">{suggestion.label}</div>
                  </button>
                )) : (
                  <div className="px-4 py-3 text-sm text-black/45">No matching locations found.</div>
                )}
              </div>
            )}
          </div>

          {showMap && (
            <div className="h-[300px] rounded-xl overflow-hidden border border-gray-200">
              <div ref={mapContainerRef} className="w-full h-full" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <F label="Longitude" error={errors.longitude?.message} required>
              <input type="number" step="any" {...register('longitude', { valueAsNumber: true })} className={cn(inputClass, errors.longitude && inputErrorClass)} />
            </F>
            <F label="Latitude" error={errors.latitude?.message} required>
              <input type="number" step="any" {...register('latitude', { valueAsNumber: true })} className={cn(inputClass, errors.latitude && inputErrorClass)} />
            </F>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Link href={`/properties/${id}`} className="text-xs text-black/40 hover:text-black/60">← Cancel</Link>
          <button type="submit" disabled={isPending}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-colors">
            {isPending ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

function F({ label, error, hint, required, children }: { label: string; error?: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}{required && <span className="ml-0.5 text-red-500">*</span>}</label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
