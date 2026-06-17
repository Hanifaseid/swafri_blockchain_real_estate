import * as React from 'react';
import { ListingCard } from './ListingCard';
import { SkeletonCard } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PropertySummary } from './types';

/**
 * ListingGrid — responsive card grid with built-in loading / empty / error states.
 *
 * Usage:
 *   <ListingGrid listings={data} isLoading={isLoading} />
 *
 *   // With pagination
 *   <ListingGrid
 *     listings={data}
 *     totalPages={meta.totalPages}
 *     page={page}
 *     onPageChange={setPage}
 *   />
 *
 *   // With favorite buttons
 *   <ListingGrid
 *     listings={data}
 *     renderFavorite={(id) => <FavoriteButton listingId={id} />}
 *   />
 */

interface ListingGridProps {
  listings: PropertySummary[];
  isLoading?: boolean;
  error?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  renderFavorite?: (listingId: string) => React.ReactNode;
  className?: string;
  /** Number of skeleton cards shown during loading */
  skeletonCount?: number;
  /** If true, first 3 images get priority loading (LCP optimisation) */
  priorityCount?: number;
}

export function ListingGrid({
  listings,
  isLoading = false,
  error,
  emptyTitle = 'No properties found',
  emptyDescription = 'Try adjusting your search filters.',
  emptyAction,
  page,
  totalPages,
  onPageChange,
  renderFavorite,
  className,
  skeletonCount = 9,
  priorityCount = 3,
}: ListingGridProps) {
  // ── Error state ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <EmptyState
        title="Failed to load listings"
        description={error}
        icon={Building2}
        className={className}
      />
    );
  }

  // ── Loading state ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={cn('flex flex-col gap-6', className)}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────
  if (listings.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={Building2}
        action={emptyAction}
        className={className}
      />
    );
  }

  // ── Grid ─────────────────────────────────────────────────────────────────
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing, index) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            priority={index < priorityCount}
            favoriteSlot={renderFavorite?.(listing.id)}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages && totalPages > 1 && page && onPageChange && (
        <div className="flex justify-center pt-2">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
