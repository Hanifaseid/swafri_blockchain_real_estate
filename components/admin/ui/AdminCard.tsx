import React from 'react';
import { cn } from '@/lib/utils';

/**
 * AdminCard — standard content card for all admin pages.
 *
 * Usage:
 *   <AdminCard>...</AdminCard>
 *   <AdminCard title="Documents" description="Submitted files">...</AdminCard>
 *   <AdminCard padding="none">...</AdminCard>   // for tables
 */

interface AdminCardProps {
  title?: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  /** "md" = p-5 (default), "lg" = p-6, "sm" = p-4, "none" = no padding */
  padding?: 'sm' | 'md' | 'lg' | 'none';
  className?: string;
  children: React.ReactNode;
}

const PADDING: Record<string, string> = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
  none: '',
};

export function AdminCard({
  title,
  description,
  actions,
  padding = 'md',
  className,
  children,
}: AdminCardProps) {
  const hasHeader = title || description || actions;

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden',
        className
      )}
    >
      {hasHeader && (
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            )}
            {description && (
              <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      <div className={cn(PADDING[padding])}>{children}</div>
    </div>
  );
}

/** Stat variant — large number with label */
interface AdminStatCardProps {
  label: string;
  value: string | number;
  /** Controls border-left accent color */
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const STAT_VARIANTS: Record<string, string> = {
  default: '',
  success: 'border-l-4 border-l-emerald-500',
  warning: 'border-l-4 border-l-amber-500',
  danger:  'border-l-4 border-l-red-500',
  info:    'border-l-4 border-l-sky-500',
};

export function AdminStatCard({
  label,
  value,
  variant = 'default',
  className,
}: AdminStatCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 shadow-sm p-4',
        STAT_VARIANTS[variant],
        className
      )}
    >
      <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1.5">
        {label}
      </p>
      <p className="text-2xl font-semibold text-gray-900">{String(value)}</p>
    </div>
  );
}
