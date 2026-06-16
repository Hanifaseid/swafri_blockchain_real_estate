import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * EmptyState — shown when a list or table has no records.
 *
 * Usage:
 *   <EmptyState
 *     title="No listings yet"
 *     description="Create your first listing to get started."
 *     action={<Button onClick={openForm}>Add Listing</Button>}
 *   />
 */

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center',
        className
      )}
    >
      <div className="mb-4 rounded-full bg-gray-100 p-4 text-gray-400">
        <Icon size={28} strokeWidth={1.5} aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-gray-500">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
