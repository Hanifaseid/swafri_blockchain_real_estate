import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ComplianceCase } from '../types/compliance.types';

interface ComplianceCaseCardProps {
  case_: ComplianceCase;
  onUpdate?: (id: string, input: any) => void;
  isUpdating?: boolean;
}

const SEVERITY_STYLES: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-amber-100 text-amber-600',
  high: 'bg-orange-100 text-orange-600',
  critical: 'bg-red-100 text-red-600',
};

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-blue-50 text-blue-600',
  under_review: 'bg-amber-50 text-amber-600',
  resolved: 'bg-emerald-50 text-emerald-600',
  dismissed: 'bg-gray-50 text-gray-600',
};

export function ComplianceCaseCard({ case_, onUpdate, isUpdating }: ComplianceCaseCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={cn('text-[10px] font-mono uppercase px-2 py-0.5 rounded', SEVERITY_STYLES[case_.severity])}>
              {case_.severity}
            </span>
            <span className={cn('text-[10px] font-mono uppercase px-2 py-0.5 rounded', STATUS_STYLES[case_.status])}>
              {case_.status}
            </span>
            <span className="text-[10px] font-mono text-black/40 uppercase">{case_.type}</span>
          </div>
          <h3 className="text-sm font-medium text-black/80 mb-1">
            Case #{case_.id.slice(0, 8)}
          </h3>
          {case_.subjectUser && (
            <p className="text-xs text-black/40 font-mono mb-2">User: {case_.subjectUser.slice(0, 8)}</p>
          )}
          {case_.note && (
            <p className="text-xs text-black/60 line-clamp-2">{case_.note}</p>
          )}
          {case_.resolution && (
            <p className="text-xs text-emerald-600 mt-2 line-clamp-2">
              <CheckCircle2 size={12} className="inline mr-1" />
              {case_.resolution}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {case_.status === 'open' && onUpdate && (
            <button
              onClick={() => onUpdate(case_.id, { status: 'under_review' })}
              disabled={isUpdating}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100 disabled:opacity-50"
            >
              Start Review
            </button>
          )}
          {case_.status === 'under_review' && onUpdate && (
            <>
              <button
                onClick={() => onUpdate(case_.id, { status: 'resolved' })}
                disabled={isUpdating}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 disabled:opacity-50"
              >
                Resolve
              </button>
              <button
                onClick={() => onUpdate(case_.id, { status: 'dismissed' })}
                disabled={isUpdating}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                Dismiss
              </button>
            </>
          )}
        </div>
      </div>
      <p className="text-[10px] text-black/35 font-mono mt-3">
        {new Date(case_.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
