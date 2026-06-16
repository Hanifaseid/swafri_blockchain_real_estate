'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartEmptyState } from './ChartEmptyState';

/**
 * YieldChart — monthly rental yield % over time per property.
 * Used on /dashboard/yield.
 *
 * data format:
 *   [{ month: 'Jan 25', propertyA: 6.2, propertyB: 5.8 }, ...]
 */

export interface YieldDataPoint {
  month: string;
  [propertyTitle: string]: string | number;
}

interface YieldChartProps {
  data: YieldDataPoint[];
  /** Property titles mapped to line colours */
  propertyColors?: Record<string, string>;
  height?: number;
}

const DEFAULT_COLORS = [
  '#10b981', // emerald-500
  '#3b82f6', // blue-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ef4444', // red-500
  '#06b6d4', // cyan-500
];

// Recharts v3: TooltipProps generic is unreliable — type the props directly
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 shadow-lg text-xs">
      <p className="mb-1.5 font-semibold text-gray-700">{label}</p>
      {(payload as Array<{ dataKey: string; color: string; name: string; value: number }>).map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-medium text-gray-900">{p.value}%</span>
        </div>
      ))}
    </div>
  );
}

export function YieldChart({ data, propertyColors, height = 300 }: YieldChartProps) {
  if (!data.length) return <ChartEmptyState height={height} message="No yield data yet" />;

  // Derive property keys (everything except 'month')
  const properties = Object.keys(data[0]).filter((k) => k !== 'month');

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
          domain={['auto', 'auto']}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
        />
        {properties.map((prop, i) => (
          <Line
            key={prop}
            type="monotone"
            dataKey={prop}
            stroke={propertyColors?.[prop] ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
