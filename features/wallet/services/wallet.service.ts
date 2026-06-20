import type {
  WalletChallengeRequest,
  WalletChallengeResponse,
  LinkWalletRequest,
} from '../types/wallet.types';
import { getSession } from '@/lib/auth/session';

// ─── API Base URL ─────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

// ─── Request Helper ───────────────────────────────────────────────────

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const session = getSession();
  const token = session?.token;
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw {
      status: response.status,
      message: error.message || 'Request failed',
      code: error.code,
    };
  }

  return response.json();
}

// ─── Request Wallet Challenge ─────────────────────────────────────────

export async function requestWalletChallenge(
  walletAddress: string
): Promise<WalletChallengeResponse> {
  const request: WalletChallengeRequest = { walletAddress };
  
  const response = await apiRequest<{ success: boolean; data: WalletChallengeResponse }>(
    '/auth/wallet/challenge',
    {
      method: 'POST',
      body: JSON.stringify(request),
    }
  );

  return response.data;
}

// ─── Link Wallet ─────────────────────────────────────────────────────

export async function linkWallet(
  walletAddress: string,
  signature: string
): Promise<any> {
  const request: LinkWalletRequest = { walletAddress, signature };
  
  const response = await apiRequest<{ success: boolean; data: any }>(
    '/auth/wallet/link',
    {
      method: 'POST',
      body: JSON.stringify(request),
    }
  );

  return response.data;
}

// ─── Unlink Wallet ───────────────────────────────────────────────────

export async function unlinkWallet(): Promise<any> {
  const response = await apiRequest<{ success: boolean; data: any }>(
    '/auth/wallet',
    {
      method: 'DELETE',
    }
  );

  return response.data;
}

// ─── Get Wallet Status ───────────────────────────────────────────────

export async function getWalletStatus(): Promise<any> {
  const response = await apiRequest<{ success: boolean; data: any }>(
    '/auth/wallet/status',
    {
      method: 'GET',
    }
  );

  return response.data;
}
