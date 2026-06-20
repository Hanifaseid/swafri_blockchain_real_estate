'use client';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, ChevronDown, Copy, LogOut, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { connectInjected, hasInjectedWallet, truncateAddress } from '@/lib/wallet/injected';

/**
 * WalletConnectButton — connects a browser wallet (MetaMask, etc.) via the
 * injected EIP-1193 provider (window.ethereum). No wagmi/WagmiProvider needed.
 *
 * Usage:
 *   <WalletConnectButton />
 */
export function WalletConnectButton({ className }: { className?: string }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleConnect() {
    if (!hasInjectedWallet()) {
      toast.error('No wallet detected. Install MetaMask or a Web3 wallet.');
      return;
    }
    setConnecting(true);
    try {
      setAddress(await connectInjected());
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not connect wallet.');
    } finally {
      setConnecting(false);
    }
  }

  async function handleCopy() {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (!address) {
    return (
      <button
        type="button"
        onClick={handleConnect}
        disabled={connecting}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-60',
          className,
        )}
      >
        <Wallet size={16} />
        {connecting ? 'Connecting…' : 'Connect Wallet'}
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50',
          className,
        )}
      >
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        {truncateAddress(address)}
        <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
          <button
            type="button"
            onClick={handleCopy}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy address'}
          </button>
          <button
            type="button"
            onClick={() => {
              setAddress(null);
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut size={14} />
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
