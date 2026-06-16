import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Pagination — page navigation for lists and tables.
 *
 * Usage:
 *   <Pagination
 *     page={currentPage}
 *     totalPages={10}
 *     onPageChange={setPage}
 *   />
 */

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Build page number array with ellipsis
  function getPages(): (number | '...')[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (page >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  }

  const btnBase =
    'inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500';

  return (
    <nav role="navigation" aria-label="Pagination" className={cn('flex items-center gap-1', className)}>
      {/* Previous */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className={cn(btnBase, 'border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed')}
      >
        <ChevronLeft size={16} />
      </button>

      {/* Page numbers */}
      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className={cn(btnBase, 'text-gray-400 cursor-default')}>
            <MoreHorizontal size={16} />
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            aria-label={`Page ${p}`}
            className={cn(
              btnBase,
              p === page
                ? 'bg-emerald-600 text-white font-medium'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            )}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className={cn(btnBase, 'border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed')}
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
