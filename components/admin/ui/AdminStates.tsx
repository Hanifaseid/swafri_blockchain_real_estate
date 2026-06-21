import React from 'react';
import { Loader2, AlertCircle, ServerCrash } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

/**
 * AdminLoadingState — centered spinner for admin page/section loading.
 *
 * Usage:
 *   <AdminLoadingState />
 *   <AdminLoadingState size="lg" />
 */
interface AdminLoadingStateProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LOADING_SIZES = {
  sm: 'py-8',
  md: 'py-16',
  lg: 'py-24',
};

const SPINNER_SIZES = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export function AdminLoadingState({ size = 'md', className }: AdminLoadingStateProps) {
  return (
    <div className={cn('flex items-center justify-center', LOADING_SIZES[size], className)}>
      <Loader2 className={cn(SPINNER_SIZES[size], 'text-emerald-600 animate-spin')} />
    </div>
  );
}

/**
 * AdminEmptyState — consistent empty state for admin lists/tables.
 *
 * Usage:
 *   <AdminEmptyState
 *     icon={FileText}
 *     title="No applications found"
 *     description="Applications will appear here once tenants submit them."
 *   />
 */
interface AdminEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: AdminEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className
      )}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-4">
          <Icon size={20} className="text-gray-300" />
        </div>
      )}
      <p className="text-sm font-medium text-gray-600">{title}</p>
      {description && (
        <p className="text-xs text-gray-400 mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/**
 * AdminErrorState — consistent error state for failed data loading.
 */
interface AdminErrorStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function AdminErrorState({
  title = 'Failed to load data',
  description = 'Please try again later.',
  action,
  className,
}: AdminErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
        <ServerCrash size={20} className="text-red-400" />
      </div>
      <p className="text-sm font-medium text-gray-700">{title}</p>
      <p className="text-xs text-gray-400 mt-1">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/**
 * AdminInlineAlert — inline warning/info/error banner.
 *
 * Usage:
 *   <AdminInlineAlert variant="warning" message="View only — Super Admin required." />
 */
interface AdminInlineAlertProps {
  variant: 'info' | 'warning' | 'error' | 'success';
  message: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}

const ALERT_STYLES = {
  info:    'bg-sky-50 border-sky-200 text-sky-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-700',
  error:   'bg-red-50 border-red-200 text-red-700',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
};

export function AdminInlineAlert({
  variant,
  message,
  icon: Icon = AlertCircle,
  className,
}: AdminInlineAlertProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium',
        ALERT_STYLES[variant],
        className
      )}
    >
      <Icon size={13} className="shrink-0" />
      <span>{message}</span>
    </div>
  );
}
