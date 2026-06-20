import { Clock, CheckCircle2, XCircle, AlertTriangle, DollarSign, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PurchaseTransaction, PurchaseStatus } from '../types/transaction.types';

interface PurchaseTransactionCardProps {
  transaction: PurchaseTransaction;
  onView?: (id: string) => void;
}

const STATUS_STYLES: Record<PurchaseStatus, string> = {
  offer_accepted: 'bg-blue-50 text-blue-600',
  deposit_pending: 'bg-amber-50 text-amber-600',
  deposit_received: 'bg-amber-100 text-amber-700',
  closing_review: 'bg-purple-50 text-purple-600',
  title_transfer_pending: 'bg-indigo-50 text-indigo-600',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-gray-100 text-gray-500',
  disputed: 'bg-red-50 text-red-600',
};

const STATUS_ICONS: Record<PurchaseStatus, any> = {
  offer_accepted: Clock,
  deposit_pending: Clock,
  deposit_received: DollarSign,
  closing_review: AlertTriangle,
  title_transfer_pending: Clock,
  completed: CheckCircle2,
  cancelled: XCircle,
  disputed: AlertTriangle,
};

export function PurchaseTransactionCard({ transaction, onView }: PurchaseTransactionCardProps) {
  const StatusIcon = STATUS_ICONS[transaction.status] || Clock;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors cursor-pointer">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={cn('text-[10px] font-mono uppercase px-2 py-0.5 rounded', STATUS_STYLES[transaction.status])}>
              <StatusIcon size={12} className="inline mr-1" />
              {transaction.status.replace(/_/g, ' ')}
            </span>
          </div>
          <h3 className="text-sm font-medium text-black/80 mb-1">{transaction.listingTitle}</h3>
          <div className="flex items-center gap-4 text-xs text-black/60 mt-2">
            <span className="flex items-center gap-1">
              <DollarSign size={12} />
              {transaction.currency || 'USD'} {transaction.listingPrice.toLocaleString()}
            </span>
            {transaction.depositAmount && (
              <span className="flex items-center gap-1 text-amber-600">
                <DollarSign size={12} />
                Deposit: {transaction.currency || 'USD'} {transaction.depositAmount.toLocaleString()}
              </span>
            )}
          </div>
          {transaction.estimatedCloseDate && (
            <div className="flex items-center gap-1 text-xs text-black/40 mt-2">
              <Calendar size={12} />
              Est. Close: {new Date(transaction.estimatedCloseDate).toLocaleDateString()}
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="text-[10px] text-black/35 font-mono">#{transaction.id.slice(0, 8)}</p>
          <p className="text-[10px] text-black/35 font-mono mt-1">
            {new Date(transaction.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
