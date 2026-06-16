'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SearchInput — text input with search icon, clear button, and debounce.
 *
 * Usage:
 *   <SearchInput
 *     value={query}
 *     onChange={setQuery}
 *     placeholder="Search properties…"
 *   />
 */

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className,
  inputClassName,
  disabled,
  autoFocus,
}: SearchInputProps) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <Search
        size={16}
        className="pointer-events-none absolute left-3 text-gray-400"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label={placeholder}
        className={cn(
          'h-9 w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-9 text-sm text-gray-900',
          'placeholder:text-gray-400',
          'focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          inputClassName
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-3 rounded text-gray-400 transition-colors hover:text-gray-600"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
