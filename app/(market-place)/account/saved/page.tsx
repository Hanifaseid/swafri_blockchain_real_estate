'use client';

import Link from 'next/link';
import { Bell, BellOff, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  useSavedSearches,
  useDeleteSavedSearch,
} from '@/features/listings/queries/listing.queries';

// Turn a saved query object into shareable /discovery query params.
function toQueryString(query: Record<string, any> | undefined): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, Array.isArray(value) ? JSON.stringify(value) : String(value));
  }
  const s = params.toString();
  return s ? `?${s}` : '';
}

export default function AccountSavedPage() {
  const { data = [], isLoading } = useSavedSearches();
  const remove = useDeleteSavedSearch();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">Marketplace</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-white">Saved searches</h1>
      </div>
      <div className="grid gap-3">
        {data.map((search) => (
          <div key={search.id} className="rounded-lg border border-border-primary bg-surface-card p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold text-white">{search.name}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-text-muted">
                  {(search.query?.listingType as string | undefined) ?? 'Sale and rent'} search
                  {search.alertEnabled ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <Bell size={13} /> alerts on
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-text-placeholder">
                      <BellOff size={13} /> alerts off
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/discovery${toQueryString(search.query)}`}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border-primary px-3 text-sm font-medium text-white hover:bg-surface-highlight"
                >
                  <Search size={15} />
                  Open search
                </Link>
                <Button
                  size="icon"
                  variant="ghost"
                  title="Delete saved search"
                  loading={remove.isPending}
                  onClick={() => remove.mutate(search.id)}
                >
                  <Trash2 size={16} className="text-text-danger" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {!isLoading && data.length === 0 && (
          <div className="rounded-lg border border-border-primary bg-surface-card p-8 text-center">
            <Bell className="mx-auto h-8 w-8 text-accent-400" />
            <p className="mt-3 font-medium text-white">No saved searches yet</p>
            <p className="mt-1 text-sm text-text-muted">Save map filters from the property discovery page.</p>
          </div>
        )}
      </div>
    </div>
  );
}
