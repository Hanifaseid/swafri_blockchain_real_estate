'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

/**
 * AdminPageLayout — standard wrapper for every admin page.
 *
 * Usage:
 *   <AdminPageLayout
 *     icon={Users}
 *     label="Platform"        // breadcrumb / section label
 *     title="User Management" // page heading
 *     actions={<Button>...</Button>}  // optional right-side actions
 *   >
 *     {content}
 *   </AdminPageLayout>
 */

interface AdminPageLayoutProps {
  icon?: LucideIcon;
  /** Small mono uppercase label shown above the title (breadcrumb feel) */
  label?: string;
  title: string;
  /** Optional badge/chip rendered inline after the title */
  badge?: React.ReactNode;
  /** Right-aligned actions (buttons, etc.) */
  actions?: React.ReactNode;
  /** Max width class — defaults to max-w-7xl */
  maxWidth?: string;
  className?: string;
  children: React.ReactNode;
}

export function AdminPageLayout({
  icon: Icon,
  label,
  title,
  badge,
  actions,
  maxWidth = 'max-w-7xl',
  className,
  children,
}: AdminPageLayoutProps) {
  return (
    <div className={cn('p-6 md:p-8 mx-auto', maxWidth, className)}>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div className="shrink-0 w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <Icon size={16} className="text-emerald-600" />
            </div>
          )}
          <div className="min-w-0">
            {label && (
              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-0.5">
                {label}
              </p>
            )}
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight truncate">
                {title}
              </h1>
              {badge}
            </div>
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {children}
    </div>
  );
}
