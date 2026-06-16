import type { LucideIcon } from 'lucide-react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * StatCard — dashboard summary metric card.
 * Used on Owner dashboard (Total Properties, Avg Yield...) and
 * Admin dashboard (Total Users, Pending Vetting...).
 *
 * Usage:
 *   <StatCard label="Active Listings" value={12} />
 *   <StatCard label="Avg Rental Yield" value="6.4%" trend={2.1} icon={TrendingUp} />
 */

interface StatCardProps {
  label: string;
  value: string | number;
  /** Percentage change vs. previous period. Positive = green/up, negative = red/down. */
  trend?: number;
  trendLabel?: string;
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({
  label,
  value,
  trend,
  trendLabel = 'vs last month',
  icon: Icon,
  className,
}: StatCardProps) {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white p-5 shadow-sm', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        {Icon && (
          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
            <Icon size={20} />
          </div>
        )}
      </div>

      {trend !== undefined && (
        <div
          className={cn(
            'mt-3 inline-flex items-center gap-1 text-xs font-medium',
            isPositive ? 'text-emerald-600' : 'text-red-600'
          )}
        >
          {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
          {Math.abs(trend)}%
          <span className="font-normal text-gray-400">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
