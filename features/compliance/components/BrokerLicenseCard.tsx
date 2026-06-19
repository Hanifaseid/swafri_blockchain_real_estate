import { ShieldCheck, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BrokerLicense } from '../types/compliance.types';

interface BrokerLicenseCardProps {
  license: BrokerLicense;
  onReview?: (id: string, decision: 'approve' | 'reject' | 'expire', note?: string) => void;
  isReviewing?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-600',
  approved: 'bg-emerald-50 text-emerald-600',
  rejected: 'bg-red-50 text-red-600',
  expired: 'bg-gray-50 text-gray-600',
};

const STATUS_ICONS: Record<string, any> = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
  expired: AlertTriangle,
};

export function BrokerLicenseCard({ license, onReview, isReviewing }: BrokerLicenseCardProps) {
  const StatusIcon = STATUS_ICONS[license.status] || Clock;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={cn('text-[10px] font-mono uppercase px-2 py-0.5 rounded', STATUS_STYLES[license.status])}>
              <StatusIcon size={12} className="inline mr-1" />
              {license.status}
            </span>
          </div>
          <h3 className="text-sm font-medium text-black/80 mb-1">{license.licenseNumber}</h3>
          <p className="text-xs text-black/60 mb-2">{license.holderName}</p>
          <p className="text-xs text-black/40 font-mono">{license.jurisdiction}</p>
          {license.expiresAt && (
            <p className="text-xs text-black/40 mt-1">
              Expires: {new Date(license.expiresAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {license.status === 'pending' && onReview && (
            <>
              <button
                onClick={() => onReview(license.id, 'approve')}
                disabled={isReviewing}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => onReview(license.id, 'reject')}
                disabled={isReviewing}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 disabled:opacity-50"
              >
                Reject
              </button>
            </>
          )}
          {license.status === 'approved' && onReview && (
            <button
              onClick={() => onReview(license.id, 'expire')}
              disabled={isReviewing}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            >
              Mark Expired
            </button>
          )}
        </div>
      </div>
      <p className="text-[10px] text-black/35 font-mono mt-3">
        Submitted: {new Date(license.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
