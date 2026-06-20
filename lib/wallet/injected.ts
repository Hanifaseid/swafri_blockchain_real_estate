// ─── Injected wallet (EIP-1193) ───────────────────────────────────────────────
// Lightweight helpers around window.ethereum (MetaMask et al.). The project
// declares `wagmi` but never configures a WagmiProvider, so we talk to the
// injected provider directly — no provider tree required, works in any browser
// with a wallet extension.

interface Eip1193Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export function getInjected(): Eip1193Provider | null {
  if (typeof window === 'undefined') return null;
  return window.ethereum ?? null;
}

export function hasInjectedWallet(): boolean {
  return !!getInjected();
}

/** Prompt the user to connect and return the primary account address (lowercased). */
export async function connectInjected(): Promise<string> {
  const provider = getInjected();
  if (!provider) throw new Error('No wallet detected. Please install MetaMask or a Web3 wallet.');
  const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[];
  if (!accounts || accounts.length === 0) throw new Error('No wallet account was authorised.');
  return accounts[0].toLowerCase();
}

/** Sign a plain message with personal_sign for the given address. */
export async function personalSign(message: string, address: string): Promise<string> {
  const provider = getInjected();
  if (!provider) throw new Error('No wallet detected.');
  return (await provider.request({
    method: 'personal_sign',
    params: [message, address],
  })) as string;
}

export function truncateAddress(address: string): string {
  return address ? `${address.slice(0, 6)}…${address.slice(-4)}` : '';
}
