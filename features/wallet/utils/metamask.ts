// ─── MetaMask Detection ─────────────────────────────────────────────────────

export function isMetaMaskInstalled(): boolean {
  return typeof window !== 'undefined' && 
         typeof window.ethereum !== 'undefined' && 
         Boolean(window.ethereum.isMetaMask);
}

// ─── Connect Wallet ───────────────────────────────────────────────────────

export async function connectWallet(): Promise<string> {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    return accounts[0]; // Returns 0x-prefixed address
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to connect wallet');
  }
}

// ─── Get Current Account ─────────────────────────────────────────────────

export async function getCurrentAccount(): Promise<string | null> {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    });

    if (!accounts || accounts.length === 0) {
      return null;
    }

    return accounts[0];
  } catch {
    return null;
  }
}

// ─── Sign Message (EIP-191) ───────────────────────────────────────────────

export async function signMessage(message: string, walletAddress: string): Promise<string> {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, walletAddress],
    });

    return signature;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to sign message');
  }
}

// ─── Get Chain ID ───────────────────────────────────────────────────────

export async function getChainId(): Promise<string> {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const chainId = await window.ethereum.request({
      method: 'eth_chainId',
    });

    return chainId;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to get chain ID');
  }
}

// ─── Switch Network ─────────────────────────────────────────────────────

export async function switchNetwork(chainId: string): Promise<void> {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
  } catch (error: any) {
    // Chain not added - error code 4902
    if (error.code === 4902) {
      throw new Error('Network not found in MetaMask. Please add it manually.');
    }
    throw error;
  }
}

// ─── Add Network ───────────────────────────────────────────────────────

export async function addNetwork(config: {
  chainId: string;
  chainName: string;
  rpcUrls: string[];
  blockExplorerUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}): Promise<void> {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [config],
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to add network');
  }
}

// ─── Ensure Sepolia Network ─────────────────────────────────────────────

export async function ensureSepoliaNetwork(): Promise<void> {
  const SEPOLIA_CHAIN_ID = '0xaa36a7';
  const SEPOLIA_CONFIG = {
    chainId: SEPOLIA_CHAIN_ID,
    chainName: 'Sepolia Testnet',
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
  };

  try {
    const chainId = await getChainId();
    
    if (chainId !== SEPOLIA_CHAIN_ID) {
      try {
        await switchNetwork(SEPOLIA_CHAIN_ID);
      } catch (error: any) {
        if (error.message.includes('not found')) {
          await addNetwork(SEPOLIA_CONFIG);
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to switch to Sepolia network');
  }
}

// ─── Account Change Listener ───────────────────────────────────────────

export function onAccountsChanged(callback: (accounts: string[]) => void): () => void {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    return () => {};
  }

  window.ethereum.on('accountsChanged', callback);
  
  // Return cleanup function
  return () => {
    window.ethereum?.removeListener('accountsChanged', callback);
  };
}

// ─── Chain Change Listener ─────────────────────────────────────────────

export function onChainChanged(callback: (chainId: string) => void): () => void {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    return () => {};
  }

  window.ethereum.on('chainChanged', callback);
  
  // Return cleanup function
  return () => {
    window.ethereum?.removeListener('chainChanged', callback);
  };
}

// ─── Connect and Disconnect Listener ───────────────────────────────────

export function onConnect(callback: (connectInfo: { chainId: string }) => void): () => void {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    return () => {};
  }

  window.ethereum.on('connect', callback);
  
  // Return cleanup function
  return () => {
    window.ethereum?.removeListener('connect', callback);
  };
}

export function onDisconnect(callback: (error: { code: number; message: string }) => void): () => void {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    return () => {};
  }

  window.ethereum.on('disconnect', callback);
  
  // Return cleanup function
  return () => {
    window.ethereum?.removeListener('disconnect', callback);
  };
}
