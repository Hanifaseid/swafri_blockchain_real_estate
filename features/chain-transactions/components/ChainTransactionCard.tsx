import { Clock, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Hash, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChainTransaction, ChainTransactionStatus } from '../types/chain-transaction.types';

interface ChainTransactionCardProps {
  transaction: ChainTransaction;
  onReconcile?: (id: string) => void;
  onMarkStale?: (id: string, reason: string) => void;
  isReconciling?: boolean;
  isMarkingStale?: boolean;
}

const STATUS_STYLES: Record<ChainTransactionStatus, string> = {
  pending: 'bg-amber-50 text-amber-600',
  mined: 'bg-blue-50 text-blue-600',
  confirmed: 'bg-emerald-50 text-emerald-600',
  reconciled: 'bg-emerald-100 text-emerald-700',
  stale: 'bg-gray-50 text-gray-600',
  failed: 'bg-red-50 text-red-600',
};

const STATUS_ICONS: Record<ChainTransactionStatus, any> = {
  pending: Clock,
  mined: Clock,
  confirmed: CheckCircle2,
  reconciled: CheckCircle2,
  stale: AlertTriangle,
  failed: XCircle,
};

export function ChainTransactionCard({ 
  transaction, 
  onReconcile, 
  onMarkStale, 
  isReconciling, 
  isMarkingStale 
}: ChainTransactionCardProps) {
  const StatusIcon = STATUS_ICONS[transaction.status] || Clock;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={cn('text-[10px] font-mono uppercase px-2 py-0.5 rounded', STATUS_STYLES[transaction.status])}>
              <StatusIcon size={12} className="inline mr-1" />
              {transaction.status}
            </span>
            <span className="text-[10px] font-mono text-black/40 uppercase">{transaction.chain}</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <Hash size={12} className="text-black/40" />
            <h3 className="text-sm font-medium text-black/80 font-mono truncate">{transaction.hash}</h3>
          </div>
          <div className="flex items-center gap-4 text-xs text-black/60 mt-2">
            <span>{transaction.currency} {transaction.amount.toLocaleString()}</span>
            <span>Confirmations: {transaction.confirmations}</span>
          </div>
          {transaction.reason && (
            <p className="text-xs text-black/40 mt-2 line-clamp-2">{transaction.reason}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {transaction.status === 'pending' && onReconcile && (
            <button
              onClick={() => onReconcile(transaction.id)}
              disabled={isReconciling}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 disabled:opacity-50 flex items-center gap-1"
            >
              <RefreshCw size={12} className={isReconciling ? 'animate-spin' : ''} />
              Reconcile
            </button>
          )}
          {transaction.status !== 'stale' && transaction.status !== 'failed' && onMarkStale && (
            <button
              onClick={() => {
                const reason = prompt('Enter reason for marking as stale:');
                if (reason) onMarkStale(transaction.id, reason);
              }}
              disabled={isMarkingStale}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            >
              Mark Stale
            </button>
          )}
        </div>
      </div>
      <p className="text-[10px] text-black/35 font-mono mt-3">
        {new Date(transaction.createdAt).toLocaleString()}
      </p>
    </div>
  );
}
