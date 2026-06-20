import type { WalletStatus, WalletStatusDisplay } from '../types/wallet.types';
import { truncateWalletAddress } from '../types/wallet.types';

// ─── Get Wallet Status Display ─────────────────────────────────────────

export function getWalletStatusDisplay(
  walletStatus: WalletStatus,
  walletAddress?: string
): WalletStatusDisplay {
  switch (walletStatus) {
    case 'NOT_LINKED':
      return { label: 'Not linked', color: 'gray', action: 'Link Wallet' };
    case 'LINKED':
      return {
        label: `Linked: ${walletAddress ? truncateWalletAddress(walletAddress) : ''}`,
        color: 'green',
        action: 'Unlink',
      };
    case 'VERIFIED':
      return {
        label: `Verified: ${walletAddress ? truncateWalletAddress(walletAddress) : ''}`,
        color: 'green',
        action: 'Unlink',
      };
    case 'REVOKED':
      return { label: 'Revoked by admin', color: 'red', action: 'Re-link Wallet' };
    default:
      return { label: 'Unknown', color: 'gray', action: 'Link Wallet' };
  }
}

// ─── Wallet Status Badge Component ────────────────────────────────────

interface WalletStatusBadgeProps {
  walletStatus: WalletStatus;
  walletAddress?: string;
  className?: string;
}

export function WalletStatusBadge({ walletStatus, walletAddress, className = '' }: WalletStatusBadgeProps) {
  const status = getWalletStatusDisplay(walletStatus, walletAddress);
  
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    red: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses[status.color]} ${className}`}
    >
      {status.label}
    </span>
  );
}
