'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { SearchInput } from '@/components/ui/SearchInput';
import { cn } from '@/lib/utils';

/**
 * AdminFilterBar — unified search + filter bar for all admin tables.
 *
 * Usage:
 *   <AdminFilterBar
 *     search={search}
 *     onSearch={setSearch}
 *     placeholder="Search users…"
 *     filters={[
 *       {
 *         key: 'status',
 *         label: 'Status',
 *         value: statusFilter,
 *         onChange: setStatusFilter,
 *         options: [
 *           { value: '', label: 'All Statuses' },
 *           { value: 'active', label: 'Active' },
 *         ],
 *       },
 *     ]}
 *   />
 */

export interface AdminFilterOption {
  value: string;
  label: string;
}

export interface AdminFilterConfig {
  key: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: AdminFilterOption[];
}

interface AdminFilterBarProps {
  search?: string;
  onSearch?: (value: string) => void;
  placeholder?: string;
  filters?: AdminFilterConfig[];
  /** Called when all filters are cleared */
  onClear?: () => void;
  className?: string;
}

export function AdminFilterBar({
  search,
  onSearch,
  placeholder = 'Search…',
  filters = [],
  onClear,
  className,
}: AdminFilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = filters.some((f) => f.value !== '');
  const showFilterToggle = filters.length > 0;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Top row: search + filter toggle */}
      <div className="flex flex-col sm:flex-row gap-2">
        {onSearch && (
          <SearchInput
            value={search ?? ''}
            onChange={onSearch}
            placeholder={placeholder}
            className="sm:flex-1 sm:max-w-sm"
          />
        )}

        {showFilterToggle && (
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              'h-9 px-3 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 self-start',
              showFilters || hasActiveFilters
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white hover:text-gray-700'
            )}
          >
            <SlidersHorizontal size={13} />
            Filters
            {hasActiveFilters && (
              <span className="bg-emerald-600 text-white text-[9px] font-mono w-4 h-4 rounded-full flex items-center justify-center">
                {filters.filter((f) => f.value !== '').length}
              </span>
            )}
          </button>
        )}

        {/* Inline selects for simple 1-2 filter cases */}
        {!showFilterToggle &&
          filters.map((f) => (
            <select
              key={f.key}
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              aria-label={f.label}
              className="h-9 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
            >
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ))}
      </div>

      {/* Expanded filter panel */}
      {showFilters && showFilterToggle && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filters.map((f) => (
            <div key={f.key}>
              <label className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1.5 block">
                {f.label}
              </label>
              <select
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {(hasActiveFilters || onClear) && (
            <div className="flex items-end sm:col-span-2 md:col-span-1">
              <button
                type="button"
                onClick={() => {
                  filters.forEach((f) => f.onChange(''));
                  onClear?.();
                }}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors font-medium"
              >
                <X size={12} />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
