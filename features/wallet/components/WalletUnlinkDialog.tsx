import { useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { unlinkWallet } from '../services/wallet.service';
import { truncateWalletAddress } from '../types/wallet.types';

interface WalletUnlinkDialogProps {
  walletAddress: string;
  onSuccess?: (user: any) => void;
  onCancel?: () => void;
}

export function WalletUnlinkDialog({ walletAddress, onSuccess, onCancel }: WalletUnlinkDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleUnlink = async () => {
    setError('');
    setIsLoading(true);

    try {
      const user = await unlinkWallet();
      toast.success('Wallet unlinked successfully');
      onSuccess?.(user);
    } catch (err: any) {
      setError(err.message || 'Failed to unlink wallet');
      
      // Handle specific errors
      if (err.status === 409) {
        setError('You have active or funded lease escrows. Complete or cancel them before unlinking your wallet.');
      }
      
      toast.error(err.message || 'Failed to unlink wallet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="text-center space-y-3">
        <div className="w-12 h-12 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-yellow-600" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900">Unlink Wallet</h3>
        
        <p className="text-sm text-gray-600">
          Are you sure you want to unlink your wallet ({truncateWalletAddress(walletAddress)})?
        </p>
        
        <div className="text-left p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
          <p className="text-xs text-gray-700 font-medium">This will:</p>
          <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
            <li>Remove the wallet association from your account</li>
            <li>Future title mints will go to the platform wallet</li>
            <li>Existing on-chain titles remain on the blockchain</li>
          </ul>
          <p className="text-xs text-gray-700 font-medium mt-2">You can re-link at any time.</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleUnlink}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Unlinking...
            </>
          ) : (
            'Unlink Wallet'
          )}
        </button>

        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
