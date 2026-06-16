'use client';

import React from 'react';
import Link from 'next/link';
import { Coins, MapPin, Wallet, ArrowRight } from 'lucide-react';
import FadeIn from '@/components/FadeIn';
import { Property } from './data';

interface FeaturedPropertiesProps {
  properties: Property[];
  onBuyTokens: (propId: string, qty: number) => void;
}

export default function FeaturedProperties({ properties, onBuyTokens }: FeaturedPropertiesProps) {
  return (
    <section
      id="listings-section"
      className="py-24 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto z-10 relative"
    >
      <FadeIn delay={0} duration={600}>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 mb-2 block">
              Live Token Marketplace
            </span>
            <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight">
              Verified Properties, Ready to Own
            </h2>
            <p className="text-sm text-white/50 mt-2 max-w-lg font-light">
              Every listing is deed-verified, admin-approved, and backed by a blockchain title
              certificate.
            </p>
          </div>
          <Link
            href="/auth"
            className="mt-6 md:mt-0 flex items-center gap-2 text-sm text-emerald-400 font-mono hover:text-white transition-colors"
          >
            View All Properties <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </FadeIn>

      <div className="grid md:grid-cols-3 gap-6">
        {properties.map((prop, i) => (
          <FadeIn key={prop.id} delay={i * 120} duration={600}>
            <div className="liquid-glass border border-white/15 rounded-2xl overflow-hidden group shadow-xl flex flex-col">
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={prop.image}
                  alt={prop.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur text-[10px] font-mono font-bold text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-900/40 uppercase">
                  {prop.type}
                </div>
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur text-xs font-mono font-semibold text-white px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-emerald-400" />
                  ${prop.tokenPrice} USDC
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white/80 text-[11px] font-mono">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  {prop.location}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col gap-4 flex-1">
                <div>
                  <h3 className="text-base font-semibold text-white leading-tight">{prop.name}</h3>
                  <p className="text-sm text-white/50 mt-1 font-mono">
                    ${prop.monthlyRent.toLocaleString()}/mo rental income
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                  <div className="bg-white/5 border border-white/10 rounded-lg py-2">
                    <div className="text-white/40 text-[9px] uppercase mb-0.5">APY Yield</div>
                    <div className="text-emerald-400 font-bold">+{prop.apy}%</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg py-2">
                    <div className="text-white/40 text-[9px] uppercase mb-0.5">Available</div>
                    <div className="text-white font-bold">{prop.tokensAvailable.toLocaleString()}</div>
                  </div>
                </div>

                {/* Token sale progress */}
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-white/40 mb-1.5">
                    <span>Token Distribution</span>
                    <span>
                      {Math.round(
                        ((prop.totalTokens - prop.tokensAvailable) / prop.totalTokens) * 100,
                      )}
                      % Sold
                    </span>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${((prop.totalTokens - prop.tokensAvailable) / prop.totalTokens) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => onBuyTokens(prop.id, 1)}
                    className="flex-1 bg-white hover:bg-gray-100 text-black text-xs font-bold py-2.5 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    Buy Token
                  </button>
                  <Link
                    href="/auth"
                    className="liquid-glass border border-white/20 hover:bg-white/10 transition-colors text-xs font-semibold py-2.5 px-4 rounded-lg flex items-center gap-1"
                  >
                    Details <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
