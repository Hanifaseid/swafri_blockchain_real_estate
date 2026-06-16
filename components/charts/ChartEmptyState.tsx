import { BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ChartEmptyState — shown inside a chart container when there is no data.
 * Matches the chart container height so layout doesn't shift.
 */

interface ChartEmptyStateProps {
  message?: string;
  height?: number;
  className?: string;
}

export function ChartEmptyState({
  message = 'No data available yet',
  height = 300,
  className,
}: ChartEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50',
        className
      )}
      style={{ height }}
      role="img"
      aria-label={message}
    >
      <BarChart2 size={28} strokeWidth={1.5} className="text-gray-300" />
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}
