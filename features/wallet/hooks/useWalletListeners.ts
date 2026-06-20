import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { onAccountsChanged, onChainChanged, getChainId } from '../utils/metamask';
import { SEPOLIA_CONFIG } from '../types/wallet.types';
import toast from 'react-hot-toast';

export function useWalletListeners() {
  const { currentUser } = useAuthStore();

  useEffect(() => {
    if (!currentUser || currentUser.walletStatus !== 'LINKED' || !currentUser.linkedWalletAddress) {
      return;
    }

    // Listen for account changes
    const cleanupAccounts = onAccountsChanged((accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected MetaMask
        toast.error('MetaMask disconnected');
      } else if (accounts[0].toLowerCase() !== currentUser.linkedWalletAddress?.toLowerCase()) {
        // User switched to a different account
        toast(
          'Active MetaMask account doesn\'t match your linked wallet. Please switch back to your linked account.',
          { 
            icon: '⚠️',
            duration: 5000 
          }
        );
      }
    });

    // Listen for chain changes
    const cleanupChain = onChainChanged(async (chainId: string) => {
      if (chainId !== SEPOLIA_CONFIG.chainId) {
        toast(
          'Please switch to Sepolia testnet for full functionality',
          { 
            icon: '⚠️',
            duration: 5000 
          }
        );
      }
    });

    // Check initial network
    const checkInitialNetwork = async () => {
      try {
        const currentChainId = await getChainId();
        if (currentChainId !== SEPOLIA_CONFIG.chainId) {
          toast(
            'Please switch to Sepolia testnet for full functionality',
            { 
              icon: '⚠️',
              duration: 5000 
            }
          );
        }
      } catch {
        // Ignore errors
      }
    };

    checkInitialNetwork();

    // Cleanup listeners
    return () => {
      cleanupAccounts();
      cleanupChain();
    };
  }, [currentUser]);
}
