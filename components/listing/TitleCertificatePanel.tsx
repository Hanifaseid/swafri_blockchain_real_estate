'use client';

import * as React from 'react';
import { BadgeCheck, ExternalLink, Hash, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import { getListingTitle, type TitleInfo } from '@/features/listings/services/listing.service';

/**
 * TitleCertificatePanel — the on-chain Certificate of Title for a listing.
 *
 * Fetches the live title record (`GET /listings/:id/title`) and renders it as
 * an editorial registry certificate. Falls back to a "not yet certified" state
 * when no title has been minted. Self-contained: drop in with a listing id.
 */

function truncate(value?: string, head = 10, tail = 8): string {
  if (!value) return '—';
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

type TitleState = 'verified' | 'unverified' | 'none';

export function TitleCertificatePanel({
  listingId,
  verificationStatus,
}: {
  listingId: string;
  verificationStatus?: string;
}) {
  const [titleState, setTitleState] = React.useState<{
    listingId: string;
    title: TitleInfo | null;
    loading: boolean;
  }>({ listingId, title: null, loading: true });

  React.useEffect(() => {
    let alive = true;
    getListingTitle(listingId)
      .then((title) => {
        if (alive) setTitleState({ listingId, title, loading: false });
      })
      .catch(() => {
        if (alive) setTitleState({ listingId, title: null, loading: false });
      });
    return () => {
      alive = false;
    };
  }, [listingId]);

  const loading = titleState.loading || titleState.listingId !== listingId;
  const title = titleState.listingId === listingId ? titleState.title : null;

  if (loading) {
    return (
      <div className="cert grain rounded-xl p-6">
        <div className="relative z-[2] animate-pulse space-y-3">
          <div className="mx-auto h-3 w-32 rounded bg-[#9d6f22]/20" />
          <div className="mx-auto h-5 w-44 rounded bg-[#9d6f22]/25" />
          <div className="h-16 rounded bg-[#9d6f22]/10" />
        </div>
      </div>
    );
  }

  // No on-chain title yet
  if (!title) {
    return (
      <div className="rounded-2xl border border-border-primary bg-surface-card p-5">
        <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold text-white">
          <ShieldAlert className="h-4 w-4 text-text-muted" />
          Certificate of Title
        </h4>
        <p className="text-xs leading-relaxed text-text-muted">
          {verificationStatus === 'verified'
            ? 'Ownership verified — a blockchain title certificate is being prepared for this listing.'
            : 'This listing does not yet have an on-chain title certificate.'}
        </p>
      </div>
    );
  }

  const hashesMatch =
    !!title.onChainHash &&
    !!title.offChainHash &&
    title.onChainHash.toLowerCase() === title.offChainHash.toLowerCase();
  const state: TitleState = title.verified ? 'verified' : 'unverified';

  const seal = {
    verified: { label: 'Title · Active', Icon: ShieldCheck, cls: 'text-emerald-800 ring-emerald-700/25 bg-emerald-700/12' },
    unverified: { label: 'Unverified', Icon: ShieldX, cls: 'text-[#7d561f] ring-[#9d6f22]/30 bg-[#9d6f22]/12' },
    none: { label: 'No title', Icon: ShieldAlert, cls: 'text-text-muted ring-border-primary bg-surface-highlight' },
  }[state];

  return (
    <div className="cert grain relative rounded-xl p-6">
      <div className="relative z-[2] cert-guilloche -m-1 p-1">
        {/* Masthead */}
        <div className="text-center">
          <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#9d6f22]">
            VEX Property Register
          </div>
          <div className="mt-1 font-display text-xl font-semibold leading-none text-[#2c2415]">
            Certificate of Title
          </div>
          <div className="mx-auto mt-3 h-px w-20 bg-[#9d6f22]/40" />
        </div>

        {/* Registry fields */}
        <dl className="mt-4 space-y-2 text-[#5a4a2e]">
          <Field label="Token ID" value={`#${title.tokenId}`} mono />
          <Field label="Contract" value={truncate(title.contractAddress)} mono />
          <Field label="Owner" value={truncate(title.owner)} mono />
          <Field
            label="Doc Hash"
            value={truncate(title.onChainHash, 8, 6)}
            mono
            icon={<Hash className="h-3 w-3" />}
          />
        </dl>

        {/* Integrity check */}
        <div className="mt-3 rounded-md border border-[#9d6f22]/20 bg-[#9d6f22]/5 px-3 py-2 text-[11px]">
          {hashesMatch ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-800">
              <BadgeCheck className="h-3.5 w-3.5" />
              Document hash matches the on-chain record
            </span>
          ) : (
            <span className="text-[#7d561f]">
              On-chain and document hashes could not be matched — verify with the registrar.
            </span>
          )}
        </div>

        {/* Status + seal */}
        <div className="mt-4 flex items-end justify-between">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${seal.cls}`}
          >
            <seal.Icon className="h-3.5 w-3.5" />
            {seal.label}
          </span>
          <div className="grid h-11 w-11 place-items-center rounded-full wax-seal text-emerald-950">
            <BadgeCheck className="h-5 w-5" />
          </div>
        </div>

        {/* Explorer link */}
        {title.contractAddress && (
          <a
            href={`https://sepolia.etherscan.io/token/${title.contractAddress}?a=${title.tokenId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#9d6f22] transition-colors hover:text-[#7d561f]"
          >
            View on-chain <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
  icon,
}: {
  label: string;
  value: string;
  mono?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <dt className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#9d6f22]">
        {icon}
        {label}
      </dt>
      <dd className={mono ? 'font-mono font-medium text-[#2c2415]' : 'font-medium text-[#2c2415]'}>
        {value}
      </dd>
    </div>
  );
}
