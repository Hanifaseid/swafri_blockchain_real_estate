'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * AdminTabs — consistent pill-style tab switcher for all admin pages.
 *
 * Usage:
 *   const [tab, setTab] = useState('users');
 *
 *   <AdminTabs
 *     tabs={[
 *       { id: 'users', label: 'All Users', icon: <Users size={14} />, count: 42 },
 *       { id: 'admins', label: 'Admins', icon: <ShieldCheck size={14} /> },
 *     ]}
 *     active={tab}
 *     onChange={setTab}
 *   />
 */

export interface AdminTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface AdminTabsProps {
  tabs: AdminTab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function AdminTabs({ tabs, active, onChange, className }: AdminTabsProps) {
  return (
    <div
      className={cn(
        'flex gap-1 bg-gray-100 p-1 rounded-xl w-fit border border-gray-200',
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
            active === tab.id
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                'text-[10px] font-mono px-1.5 py-0.5 rounded-full',
                active === tab.id
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-gray-200 text-gray-400'
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
