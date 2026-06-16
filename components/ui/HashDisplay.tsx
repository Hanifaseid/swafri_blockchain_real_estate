'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * HashDisplay — truncated blockchain hash/address with copy-to-clipboard.
 * Used for token IDs, wallet addresses, and transaction hashes.
 *
 * Usage:
 *   <HashDisplay hash={txHash} />
 *   <HashDisplay hash={txHash} explorerUrl={`https://amoy.polygonscan.com/tx/${txHash}`} />
 */

interface HashDisplayProps {
  hash: string;
  /** Characters shown at the start before "..." */
  startChars?: number;
  /** Characters shown at the end after "..." */
  endChars?: number;
  /** If provided, shows a link icon that opens this URL in a new tab. */
  explorerUrl?: string;
  className?: string;
}

export function HashDisplay({
  hash,
  startChars = 6,
  endChars = 4,
  explorerUrl,
  className,
}: HashDisplayProps) {
  const [copied, setCopied] = useState(false);

  if (!hash) return <span className="text-xs text-gray-400">—</span>;

  const short =
    hash.length > startChars + endChars + 3
      ? `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`
      : hash;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard not available — fail silently
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-2 py-1 font-mono text-xs text-slate-100',
        className
      )}
      title={hash}
    >
      {short}
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy to clipboard"
        className="text-slate-400 transition-colors hover:text-white"
      >
        {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
      </button>
      {explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View on block explorer"
          className="text-slate-400 transition-colors hover:text-white"
        >
          <ExternalLink size={12} />
        </a>
      )}
    </span>
  );
}
