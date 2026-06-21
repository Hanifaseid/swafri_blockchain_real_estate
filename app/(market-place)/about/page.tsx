'use client';

import Link from 'next/link';
import { ShieldCheck, Building2, FileCheck2, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="relative overflow-x-hidden">
      {/* Ambient glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-900/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[50%] h-[50%] rounded-full bg-blue-900/8 blur-[120px] pointer-events-none" />

      <main className="max-w-4xl py-16 relative z-10">
        {/* Header */}
        <div className="mb-14">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-3 py-1.5 rounded-full">
            About EstateLedger
          </span>
          <h1 className="text-4xl md:text-5xl font-light text-white mt-5 mb-4 leading-tight tracking-tight">
            Real Estate Ownership,<br />Rebuilt on the Blockchain.
          </h1>
          <p className="text-base text-white/60 max-w-2xl leading-relaxed font-light">
            EstateLedger is a blockchain-enabled real estate marketplace that makes listings,
            ownership review, lease escrow, and purchase workflows transparent. We connect
            verified property owners with tenants, buyers, and administrators through smart
            contract-backed records and operational compliance tools.
          </p>
        </div>

        {/* Mission pillars */}
        <div className="grid md:grid-cols-2 gap-5 mb-16">
          {[
            {
              icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
              title: 'Verified Ownership',
              desc: 'Every property can be reviewed before publication. Ownership records are anchored on-chain as ERC-721 digital title certificates with auditable document hashes.',
            },
            {
              icon: <FileCheck2 className="w-5 h-5 text-emerald-400" />,
              title: 'Map-Based Discovery',
              desc: 'Tenants can search listings with viewport, radius, custom boundary, neighborhood, and structured property filters backed by the marketplace API.',
            },
            {
              icon: <Building2 className="w-5 h-5 text-emerald-400" />,
              title: 'Lease And Purchase Escrow',
              desc: 'Rental and purchase workflows expose escrow status, title context, offers, applications, and transaction history in one accountable marketplace flow.',
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
            href="/auth/login"
            className="inline-flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </main>
    </div>
  );
}
