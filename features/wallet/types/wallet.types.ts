// ─── Wallet Status Types ─────────────────────────────────────────────────────

export type WalletStatus = 'NOT_LINKED' | 'LINKED' | 'VERIFIED' | 'REVOKED';

// ─── Wallet Fields on User ───────────────────────────────────────────────────

export interface WalletFields {
  linkedWalletAddress?: string; // 0x-prefixed, 42 chars, lowercase, unique+sparse
  walletStatus: WalletStatus;
  walletLinkChallenge?: never; // Never returned in API responses
}

// ─── Challenge Response ─────────────────────────────────────────────────────

export interface WalletChallengeRequest {
  walletAddress: string;
}

export interface WalletChallengeResponse {
  walletAddress: string;
  message: string;
  expiresAt: string;
}

// ─── Link Wallet Request ───────────────────────────────────────────────────

export interface LinkWalletRequest {
  walletAddress: string;
  signature: string;
}

// ─── Wallet Status Display ─────────────────────────────────────────────────

export interface WalletStatusDisplay {
  label: string;
  color: 'gray' | 'yellow' | 'green' | 'red';
  action: string;
}

// ─── Wallet Error Types ───────────────────────────────────────────────────

export interface WalletError {
  status: number;
  message: string;
  code?: string;
}

// ─── Network Configuration ─────────────────────────────────────────────────

export interface NetworkConfig {
  chainId: string; // hex: 0xaa36a7
  chainName: string;
  rpcUrls: string[];
  blockExplorerUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

// ─── Sepolia Testnet Configuration ─────────────────────────────────────────

export const SEPOLIA_CONFIG: NetworkConfig = {
  chainId: '0xaa36a7',
  chainName: 'Sepolia Testnet',
  rpcUrls: ['https://rpc.sepolia.org'],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
};

// ─── Contract Addresses ─────────────────────────────────────────────────────

export const CONTRACT_ADDRESSES = {
  PropertyTitle: '0xE32642b4Ae46377C848C6689aBe3805E85c1F0f1',
  LeaseEscrow: '0x22e0d98a8eE21AE3A1071CcAEd27f59041E12B79',
  SaleEscrow: '0x30FEC5A2435B933D0eA064a894007D50FE29724e',
} as const;

// ─── Etherscan URLs ───────────────────────────────────────────────────────

export function getEtherscanAddressUrl(address: string): string {
  return `https://sepolia.etherscan.io/address/${address}`;
}

export function getEtherscanTokenUrl(contractAddress: string, tokenId: string): string {
  return `https://sepolia.etherscan.io/token/${contractAddress}?a=${tokenId}`;
}

// ─── Wallet Validation ───────────────────────────────────────────────────

export function isValidWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function normalizeWalletAddress(address: string): string {
  return address.toLowerCase();
}

export function truncateWalletAddress(address: string, chars: number = 6): string {
  if (!address) return '';
  return `${address.slice(0, chars)}…${address.slice(-4)}`;
}
