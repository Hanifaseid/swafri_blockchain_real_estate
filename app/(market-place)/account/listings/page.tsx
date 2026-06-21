'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  Archive,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  FileText,
  Home,
  ImageIcon,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  useDeleteListing,
  useListingDashboard,
  useMyListings,
  useTransitionListing,
  useYieldDashboard,
} from '@/features/listings/queries/listing.queries';
import type {
  Listing,
  ListingStatus,
  TransitionAction,
} from '@/features/listings/types/listing.types';
import { useAuthStore } from '@/stores/auth.store';
import { cn, formatCurrency } from '@/lib/utils';

const STATUS_OPTIONS: Array<'all' | ListingStatus> = [
  'all',
  'draft',
  'submitted',
  'under_review',
  'approved',
  'published',
  'rejected',
  'suspended',
  'rented',
  'sold',
  'archived',
];

const STATUS_COPY: Record<ListingStatus, { label: string; className: string; note: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-white/8 text-white/70',
    note: 'Add details, photos, and ownership documents before review.',
  },
  submitted: {
    label: 'Submitted',
    className: 'bg-amber-500/15 text-amber-300',
    note: 'Waiting for an admin to start review.',
  },
  under_review: {
    label: 'Under review',
    className: 'bg-blue-500/15 text-blue-300',
    note: 'Admin review is in progress.',
  },
  approved: {
    label: 'Approved',
    className: 'bg-emerald-500/15 text-emerald-300',
    note: 'Approved and ready for final admin publishing.',
  },
  published: {
    label: 'Published',
    className: 'bg-emerald-500/15 text-emerald-300',
    note: 'Live in marketplace discovery.',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-500/15 text-red-300',
    note: 'Update the listing or documents, then resubmit.',
  },
  suspended: {
    label: 'Suspended',
    className: 'bg-red-500/15 text-red-300',
    note: 'Admin action is required before this can go live again.',
  },
  rented: {
    label: 'Rented',
    className: 'bg-sky-500/15 text-sky-300',
    note: 'Marked rented by owner or admin.',
  },
  sold: {
    label: 'Sold',
    className: 'bg-purple-500/15 text-purple-300',
    note: 'Marked sold by owner or admin.',
  },
  archived: {
    label: 'Archived',
    className: 'bg-white/8 text-white/45',
    note: 'Hidden from active workflows.',
  },
};

function getStatusOptionLabel(option: 'all' | ListingStatus) {
  if (option === 'all') return 'All statuses';
  return STATUS_COPY[option]?.label ?? option.replaceAll('_', ' ');
}

export default function AccountListingsPage() {
  const { currentUser } = useAuthStore();

  if (currentUser?.role !== 'PROPERTY_OWNER') {
    return (
      <div className="rounded-xl border border-border-primary bg-surface-card p-8 text-center">
        <ShieldCheck className="mx-auto h-9 w-9 text-accent-400" />
        <p className="mt-3 font-medium text-white">Property owner access only</p>
        <p className="mt-1 text-sm text-text-muted">
          Listings can only be created and managed from a property owner account.
        </p>
        <Button asChild className="mt-5">
          <Link href="/discovery">Browse marketplace</Link>
        </Button>
      </div>
    );
  }

  return <OwnerListingsContent />;
}

function OwnerListingsContent() {
  const listingsQuery = useMyListings();
  const dashboard = useListingDashboard();
  const yieldDashboard = useYieldDashboard();
  const [status, setStatus] = useState<'all' | ListingStatus>('all');
  const [query, setQuery] = useState('');

  const listings = useMemo(() => listingsQuery.data ?? [], [listingsQuery.data]);
  const dashboardData = (dashboard.data ?? {}) as {
    total?: number;
    byStatus?: Record<string, number>;
    pendingInquiries?: number;
  };
  const yieldData = yieldDashboard.data;

  const filteredListings = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return listings.filter((listing) => {
      if (status !== 'all' && listing.status !== status) return false;
      if (!needle) return true;
      const haystack = [
        listing.title,
        listing.address?.street,
        listing.address?.city,
        listing.address?.country,
        listing.listingType,
        listing.propertyType,
        listing.status,
        listing.verificationStatus,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [listings, query, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">Property owner</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-white">My listings</h1>
          <p className="mt-2 max-w-2xl text-sm text-text-muted">
            Create drafts, edit owned properties, manage photos and ownership documents, submit for review, and update live availability.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              void listingsQuery.refetch();
              void dashboard.refetch();
              void yieldDashboard.refetch();
            }}
            loading={listingsQuery.isFetching || dashboard.isFetching || yieldDashboard.isFetching}
          >
            <RefreshCw size={16} />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/account/listings/new">
              <Plus size={16} />
              New listing
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Total listings" value={dashboardData.total ?? listings.length} icon={Home} />
        <Metric
          label="In review"
          value={(dashboardData.byStatus?.submitted ?? 0) + (dashboardData.byStatus?.under_review ?? 0)}
          icon={Clock}
        />
        <Metric label="Open inquiries" value={dashboardData.pendingInquiries ?? 0} icon={BarChart3} />
        <Metric
          label="Occupancy"
          value={`${Math.round((yieldData?.occupancyRate ?? 0) * 100)}%`}
          icon={CheckCircle2}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Metric
          label="Active leases"
          value={yieldData?.activeLeaseCount ?? 0}
          icon={FileText}
        />
        <Metric
          label="Gross monthly rent"
          value={formatCurrency(yieldData?.grossMonthlyRent ?? 0, 'USD')}
          icon={BarChart3}
        />
        <Metric
          label="Realized revenue"
          value={formatCurrency(yieldData?.realizedRevenue ?? 0, 'USD')}
          icon={Check}
        />
        <Metric
          label="Published"
          value={dashboardData.byStatus?.published ?? 0}
          icon={Eye}
        />
      </div>

      <section className="rounded-xl border border-border-primary bg-surface-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, city, type, status..."
              className="h-11 w-full rounded-lg border border-border-primary bg-surface-input pl-10 pr-3 text-sm text-white outline-none placeholder:text-text-placeholder focus:border-accent-400"
            />
          </div>
          <StatusFilterDropdown value={status} onChange={setStatus} />
        </div>
      </section>

      <div className="grid gap-4">
        {filteredListings.map((listing) => (
          <OwnerListingRow key={listing.id} listing={listing} />
        ))}
      </div>

      {listingsQuery.isLoading && (
        <div className="grid gap-4">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-48 animate-pulse rounded-xl border border-border-primary bg-surface-card" />
          ))}
        </div>
      )}

      {!listingsQuery.isLoading && listings.length > 0 && filteredListings.length === 0 && (
        <div className="rounded-lg border border-border-primary bg-surface-card p-8 text-center">
          <Search className="mx-auto h-8 w-8 text-accent-400" />
          <p className="mt-3 font-medium text-white">No listings match this view</p>
          <p className="mt-1 text-sm text-text-muted">Clear the search or choose another status filter.</p>
        </div>
      )}

      {!listingsQuery.isLoading && listings.length === 0 && (
        <div className="rounded-lg border border-border-primary bg-surface-card p-8 text-center">
          <Wrench className="mx-auto h-8 w-8 text-accent-400" />
          <p className="mt-3 font-medium text-white">No property listings yet</p>
          <p className="mt-1 text-sm text-text-muted">Create a draft, upload photos and documents, then submit it for review.</p>
          <Button asChild className="mt-5">
            <Link href="/account/listings/new">
              <Plus size={16} />
              Create listing
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function StatusFilterDropdown({
  value,
  onChange,
}: {
  value: 'all' | ListingStatus;
  onChange: (value: 'all' | ListingStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative min-w-full lg:min-w-56" ref={menuRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'flex h-11 w-full items-center justify-between gap-3 rounded-lg border border-border-primary bg-surface-input px-3 text-left text-sm font-semibold text-white outline-none transition-colors hover:border-accent-400 focus:border-accent-400 lg:w-56',
          open && 'border-accent-400',
        )}
      >
        <span className="truncate">{getStatusOptionLabel(value)}</span>
        <ChevronDown size={16} className={cn('shrink-0 text-text-muted transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Filter listings by status"
          className="absolute right-0 z-30 mt-2 max-h-72 w-full overflow-auto rounded-lg border border-border-primary bg-black p-1 shadow-2xl shadow-black/40 lg:w-56"
        >
          {STATUS_OPTIONS.map((option) => {
            const selected = option === value;
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm font-semibold transition-colors',
                  selected
                    ? 'bg-amber-400 text-emerald-950'
                    : 'text-white/75 hover:bg-white/8 hover:text-white',
                )}
              >
                <span className="truncate">{getStatusOptionLabel(option)}</span>
                {selected && <Check size={14} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OwnerListingRow({ listing }: { listing: Listing }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const transition = useTransitionListing(listing.id);
  const deleteListing = useDeleteListing();
  const status = STATUS_COPY[listing.status] ?? STATUS_COPY.draft;
  const cover = listing.photos?.find((photo) => photo.isCover) ?? listing.photos?.[0];
  const amount = listing.price ?? listing.monthlyRent ?? 0;
  const price = amount ? formatCurrency(amount, listing.currency ?? 'USD') : 'Price not set';
  const actions = ownerActions(listing);

  const runTransition = (action: TransitionAction) => {
    transition.mutate({ action });
  };

  return (
    <article className="overflow-hidden rounded-xl border border-border-primary bg-surface-card">
      <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
        <div className="relative min-h-56 bg-surface-highlight">
          {cover?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover.url} alt={listing.title} className="h-full min-h-56 w-full object-cover" />
          ) : (
            <div className="flex h-full min-h-56 items-center justify-center text-text-muted">
              <ImageIcon size={32} />
            </div>
          )}
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', status.className)}>
              {status.label}
            </span>
            <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold capitalize text-white/80 backdrop-blur">
              {listing.listingType === 'sale' ? 'For sale' : 'For rent'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-5 p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/6 px-3 py-1 text-xs font-semibold capitalize text-white/55">
                  {listing.propertyType.replaceAll('_', ' ')}
                </span>
                <span className="rounded-full bg-white/6 px-3 py-1 text-xs font-semibold capitalize text-white/55">
                  {listing.verificationStatus?.replaceAll('_', ' ') ?? 'unverified'}
                </span>
                {listing.tokenId && (
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                    Title #{listing.tokenId}
                  </span>
                )}
              </div>
              <h2 className="mt-3 text-xl font-semibold text-white">{listing.title}</h2>
              <p className="mt-1 text-sm text-text-muted">
                {listing.address?.street ? `${listing.address.street}, ` : ''}
                {listing.address?.city}, {listing.address?.country}
              </p>
              <p className="mt-2 max-w-2xl text-sm text-text-muted">{status.note}</p>
            </div>
            <div className="text-left xl:text-right">
              <p className="font-display text-2xl font-semibold text-amber-300">
                {price}{listing.listingType === 'rent' && amount ? '/mo' : ''}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Updated {new Date(listing.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <ReadinessTile label="Photos" value={listing.photos?.length ?? 0} ready={(listing.photos?.length ?? 0) > 0} />
            <ReadinessTile label="Location" value={listing.location?.coordinates?.join(', ') ? 'Pinned' : 'Missing'} ready={!!listing.location?.coordinates?.length} />
            <ReadinessTile label="Review" value={listing.verificationStatus.replaceAll('_', ' ')} ready={listing.verificationStatus === 'verified'} />
            <ReadinessTile label="Status" value={listing.status.replaceAll('_', ' ')} ready={['published', 'rented', 'sold'].includes(listing.status)} />
          </div>

          <div className="flex flex-wrap gap-2 border-t border-border-secondary pt-4">
            <Button asChild size="sm" variant="outline">
              <Link href={`/discovery/${listing.id}`}>
                <Eye size={14} />
                Public view
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href={`/account/listings/${listing.id}`}>
                Edit, media, documents
                <ArrowRight size={14} />
              </Link>
            </Button>
            {actions.map((action) => (
              <Button
                key={action.action}
                size="sm"
                variant={action.variant}
                loading={transition.isPending}
                onClick={() => {
                  if (action.action === 'archive') setConfirmArchive(true);
                  else runTransition(action.action);
                }}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
            <Button size="sm" variant="destructive" loading={deleteListing.isPending} onClick={() => setConfirmDelete(true)}>
              <Trash2 size={14} />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmArchive}
        onOpenChange={setConfirmArchive}
        title="Archive listing"
        description="The listing will leave active owner workflows, but audit history remains in the backend."
        confirmLabel="Archive"
        confirmVariant="destructive"
        loading={transition.isPending}
        onConfirm={() => {
          setConfirmArchive(false);
          runTransition('archive');
        }}
      />
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete listing"
        description="This permanently deletes the listing. Use archive if you only want to remove it from active workflows."
        confirmLabel="Delete"
        confirmVariant="destructive"
        loading={deleteListing.isPending}
        onConfirm={() => {
          deleteListing.mutate(listing.id, {
            onSuccess: () => setConfirmDelete(false),
          });
        }}
      />
    </article>
  );
}

function ownerActions(listing: Listing): Array<{
  action: TransitionAction;
  label: string;
  variant: 'default' | 'outline' | 'destructive';
  icon: ReactNode;
}> {
  const actions: Array<{
    action: TransitionAction;
    label: string;
    variant: 'default' | 'outline' | 'destructive';
    icon: ReactNode;
  }> = [];

  if (listing.status === 'draft' || listing.status === 'rejected') {
    actions.push({ action: 'submit', label: 'Submit for review', variant: 'default', icon: <Send size={14} /> });
  }
  if (listing.status === 'published' && listing.listingType === 'rent') {
    actions.push({ action: 'mark_rented', label: 'Mark rented', variant: 'outline', icon: <Check size={14} /> });
  }
  if (listing.status === 'published' && listing.listingType === 'sale') {
    actions.push({ action: 'mark_sold', label: 'Mark sold', variant: 'outline', icon: <Check size={14} /> });
  }
  if (listing.status === 'rented') {
    actions.push({ action: 'unmark_rented', label: 'Return to published', variant: 'outline', icon: <Check size={14} /> });
  }
  if (listing.status === 'sold') {
    actions.push({ action: 'unmark_sold', label: 'Return to published', variant: 'outline', icon: <Check size={14} /> });
  }
  if (listing.status !== 'archived') {
    actions.push({ action: 'archive', label: 'Archive', variant: 'destructive', icon: <Archive size={14} /> });
  }

  return actions;
}

function Metric({ label, value, icon: Icon }: { label: string; value: number | string; icon: typeof Home }) {
  return (
    <div className="rounded-xl border border-border-primary bg-surface-card p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">{label}</p>
        <Icon size={16} className="shrink-0 text-accent-400" />
      </div>
      <p className="mt-3 truncate font-display text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function ReadinessTile({ label, value, ready }: { label: string; value: number | string; ready: boolean }) {
  return (
    <div className="rounded-lg border border-border-primary bg-surface-highlight p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className={cn('h-2 w-2 rounded-full', ready ? 'bg-emerald-400' : 'bg-amber-400')} />
        <p className="truncate text-sm font-semibold capitalize text-white">{value}</p>
      </div>
    </div>
  );
}
