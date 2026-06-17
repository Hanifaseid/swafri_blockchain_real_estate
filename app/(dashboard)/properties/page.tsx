'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, Plus, Search, SlidersHorizontal, X, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useListings, useMyListings, useAdminListings, useDeleteListing, useTransitionListing } from '@/features/listings/queries/listing.queries';
import { listingToSummary } from '@/features/listings/types/listing.types';
import type { Listing, ListingFilters, TransitionAction } from '@/features/listings/types/listing.types';
import { ListingCard } from '@/components/listing/ListingCard';
import { FavoriteButton } from '@/components/common/FavoriteButton';
import { cn } from '@/lib/utils';

// ─── Properties Page ──────────────────────────────────────────────────────────
// Role-aware: TENANT=browse, PROPERTY_OWNER=manage, ADMIN=review queue

export default function PropertiesPage() {
  const { currentUser } = useAuthStore();
  if (!currentUser) return null;

  if (currentUser.role === 'TENANT') return <TenantView />;
  if (currentUser.role === 'PROPERTY_OWNER') return <OwnerView />;
  return <AdminView />;
}

// ─── Tenant: Browse published listings ────────────────────────────────────────

function TenantView() {
  const [filters, setFilters] = useState<ListingFilters>({ limit: 20, page: 1 });
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useListings(filters);
  const listings = data?.items ?? [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, q: search || undefined, page: 1 }));
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-6 h-6 text-emerald-500 shrink-0" />
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">Marketplace</p>
          <h1 className="text-2xl font-light text-[#0f172a] tracking-tight">Browse Properties</h1>
        </div>
      </div>

      {/* Search + filter bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties…"
            className="w-full h-9 rounded-lg border border-gray-200 pl-9 pr-3 text-sm text-black/70 placeholder:text-black/25 focus:outline-none focus:border-emerald-400 bg-white"
          />
        </div>
        <button type="submit" className="h-9 px-4 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors">
          Search
        </button>
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className={cn('h-9 px-3 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5',
            showFilters ? 'bg-emerald-50 border-emerald-300 text-emerald-600' : 'border-gray-200 text-black/60 hover:border-gray-300 bg-white')}
        >
          <SlidersHorizontal size={13} /> Filters
        </button>
      </form>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-1.5 block">Type</label>
            <select value={filters.listingType ?? ''} onChange={(e) => setFilters((f) => ({ ...f, listingType: (e.target.value as 'sale' | 'rent') || undefined, page: 1 }))}
              className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm text-black/70 bg-white focus:outline-none focus:border-emerald-400">
              <option value="">All</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-1.5 block">Category</label>
            <select value={filters.category ?? ''} onChange={(e) => setFilters((f) => ({ ...f, category: (e.target.value as 'residential' | 'commercial') || undefined, page: 1 }))}
              className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm text-black/70 bg-white focus:outline-none focus:border-emerald-400">
              <option value="">All</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-1.5 block">Min Bedrooms</label>
            <select value={filters.minBedrooms ?? ''} onChange={(e) => setFilters((f) => ({ ...f, minBedrooms: e.target.value ? Number(e.target.value) : undefined, page: 1 }))}
              className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm text-black/70 bg-white focus:outline-none focus:border-emerald-400">
              <option value="">Any</option>
              {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}+</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-1.5 block">Max Price</label>
            <input type="number" value={filters.maxPrice ?? ''} onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value ? Number(e.target.value) : undefined, page: 1 }))}
              placeholder="Any" className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm text-black/70 bg-white focus:outline-none focus:border-emerald-400" />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-1.5 block">Sort</label>
            <select value={filters.sort ?? 'newest'} onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value as ListingFilters['sort'], page: 1 }))}
              className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm text-black/70 bg-white focus:outline-none focus:border-emerald-400">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
            </select>
          </div>
          <div className="flex items-end">
            <button type="button" onClick={() => { setFilters({ limit: 20, page: 1 }); setSearch(''); }}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors">
              <X size={12} /> Clear filters
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <Building2 className="w-10 h-10 text-black/15" />
          <p className="text-black/40 text-sm font-light">No properties found matching your filters.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-black/35 font-mono mb-4">{data?.total ?? listings.length} properties found</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listingToSummary(listing)}
                favoriteSlot={<FavoriteButton listingId={listing.id} />}
              />
            ))}
          </div>
          {/* Pagination */}
          {data && data.total > data.limit && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
                disabled={(filters.page ?? 1) <= 1}
                className="text-xs font-medium px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                Previous
              </button>
              <span className="text-xs text-black/40 font-mono">
                Page {filters.page ?? 1} of {Math.ceil(data.total / data.limit)}
              </span>
              <button onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
                disabled={(filters.page ?? 1) >= Math.ceil(data.total / data.limit)}
                className="text-xs font-medium px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Owner: My Listings ────────────────────────────────────────────────────────

function OwnerView() {
  const { currentUser } = useAuthStore();
  const { data: listings = [], isLoading } = useMyListings();
  const { mutate: deleteListing, isPending: deleting } = useDeleteListing();

  const canSubmit = currentUser?.status === 'ACTIVE' && currentUser?.kycStatus === 'APPROVED';

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-purple-500 shrink-0" />
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">Property Owner</p>
            <h1 className="text-2xl font-light text-[#0f172a] tracking-tight">My Listings</h1>
          </div>
        </div>
        <Link href="/properties/create"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus size={14} /> New Listing
        </Link>
      </div>

      {!canSubmit && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            Your account or KYC is not fully verified. You can create drafts but cannot submit for review until your KYC is approved.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <Building2 className="w-10 h-10 text-black/15 mx-auto mb-3" />
          <p className="text-sm text-black/40 font-light mb-4">You haven't created any listings yet.</p>
          <Link href="/properties/create" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors">
            <Plus size={14} /> Create First Listing
          </Link>
        </div>
      ) : (
        <OwnerListingsTable listings={listings} onDelete={(id) => deleteListing(id)} isDeleting={deleting} />
      )}
    </div>
  );
}

// ─── Owner listings table ─────────────────────────────────────────────────────

function OwnerListingsTable({ listings, onDelete, isDeleting }: {
  listings: Listing[];
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const STATUS_COLORS: Record<string, string> = {
    draft:        'bg-gray-100 text-gray-500',
    submitted:    'bg-amber-50 text-amber-600',
    under_review: 'bg-emerald-50 text-emerald-600',
    approved:     'bg-emerald-50 text-emerald-600',
    published:    'bg-emerald-100 text-emerald-700',
    rejected:     'bg-red-50 text-red-600',
    suspended:    'bg-orange-50 text-orange-600',
    rented:       'bg-sky-50 text-sky-600',
    sold:         'bg-purple-50 text-purple-600',
    archived:     'bg-gray-100 text-gray-400',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Title', 'Type', 'Price', 'Status', 'Verification', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-black/40">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-black/80 truncate max-w-xs">{l.title}</p>
                  <p className="text-[10px] text-black/35 font-mono">{l.address.city}, {l.address.country}</p>
                </td>
                <td className="px-4 py-3 text-xs text-black/60 capitalize">{l.listingType}</td>
                <td className="px-4 py-3 text-xs font-semibold text-black/80">
                  {l.listingType === 'rent'
                    ? `$${l.monthlyRent?.toLocaleString()}/mo`
                    : `$${l.price?.toLocaleString()}`}
                </td>
                <td className="px-4 py-3">
                  <span className={cn('text-[10px] font-mono uppercase px-2 py-0.5 rounded', STATUS_COLORS[l.status] ?? 'bg-gray-100 text-gray-500')}>
                    {l.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('text-[10px] font-mono uppercase px-2 py-0.5 rounded',
                    l.verificationStatus === 'verified' ? 'bg-emerald-50 text-emerald-600' :
                    l.verificationStatus === 'pending'  ? 'bg-amber-50 text-amber-600' :
                    l.verificationStatus === 'rejected' ? 'bg-red-50 text-red-500' :
                    'bg-gray-100 text-gray-400')}>
                    {l.verificationStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <Link href={`/properties/${l.id}`}
                      className="text-[10px] font-mono text-black/40 hover:text-black/70 px-2 py-1 rounded hover:bg-gray-100 transition-colors">
                      View
                    </Link>
                    {(l.status === 'draft' || l.status === 'rejected') && (
                      <Link href={`/properties/${l.id}/edit`}
                        className="text-[10px] font-mono text-emerald-500 hover:text-emerald-600 px-2 py-1 rounded hover:bg-emerald-50 transition-colors">
                        Edit
                      </Link>
                    )}
                    {(l.status === 'draft' || l.status === 'rejected') && (
                      <button type="button" onClick={() => onDelete(l.id)} disabled={isDeleting}
                        className="text-[10px] font-mono text-red-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-40">
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Admin: Review queue ──────────────────────────────────────────────────────

function AdminView() {
  const [statusFilter, setStatusFilter] = useState('submitted');
  const { data, isLoading } = useAdminListings({ status: statusFilter, limit: 20 });
  const listings = data?.items ?? [];

  const STATUS_TABS = ['submitted', 'under_review', 'approved', 'published', 'rejected', 'suspended'];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-6 h-6 text-emerald-500 shrink-0" />
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">Admin</p>
          <h1 className="text-2xl font-light text-[#0f172a] tracking-tight">Listing Review Queue</h1>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 flex-wrap mb-5">
        {STATUS_TABS.map((s) => (
          <button key={s} type="button" onClick={() => setStatusFilter(s)}
            className={cn('text-[10px] font-mono uppercase tracking-wide px-3 py-1.5 rounded-lg transition-colors',
              statusFilter === s ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-black/50 hover:bg-gray-200')}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <p className="text-sm text-black/40 font-light">No listings with status "{statusFilter}".</p>
        </div>
      ) : (
        <AdminListingsTable listings={listings} />
      )}
    </div>
  );
}

// ─── Admin listings table ─────────────────────────────────────────────────────

function AdminListingsTable({ listings }: { listings: Listing[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Title', 'Owner', 'Type', 'Verification', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-black/40">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-black/80 truncate max-w-xs">{l.title}</p>
                  <p className="text-[10px] text-black/35 font-mono">{l.address.city}</p>
                </td>
                <td className="px-4 py-3 text-[10px] text-black/50 font-mono">{l.createdBy}</td>
                <td className="px-4 py-3 text-xs text-black/60 capitalize">{l.listingType} / {l.propertyType}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-[10px] font-mono uppercase px-2 py-0.5 rounded',
                    l.verificationStatus === 'verified' ? 'bg-emerald-50 text-emerald-600' :
                    l.verificationStatus === 'pending'  ? 'bg-amber-50 text-amber-600' :
                    'bg-gray-100 text-gray-400')}>
                    {l.verificationStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded">
                    {l.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/properties/${l.id}`}
                    className="text-[10px] font-mono text-emerald-500 hover:text-emerald-600 px-2 py-1 rounded hover:bg-emerald-50 transition-colors">
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
