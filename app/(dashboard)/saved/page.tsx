'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Heart, Search, Loader2, AlertCircle, Trash2, Bell, BellOff,
  Pencil, Plus, X, Check, ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/features/favorites/queries/favorite.queries';
import { ListingCard } from '@/components/listing/ListingCard';
import { FavoriteButton } from '@/components/common/FavoriteButton';
import {
  useSavedSearches,
  useCreateSavedSearch,
  useUpdateSavedSearch,
  useDeleteSavedSearch,
} from '@/features/saved-searches/queries/saved-search.queries';
import type {
  SavedSearch,
  SavedSearchQuery,
  CreateSavedSearchInput,
} from '@/features/saved-searches/types/saved-search.types';
import {
  buildSavedSearchPills,
  buildSavedSearchParams,
  hasSavedSearchFilters,
  hasSpatialFilters,
} from '@/features/saved-searches/utils/saved-search.utils';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SavedPage() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const activeTab     = searchParams.get('tab') === 'searches' ? 'searches' : 'properties';

  const setTab = (tab: 'properties' | 'searches') => {
    router.replace(tab === 'searches' ? '/saved?tab=searches' : '/saved');
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-6 h-6 text-rose-400 shrink-0" />
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">Tenant</p>
          <h1 className="text-2xl font-light text-[#0f172a] tracking-tight">Saved</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {([
          { key: 'properties', label: 'Saved Properties', icon: Heart  },
          { key: 'searches',   label: 'Saved Searches',   icon: Search },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg transition-all',
              activeTab === key
                ? 'bg-white text-black shadow-sm'
                : 'text-black/50 hover:text-black/70',
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'properties' ? <SavedPropertiesTab /> : <SavedSearchesTab />}
    </div>
  );
}

// ─── Saved Properties Tab ─────────────────────────────────────────────────────

function SavedPropertiesTab() {
  const { data: favorites = [], isLoading, isError } = useFavorites();

  if (isLoading) return <Spinner />;

  if (isError) return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
      <p className="text-xs text-red-700">Failed to load saved listings. Please try again.</p>
    </div>
  );

  if (favorites.length === 0) return (
    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4">
        <Heart className="w-7 h-7 text-rose-400" />
      </div>
      <p className="text-sm font-medium text-gray-700 mb-1">No saved properties yet</p>
      <p className="text-xs text-gray-400 mb-5">Tap the heart on any listing to save it here.</p>
      <Link
        href="/properties"
        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors"
      >
        Browse Properties
      </Link>
    </div>
  );

  return (
    <>
      <p className="text-xs text-black/35 font-mono mb-4">
        {favorites.length} saved {favorites.length === 1 ? 'property' : 'properties'}
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {favorites.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            favoriteSlot={<FavoriteButton listingId={listing.id} />}
          />
        ))}
      </div>
    </>
  );
}

// ─── Saved Searches Tab ───────────────────────────────────────────────────────

function SavedSearchesTab() {
  const { data: searches = [], isLoading, isError } = useSavedSearches();
  const { mutate: deleteSearch, isPending: deleting } = useDeleteSavedSearch();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  if (isLoading) return <Spinner />;

  if (isError) return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
      <p className="text-xs text-red-700">Failed to load saved searches. Please try again.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-black/35 font-mono">
          {searches.length} saved {searches.length === 1 ? 'search' : 'searches'}
        </p>
        <button
          type="button"
          onClick={() => { setCreating(true); setEditingId(null); }}
          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> New Search
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <SearchForm
          onClose={() => setCreating(false)}
        />
      )}

      {/* Empty state */}
      {searches.length === 0 && !creating && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">No saved searches yet</p>
          <p className="text-xs text-gray-400 mb-5">
            Save a search with filters to get back to it quickly and enable alerts.
          </p>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Create First Search
          </button>
        </div>
      )}

      {/* Search cards */}
      {searches.map((s) => (
        editingId === s.id ? (
          <SearchForm
            key={s.id}
            existing={s}
            onClose={() => setEditingId(null)}
          />
        ) : (
          <SearchCard
            key={s.id}
            search={s}
            onEdit={() => { setEditingId(s.id); setCreating(false); }}
            onDelete={() => deleteSearch(s.id)}
            isDeleting={deleting}
          />
        )
      ))}
    </div>
  );
}

// ─── Search Card ──────────────────────────────────────────────────────────────

function SearchCard({
  search, onEdit, onDelete, isDeleting,
}: {
  search: SavedSearch;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const { mutate: update, isPending: toggling } = useUpdateSavedSearch(search.id);
  const q = search.query;
  const pills = buildSavedSearchPills(q);
  const browseHref = `/properties?${buildSavedSearchParams(q).toString()}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate mb-2">{search.name}</p>

          {/* Filter pills */}
          {pills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {pills.map((pill) => (
                <span key={pill} className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {pill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 mb-3">No filters applied — matches all listings.</p>
          )}

          <p className="text-[10px] text-gray-400 font-mono">
            Updated {new Date(search.updatedAt ?? search.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Alert toggle */}
          <button
            type="button"
            disabled={toggling}
            onClick={() => update({ alertEnabled: !search.alertEnabled })}
            title={search.alertEnabled ? 'Disable alerts' : 'Enable alerts'}
            className={cn(
              'p-2 rounded-xl border text-xs font-medium transition-colors disabled:opacity-50',
              search.alertEnabled
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100',
            )}
          >
            {search.alertEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
          </button>

          {/* Edit */}
          <button
            type="button"
            onClick={onEdit}
            title="Edit"
            className="p-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            type="button"
            disabled={isDeleting}
            onClick={onDelete}
            title="Delete"
            className="p-2 rounded-xl border border-red-100 bg-red-50 text-red-400 hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Run search button */}
      <Link
        href={browseHref}
        className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        Run this search
      </Link>
    </div>
  );
}

// ─── Search Form (create & edit) ──────────────────────────────────────────────

function SearchForm({
  existing,
  onClose,
}: {
  existing?: SavedSearch;
  onClose: () => void;
}) {
  const { mutate: create, isPending: creating } = useCreateSavedSearch();
  const { mutate: update, isPending: updating } = useUpdateSavedSearch(existing?.id ?? '');

  const [name,         setName]         = useState(existing?.name ?? '');
  const [listingType,  setListingType]  = useState<string>(existing?.query.listingType ?? '');
  const [category,     setCategory]     = useState<string>(existing?.query.category    ?? '');
  const [propertyType, setPropertyType] = useState<string>(existing?.query.propertyType ?? '');
  const [minPrice,     setMinPrice]     = useState<string>(existing?.query.minPrice    != null ? String(existing.query.minPrice)    : '');
  const [maxPrice,     setMaxPrice]     = useState<string>(existing?.query.maxPrice    != null ? String(existing.query.maxPrice)    : '');
  const [minBedrooms,  setMinBedrooms]  = useState<string>(existing?.query.minBedrooms != null ? String(existing.query.minBedrooms)  : '');
  const [minBathrooms, setMinBathrooms] = useState<string>(existing?.query.minBathrooms!= null ? String(existing.query.minBathrooms) : '');
  const [alertEnabled, setAlertEnabled] = useState(existing?.alertEnabled ?? false);

  const isPending = creating || updating;

  const buildQuery = (): SavedSearchQuery => {
    const preserved = { ...(existing?.query ?? {}) };
    delete preserved.listingType;
    delete preserved.category;
    delete preserved.propertyType;
    delete preserved.minPrice;
    delete preserved.maxPrice;
    delete preserved.minBedrooms;
    delete preserved.minBathrooms;

    return {
      ...preserved,
      ...(listingType  && { listingType:  listingType  as 'sale' | 'rent' }),
      ...(category     && { category:     category     as 'residential' | 'commercial' }),
      ...(propertyType && { propertyType: propertyType as NonNullable<SavedSearchQuery['propertyType']> }),
      ...(minPrice     && { minPrice:     Number(minPrice) }),
      ...(maxPrice     && { maxPrice:     Number(maxPrice) }),
      ...(minBedrooms  && { minBedrooms:  Number(minBedrooms) }),
      ...(minBathrooms && { minBathrooms: Number(minBathrooms) }),
    };
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const query = buildQuery();
    if (!hasSavedSearchFilters(query)) return;
    const payload: CreateSavedSearchInput = {
      name:         name.trim(),
      query,
      alertEnabled,
    };
    if (existing) {
      update(payload, { onSuccess: onClose });
    } else {
      create(payload, { onSuccess: onClose });
    }
  };

  const labelCls = 'text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1 block';
  const inputCls = 'w-full h-9 rounded-lg border border-gray-200 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:border-emerald-400 transition-colors';

  return (
    <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-900">
          {existing ? 'Edit Search' : 'New Saved Search'}
        </p>
        <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {/* Name */}
        <div>
          <label className={labelCls}>Search name *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. 2-bed apartments in Geneva"
            required
            className={inputCls}
          />
        </div>

        {/* Type + Category row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Listing type</label>
            <select value={listingType} onChange={e => setListingType(e.target.value)} className={inputCls}>
              <option value="">Any</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
              <option value="">Any</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Property type</label>
          <select value={propertyType} onChange={e => setPropertyType(e.target.value)} className={inputCls}>
            <option value="">Any</option>
            {['apartment','house','villa','condominium','land','commercial_space','office','warehouse','shop','mixed_use'].map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        {existing && hasSpatialFilters(existing.query) && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            Spatial filters are preserved for this saved search and can be re-run from the card below.
          </div>
        )}

        {/* Price row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Min price</label>
            <input type="number" min={0} value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Any" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Max price</label>
            <input type="number" min={0} value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Any" className={inputCls} />
          </div>
        </div>

        {/* Beds + Baths row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Min bedrooms</label>
            <select value={minBedrooms} onChange={e => setMinBedrooms(e.target.value)} className={inputCls}>
              <option value="">Any</option>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}+</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Min bathrooms</label>
            <select value={minBathrooms} onChange={e => setMinBathrooms(e.target.value)} className={inputCls}>
              <option value="">Any</option>
              {[1,2,3,4].map(n => <option key={n} value={n}>{n}+</option>)}
            </select>
          </div>
        </div>

        {/* Alert toggle */}
        <button
          type="button"
          onClick={() => setAlertEnabled(v => !v)}
          className={cn(
            'flex items-center gap-2 w-full px-4 py-2.5 rounded-xl border text-xs font-medium transition-colors',
            alertEnabled
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-gray-50 border-gray-200 text-gray-500',
          )}
        >
          {alertEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
          {alertEnabled ? 'Email alerts ON — notify me of new matches' : 'Email alerts OFF'}
        </button>

        {/* Submit row */}
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={isPending || !name.trim() || !hasSavedSearchFilters(buildQuery())}
            className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            {existing ? 'Save changes' : 'Save search'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
    </div>
  );
}
