'use client';

import {
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
  Tooltip,
} from 'recharts';
import { ChartEmptyState } from './ChartEmptyState';

/**
 * LeadFunnel — conversion funnel for the leads dashboard.
 * Shows the drop-off from views → inquiries → viewings → offers → closed.
 *
 * data format:
 *   [{ stage: 'Views', count: 340 }, { stage: 'Inquiries', count: 82 }, ...]
 */

export interface FunnelDataPoint {
  stage: string;
  count: number;
}

interface LeadFunnelProps {
  data: FunnelDataPoint[];
  height?: number;
}

const FUNNEL_COLORS = [
  '#10b981',
  '#34d399',
  '#6ee7b7',
  '#a7f3d0',
  '#d1fae5',
];

// recharts v3 tooltip receives a plain `props` object — avoid the broken generic
function CustomTooltip(props: Record<string, unknown>) {
  const { active, payload } = props as {
    active?: boolean;
    payload?: Array<{ payload: FunnelDataPoint & { value: number } }>;
  };
  if (!active || !payload?.length) return null;
  const { stage, count } = payload[0].payload;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 shadow-lg text-xs">
      <p className="font-semibold text-gray-700">{stage}</p>
      <p className="mt-0.5 text-gray-900 font-medium">{count} leads</p>
    </div>
  );
}

export function LeadFunnel({ data, height = 300 }: LeadFunnelProps) {
  if (!data.length) {
    return <ChartEmptyState height={height} message="No lead data yet" />;
  }

  // recharts Funnel requires a `value` key
  const funnelData = data.map((d, i) => ({
    ...d,
    value: d.count,
    fill: FUNNEL_COLORS[i % FUNNEL_COLORS.length],
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <FunnelChart>
        <Tooltip content={<CustomTooltip />} />
        <Funnel dataKey="value" data={funnelData} isAnimationActive>
          <LabelList
            position="center"
            fill="#065f46"
            stroke="none"
            dataKey="stage"
            style={{ fontSize: 11, fontWeight: 600 }}
          />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}
