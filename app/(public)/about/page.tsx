'use client';

import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Building2, Coins, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      {/* Ambient glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-900/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[50%] h-[50%] rounded-full bg-blue-900/8 blur-[120px] pointer-events-none" />

      {/* Back nav */}
      <div className="px-6 md:px-16 pt-8 pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          Back to Home
        </Link>
      </div>

      <main className="max-w-4xl mx-auto px-6 md:px-12 py-16 relative z-10">
        {/* Header */}
        <div className="mb-14">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-3 py-1.5 rounded-full">
            About Swafir
          </span>
          <h1 className="text-4xl md:text-5xl font-light text-white mt-5 mb-4 leading-tight tracking-tight">
            Real Estate Ownership,<br />Rebuilt on the Blockchain.
          </h1>
          <p className="text-base text-white/60 max-w-2xl leading-relaxed font-light">
            Swafir is a blockchain-powered real estate marketplace that makes property ownership
            transparent, accessible, and trustless. We connect verified property owners with
            tenants and investors through smart contract technology.
          </p>
        </div>

        {/* Mission pillars */}
        <div className="grid md:grid-cols-2 gap-5 mb-16">
          {[
            {
              icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
              title: 'Verified Ownership',
              desc: 'Every property is deed-verified before listing. Ownership records are hashed on-chain as ERC-1155 title certificates — immutable and publicly auditable.',
            },
            {
              icon: <Coins className="w-5 h-5 text-emerald-400" />,
              title: 'Fractional Investment',
              desc: 'Own a share of premium real estate globally, starting from $85 USDC. Earn proportional rental yield distributed automatically through smart contracts.',
            },
            {
              icon: <Building2 className="w-5 h-5 text-emerald-400" />,
              title: 'Smart Contract Leases',
              desc: 'Rental agreements are codified as smart contracts. Payments flow through multisig escrow wallets — no banks, no delays, fully transparent.',
            },
            {
              icon: <Users className="w-5 h-5 text-emerald-400" />,
              title: 'KYC-Backed Trust',
              desc: 'Every participant is identity-verified. Our admin review process ensures only compliant property owners and tenants operate on the platform.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="liquid-glass border border-white/10 rounded-2xl p-6"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-xs text-white/50 leading-relaxed font-light">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </main>
    </div>
  );
}
