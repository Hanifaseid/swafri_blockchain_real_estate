'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { WalletCards } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  useWalletChallenge,
  useLinkWallet,
  useUnlinkWallet,
} from '@/features/auth/queries/auth.queries';
import { useAuthStore } from '@/stores/auth.store';
import { connectInjected, hasInjectedWallet, personalSign } from '@/lib/wallet/injected';

const WALLET_LABEL: Record<string, string> = {
  LINKED: 'Linked',
  VERIFIED: 'Linked',
  NOT_LINKED: 'Not linked',
  PENDING: 'Pending signature',
  REVOKED: 'Revoked',
};

export function WalletSection() {
  const { currentUser } = useAuthStore();
  const challenge = useWalletChallenge();
  const link = useLinkWallet();
  const unlink = useUnlinkWallet();
  const [linking, setLinking] = useState(false);

  const linked = !!currentUser?.linkedWalletAddress;
  const busy = linking || challenge.isPending || link.isPending;

  // Connect → challenge → personal_sign → link.
  const handleLink = async () => {
    if (!hasInjectedWallet()) {
      toast.error('No wallet detected. Install MetaMask or a Web3 wallet to link.');
      return;
    }
    setLinking(true);
    try {
      const address = await connectInjected();
      const message = await challenge.mutateAsync(address);
      const signature = await personalSign(message, address);
      await link.mutateAsync({ walletAddress: address, signature });
      toast.success('Wallet linked.');
    } catch (e: any) {
      toast.error(e?.shortMessage ?? e?.message ?? 'Could not link wallet.');
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = () => {
    unlink.mutate(undefined, {
      onSuccess: () => toast.success('Wallet unlinked.'),
      onError: (e: any) =>
        toast.error(e?.message ?? 'Could not unlink wallet (active escrow may block this).'),
    });
  };

  return (
    <section className="rounded-lg border border-[#d5c8b3] bg-white p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-[#f1ece0] p-2.5 text-[#7d561f]">
            <WalletCards size={20} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#153828]">Linked wallet</h2>
            <p className="mt-0.5 font-mono text-xs text-[#5f6b61]">
              {currentUser?.linkedWalletAddress ?? 'No wallet linked'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#f7f2e8] px-3 py-1.5 text-xs font-semibold text-[#163c2c]">
            {WALLET_LABEL[currentUser?.walletStatus ?? 'NOT_LINKED'] ?? currentUser?.walletStatus}
          </span>
          {linked ? (
            <Button variant="outline" onClick={handleUnlink} loading={unlink.isPending}>
              Unlink
            </Button>
          ) : (
            <Button onClick={handleLink} loading={busy}>
              <WalletCards size={16} />
              Connect &amp; link
            </Button>
          )}
        </div>
      </div>
      <p className="mt-3 text-xs text-[#5f6b61]">
        A linked wallet is where your property title certificate is issued and where escrow refunds
        are received. Linking asks your wallet to sign a one-time message — no transaction or gas.
      </p>
    </section>
  );
}
