'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Loader2, Crosshair, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Link from 'next/link';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useAuthStore } from '@/stores/auth.store';
import { useCreateListing } from '@/features/listings/queries/listing.queries';
import { inputClass, inputErrorClass } from '@/components/forms/styles';
import { cn } from '@/lib/utils';

// ─── Schema ───────────────────────────────────────────────────────────────────

const createSchema = z.object({
  title:           z.string().min(5, 'Min 5 characters').max(200),
  description:     z.string().max(5000).optional(),
  listingType:     z.enum(['sale', 'rent']),
  category:        z.enum(['residential', 'commercial']),
  propertyType:    z.string().min(1, 'Required'),
  price:           z.number().positive().optional(),
  monthlyRent:     z.number().positive().optional(),
  currency:        z.string().default('USD'),
  bedrooms:        z.number().int().min(0).optional(),
  bathrooms:       z.number().int().min(0).optional(),
  areaValue:       z.number().positive().optional(),
  areaUnit:        z.enum(['sqm', 'sqft']).default('sqm'),
  furnishingStatus: z.enum(['furnished', 'semi_furnished', 'unfurnished']).optional(),
  street:          z.string().min(1, 'Street is required'),
  city:            z.string().min(1, 'City is required'),
  region:          z.string().optional(),
  country:         z.string().min(1, 'Country is required'),
  postalCode:      z.string().optional(),
  longitude:       z.number({ message: 'Enter a valid longitude' }).or(z.number()),
  latitude:        z.number({ message: 'Enter a valid latitude' }).or(z.number()),
  amenities:       z.string().optional(), // comma-separated
}).refine((d) => {
  if (d.listingType === 'sale') return !!d.price;
  return !!d.monthlyRent;
}, { message: 'Enter the price for this listing type', path: ['price'] });

type FormValues = z.infer<typeof createSchema>;

// ─── CreateListingPage ────────────────────────────────────────────────────────

export default function CreateListingPage() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const { mutate: create, isPending } = useCreateListing();
  const [listingType, setListingType] = useState<'sale' | 'rent'>('rent');
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.4897, 9.1450]); // Ethiopia center
  const [locationSearch, setLocationSearch] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [gettingLocation, setGettingLocation] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(createSchema) as any,
    defaultValues: {
      title: '',
      listingType: 'rent',
      category: 'residential',
      propertyType: '',
      currency: 'USD',
      areaUnit: 'sqm',
      street: '',
      city: '',
      country: '',
    } as any,
  });

  useEffect(() => {
    if (currentUser && currentUser.role === 'PROPERTY_OWNER' && currentUser.kycStatus !== 'verified') {
      toast.error('Please complete KYC verification to create listings.');
      router.push('/kyc');
    }
  }, [currentUser, router]);

  // Initialize map when shown
  useEffect(() => {
    if (showMap && mapContainerRef.current && !mapRef.current) {
      // Ensure container has proper dimensions
      const container = mapContainerRef.current;
      container.style.height = '300px';
      container.style.width = '100%';

      const map = L.map(container).setView(mapCenter, 13);

      // Use standard OpenStreetMap tiles instead of MapTiler JSON style
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Handle map click to set location
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        setValue('latitude', lat);
        setValue('longitude', lng);
        setMapCenter([lng, lat]);

        // Update or create marker
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(map);
        }
      });

      // Force map to invalidate size after initialization
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [showMap, mapCenter, setValue]);

  // Get current location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setValue('latitude', latitude);
        setValue('longitude', longitude);
        setMapCenter([longitude, latitude]);
        toast.success('Location captured successfully');
        setGettingLocation(false);
      },
      (error) => {
        toast.error('Failed to get location. Please enable location services.');
        setGettingLocation(false);
      }
    );
  };

  // Search location using Nominatim (OpenStreetMap)
  const handleLocationSearch = async (query: string) => {
    setLocationSearch(query);
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setLocationSuggestions(data);
    } catch (error) {
      console.error('Location search error:', error);
    }
  };

  // Select location from suggestions
  const handleSelectLocation = (suggestion: any) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    setValue('latitude', lat);
    setValue('longitude', lon);
    setMapCenter([lon, lat]);
    setLocationSearch(suggestion.display_name);
    setLocationSuggestions([]);

    // Update map if shown
    if (mapRef.current) {
      mapRef.current.setView([lat, lon], 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lon]);
      } else {
        markerRef.current = L.marker([lat, lon]).addTo(mapRef.current);
      }
    }
  };

  if (!currentUser || (currentUser.role !== 'PROPERTY_OWNER' && currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')) {
    return <div className="p-8 text-sm text-black/50">You don&apos;t have permission to create listings.</div>;
  }

  if (currentUser && currentUser.role === 'PROPERTY_OWNER' && currentUser.kycStatus !== 'verified') {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4 text-black/50 text-sm">
          <Loader2 className="animate-spin" />
          <p>Redirecting to KYC verification...</p>
        </div>
      </div>
    );
  }

  const onSubmit = (data: FormValues) => {
    const input = {
      title:        data.title,
      description:  data.description,
      listingType:  data.listingType,
      category:     data.category,
      propertyType: data.propertyType as import('@/features/listings/types/listing.types').PropertyType,
      ...(data.listingType === 'sale' ? { price: data.price } : { monthlyRent: data.monthlyRent }),
      currency: data.currency,
      bedrooms:     data.bedrooms,
      bathrooms:    data.bathrooms,
      area: data.areaValue ? { value: data.areaValue, unit: data.areaUnit } : undefined,
      furnishingStatus: data.furnishingStatus,
      amenities: data.amenities ? data.amenities.split(',').map((s) => s.trim()).filter(Boolean) : [],
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

    create(input, {
      onSuccess: (listing) => {
        toast.success('Draft created! Upload documents to start verification.');
        router.push(`/properties/${listing.id}`);
      },
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/properties" className="text-black/30 hover:text-black/60 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">Property Owner</p>
          <h1 className="text-2xl font-light text-[#0f172a] tracking-tight">Create Listing</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>

        {/* ── Listing type toggle ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35 mb-4">Listing Type</p>
          <div className="grid grid-cols-2 gap-3">
            {(['rent', 'sale'] as const).map((type) => (
              <button key={type} type="button"
                onClick={() => { setListingType(type); setValue('listingType', type); }}
                className={cn('py-3 rounded-xl border text-sm font-medium transition-all capitalize',
                  listingType === type ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-black/50 hover:border-gray-300')}>
                For {type === 'rent' ? 'Rent' : 'Sale'}
              </button>
            ))}
          </div>
          {errors.listingType && <p className="text-xs text-red-500 mt-1">{errors.listingType.message}</p>}
        </div>

        {/* ── Basic info ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">Basic Information</p>

          <Field label="Title" error={errors.title?.message} required>
            <input {...register('title')} placeholder="e.g. Modern 3BR Apartment in Bole" className={cn(inputClass, errors.title && inputErrorClass)} />
          </Field>

          <Field label="Description" error={errors.description?.message}>
            <textarea {...register('description')} rows={4} placeholder="Describe the property…"
              className={cn(inputClass, 'h-auto resize-none py-2', errors.description && inputErrorClass)} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category" error={errors.category?.message} required>
              <select {...register('category')} className={cn(inputClass, errors.category && inputErrorClass)}>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </Field>

            <Field label="Property Type" error={errors.propertyType?.message} required>
              <select {...register('propertyType')} className={cn(inputClass, errors.propertyType && inputErrorClass)}>
                <option value="">Select…</option>
                {['apartment','house','villa','condominium','land','commercial_space','office','warehouse','shop','mixed_use'].map((t) => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {listingType === 'sale' ? (
              <Field label="Sale Price" error={errors.price?.message} required>
                <input type="number" {...register('price', { valueAsNumber: true })} placeholder="250000"
                  className={cn(inputClass, errors.price && inputErrorClass)} />
              </Field>
            ) : (
              <Field label="Monthly Rent" error={errors.monthlyRent?.message} required>
                <input type="number" {...register('monthlyRent', { valueAsNumber: true })} placeholder="1500"
                  className={cn(inputClass, errors.monthlyRent && inputErrorClass)} />
              </Field>
            )}
            <Field label="Currency" error={errors.currency?.message}>
              <select {...register('currency')} className={inputClass}>
                {['USD','ETB','EUR','GBP'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Bedrooms">
              <input type="number" {...register('bedrooms', { valueAsNumber: true })} min={0} placeholder="3" className={inputClass} />
            </Field>
            <Field label="Bathrooms">
              <input type="number" {...register('bathrooms', { valueAsNumber: true })} min={0} placeholder="2" className={inputClass} />
            </Field>
            <Field label="Furnishing">
              <select {...register('furnishingStatus')} className={inputClass}>
                <option value="">Not specified</option>
                <option value="furnished">Furnished</option>
                <option value="semi_furnished">Semi-furnished</option>
                <option value="unfurnished">Unfurnished</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Area Value">
              <input type="number" {...register('areaValue', { valueAsNumber: true })} placeholder="120" className={inputClass} />
            </Field>
            <Field label="Area Unit">
              <select {...register('areaUnit')} className={inputClass}>
                <option value="sqm">sqm</option>
                <option value="sqft">sqft</option>
              </select>
            </Field>
          </div>

          <Field label="Amenities" hint="Comma-separated: parking, gym, pool">
            <input {...register('amenities')} placeholder="parking, gym, pool, security" className={inputClass} />
          </Field>
        </div>

        {/* ── Address ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">Address</p>

          <Field label="Street" error={errors.street?.message} required>
            <input {...register('street')} placeholder="123 Main Street" className={cn(inputClass, errors.street && inputErrorClass)} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="City" error={errors.city?.message} required>
              <input {...register('city')} placeholder="Addis Ababa" className={cn(inputClass, errors.city && inputErrorClass)} />
            </Field>
            <Field label="Region">
              <input {...register('region')} placeholder="Addis Ababa" className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Country" error={errors.country?.message} required>
              <input {...register('country')} placeholder="Ethiopia" className={cn(inputClass, errors.country && inputErrorClass)} />
            </Field>
            <Field label="Postal Code">
              <input {...register('postalCode')} placeholder="1000" className={inputClass} />
            </Field>
          </div>
        </div>

        {/* ── Location coordinates ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-black/40" />
              <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">GPS Coordinates</p>
            </div>
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>

          {/* Location options */}
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

          {/* Location search */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30 pointer-events-none" />
              <input
                type="text"
                value={locationSearch}
                onChange={(e) => handleLocationSearch(e.target.value)}
                placeholder="Search location (e.g., Bole, Addis Ababa)"
                className="w-full h-11 rounded-2xl border border-gray-200 pl-10 pr-3 text-sm text-black/70 placeholder:text-black/25 focus:outline-none focus:border-emerald-400"
              />
            </div>
            {locationSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                {locationSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectLocation(suggestion)}
                    className="w-full text-left px-4 py-3 text-sm text-black/70 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium">{suggestion.display_name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Map */}
          {showMap && (
            <div className="h-[300px] rounded-xl overflow-hidden border border-gray-200">
              <div ref={mapContainerRef} className="w-full h-full" />
            </div>
          )}

          {/* Manual coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Longitude" error={errors.longitude?.message} required>
              <input type="number" step="any" {...register('longitude', { valueAsNumber: true })} placeholder="38.7578"
                className={cn(inputClass, errors.longitude && inputErrorClass)} />
            </Field>
            <Field label="Latitude" error={errors.latitude?.message} required>
              <input type="number" step="any" {...register('latitude', { valueAsNumber: true })} placeholder="8.9806"
                className={cn(inputClass, errors.latitude && inputErrorClass)} />
            </Field>
          </div>
          <p className="text-xs text-black/40">Or find coordinates at <a href="https://www.latlong.net" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">latlong.net</a></p>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-black/35 font-light">Listing will be saved as a draft. Upload ownership documents to start verification.</p>
          <button type="submit" disabled={isPending}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-colors">
            {isPending ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : 'Create Draft'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Shared Field ─────────────────────────────────────────────────────────────

function Field({ label, error, hint, required, children }: {
  label: string; error?: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
