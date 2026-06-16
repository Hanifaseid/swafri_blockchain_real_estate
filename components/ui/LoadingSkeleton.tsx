import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * LoadingSkeleton — animated placeholder block.
 * Use the named variants for common patterns.
 *
 * Usage:
 *   <Skeleton className="h-6 w-32" />          // single block
 *   <SkeletonCard />                            // listing card placeholder
 *   <SkeletonTable rows={5} cols={4} />         // table placeholder
 *   <SkeletonText lines={3} />                  // paragraph placeholder
 */

// ── Base block ────────────────────────────────────────────────────────────────

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('skeleton rounded-md bg-gray-100', className)}
      {...props}
    />
  );
}

// ── Text lines ────────────────────────────────────────────────────────────────

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  );
}

// ── Listing card ──────────────────────────────────────────────────────────────

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded-xl border border-gray-200 bg-white overflow-hidden', className)}
      aria-hidden="true"
    >
      {/* Image */}
      <Skeleton className="h-48 w-full rounded-none" />
      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2 mt-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-6 w-1/3 mt-1" />
      </div>
    </div>
  );
}

// ── Table ─────────────────────────────────────────────────────────────────────

export function SkeletonTable({
  rows = 5,
  cols = 4,
  className,
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div
      className={cn('rounded-lg border border-gray-200 overflow-hidden', className)}
      aria-hidden="true"
    >
      {/* Header */}
      <div className="flex gap-4 bg-gray-50 px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex gap-4 border-t border-gray-100 px-4 py-3">
          {Array.from({ length: cols }).map((_, col) => (
            <Skeleton
              key={col}
              className={cn('h-4 flex-1', col === 0 ? 'w-2/3 flex-none' : '')}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

export function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded-xl border border-gray-200 bg-white p-5', className)}
      aria-hidden="true"
    >
      <div className="flex justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
      <Skeleton className="mt-4 h-4 w-28" />
    </div>
  );
}
