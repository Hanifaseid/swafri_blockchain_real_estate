import { useState } from 'react';
import { Loader2, Wallet, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { connectWallet, signMessage, ensureSepoliaNetwork } from '../utils/metamask';
import { requestWalletChallenge, linkWallet } from '../services/wallet.service';
import { isValidWalletAddress, normalizeWalletAddress } from '../types/wallet.types';

interface WalletLinkFlowProps {
  onSuccess?: (user: any) => void;
  onCancel?: () => void;
}

export function WalletLinkFlow({ onSuccess, onCancel }: WalletLinkFlowProps) {
  const [step, setStep] = useState<'connect' | 'sign' | 'linking' | 'success'>('connect');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [challengeMessage, setChallengeMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setError('');
    setIsLoading(true);

    try {
      // Ensure Sepolia network
      await ensureSepoliaNetwork();

      // Connect MetaMask
      const address = await connectWallet();
      setWalletAddress(normalizeWalletAddress(address));

      // Request challenge from backend
      const challenge = await requestWalletChallenge(address);
      setChallengeMessage(challenge.message);

      setStep('sign');
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      toast.error(err.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSign = async () => {
    setError('');
    setIsLoading(true);

    try {
      // Sign the challenge message
      const signature = await signMessage(challengeMessage, walletAddress);

      setStep('linking');

      // Submit signature to backend
      const user = await linkWallet(walletAddress, signature);

      setStep('success');
      toast.success(`Wallet ${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)} linked!`);
      onSuccess?.(user);
    } catch (err: any) {
      setError(err.message || 'Failed to link wallet');
      
      // Handle specific errors
      if (err.status === 401) {
        if (err.message.includes('signature verification')) {
          setError('Signature verification failed. Please try again.');
        } else if (err.message.includes('does not match')) {
          setError('The signature doesn\'t match the wallet address. Make sure you\'re signing with the correct account.');
        }
      } else if (err.status === 409) {
        if (err.message.includes('expired')) {
          setError('Challenge expired. Please try again.');
          setStep('connect');
        } else if (err.message.includes('already linked')) {
          setError('This wallet is already linked to a different account.');
        } else if (err.message.includes('active challenge')) {
          setError('No active wallet challenge found. Please start over.');
          setStep('connect');
        }
      }
      
      toast.error(err.message || 'Failed to link wallet');
      setStep('connect');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError('');
    setStep('connect');
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {step === 'connect' && (
        <div className="space-y-4">
          <div className="text-center">
            <Wallet className="w-12 h-12 mx-auto text-emerald-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Link Your Wallet</h3>
            <p className="text-sm text-gray-600">
              Connect your MetaMask wallet to enable blockchain features
            </p>
          </div>

          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                Connect MetaMask
              </>
            )}
          </button>

          {onCancel && (
            <button
              onClick={onCancel}
              className="w-full px-4 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {step === 'sign' && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Sign Challenge</h3>
            <p className="text-sm text-gray-600 mb-3">
              Please sign the following message in MetaMask to verify your wallet ownership
            </p>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 font-mono break-all max-h-32 overflow-y-auto">
              {challengeMessage}
            </div>
          </div>

          <button
            onClick={handleSign}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Linking...
              </>
            ) : (
              'Sign in MetaMask'
            )}
          </button>

          <button
            onClick={handleRetry}
            className="w-full px-4 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Start Over
          </button>
        </div>
      )}

      {step === 'linking' && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
          <p className="text-sm text-gray-600">Linking wallet...</p>
        </div>
      )}

      {step === 'success' && (
        <div className="text-center space-y-3">
          <div className="w-12 h-12 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
            <Wallet className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Wallet Linked Successfully</h3>
          <p className="text-sm text-gray-600">
            Your wallet {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)} is now linked to your account
          </p>
          {onCancel && (
            <button
              onClick={onCancel}
              className="w-full px-4 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Done
            </button>
          )}
        </div>
      )}
    </div>
  );
}
