'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { ChartEmptyState } from './ChartEmptyState';

/**
 * OccupancyChart — occupancy rate per property as a horizontal bar chart.
 * Used on /dashboard/yield alongside YieldChart.
 *
 * data format:
 *   [{ property: 'Bole Apt', occupancy: 87, vacant: 13 }, ...]
 */

export interface OccupancyDataPoint {
  property: string;
  /** 0-100 — percentage occupied */
  occupancy: number;
}

interface OccupancyChartProps {
  data: OccupancyDataPoint[];
  height?: number;
}

// Recharts v3: TooltipProps generic is unreliable — type the props directly
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const occupancy = (payload[0]?.value as number) ?? 0;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 shadow-lg text-xs">
      <p className="mb-1 font-semibold text-gray-700 truncate max-w-[160px]">{label}</p>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <span className="text-gray-600">Occupied:</span>
        <span className="font-medium text-gray-900">{occupancy}%</span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="h-2 w-2 rounded-full bg-gray-200" />
        <span className="text-gray-600">Vacant:</span>
        <span className="font-medium text-gray-900">{100 - occupancy}%</span>
      </div>
    </div>
  );
}

function getOccupancyColor(rate: number): string {
  if (rate >= 80) return '#10b981'; // emerald — healthy
  if (rate >= 60) return '#f59e0b'; // amber — moderate
  return '#ef4444';                 // red — low occupancy
}

export function OccupancyChart({ data, height = 300 }: OccupancyChartProps) {
  if (!data.length) {
    return <ChartEmptyState height={height} message="No occupancy data yet" />;
  }

  // Limit label length so long names don't overflow
  const truncated = data.map((d) => ({
    ...d,
    label: d.property.length > 18 ? `${d.property.slice(0, 16)}…` : d.property,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={truncated}
        layout="vertical"
        margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
        barSize={16}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
        <Bar dataKey="occupancy" radius={[0, 4, 4, 0]}>
          {truncated.map((entry) => (
            <Cell
              key={entry.property}
              fill={getOccupancyColor(entry.occupancy)}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
