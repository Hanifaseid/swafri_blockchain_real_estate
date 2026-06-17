'use client';

import { Heart, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useFavorites } from '@/features/favorites/queries/favorite.queries';
import { ListingCard } from '@/components/listing/ListingCard';
import { FavoriteButton } from '@/components/common/FavoriteButton';

export default function SavedPage() {
  const { data: favorites = [], isLoading, isError } = useFavorites();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-6 h-6 text-rose-400 shrink-0" />
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">Tenant</p>
          <h1 className="text-2xl font-light text-[#0f172a] tracking-tight">Saved Properties</h1>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-rose-400 animate-spin" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">Failed to load saved listings. Please try again.</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && favorites.length === 0 && (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ border: '1px solid var(--color-dash-border)', background: 'var(--color-dash-card)' }}
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-950/40 border border-rose-900/40 flex items-center justify-center mx-auto mb-5">
            <Heart className="w-7 h-7 text-rose-400" />
          </div>
          <p className="text-black/60 font-light mb-1">You haven't saved any properties yet.</p>
          <p className="text-xs text-black/35 font-mono mb-5">Tap the heart on any listing to save it here.</p>
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Browse Properties
          </Link>
        </div>
      )}

      {/* Grid */}
      {!isLoading && !isError && favorites.length > 0 && (
        <>
          <p className="text-xs text-black/35 font-mono mb-4">{favorites.length} saved {favorites.length === 1 ? 'property' : 'properties'}</p>
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
      )}
    </div>
  );
}
