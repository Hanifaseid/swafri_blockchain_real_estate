'use client';

import React from 'react';
import { Property } from '../types';
import { Heart, MapPin, ArrowRight } from 'lucide-react';

interface SavedListingsProps {
  favorites: string[];
  properties: Property[];
  toggleFavorite: (id: string, e: React.MouseEvent) => void;
  openPropertyDetail: (p: Property) => void;
}

export default function SavedListings({
  favorites,
  properties,
  toggleFavorite,
  openPropertyDetail,
}: SavedListingsProps) {
  const favProperties = properties.filter((p) => favorites.includes(p.id));

  return (
    <div className="space-y-6" id="saved-listings-root">
      {favProperties.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center text-slate-400 space-y-2.5" id="no-favs-fallback">
          <Heart className="w-12 h-12 text-slate-300 mx-auto animate-pulse" />
          <p className="text-sm font-medium">Your bookmarked portfolio is empty.</p>
          <p className="text-xs">Re-toggle the heart icon on any market asset cards to save files locally.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="favs-listings-grid">
          {favProperties.map((item) => (
            <div
              key={item.id}
              onClick={() => openPropertyDetail(item)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="relative h-48 bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Badge layout overlay */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold font-mono px-2.5 py-1 rounded bg-blue-600 text-white shadow-lg uppercase tracking-wide">
                    {item.purpose.replace('FOR_', '').replace('_', ' ')}
                  </span>
                  {(item.status === 'PUBLISHED' || item.status === 'VERIFIED') && (
                    <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500 text-white shadow flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Verified Property
                    </span>
                  )}
                </div>

                {/* Favorites trigger */}
                <button
                  onClick={(e) => toggleFavorite(item.id, e)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center border text-rose-500 shadow-md transition-colors z-20"
                >
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                </button>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-mono">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span>{item.location}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mt-1.5 group-hover:text-blue-600 transition-colors">
                    {item.name}
                  </h3>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-slate-500 bg-slate-50 p-2.5 rounded-xl">
                  <div>
                    <span className="block text-[9px] text-slate-400 font-mono">TOKEN PRICE</span>
                    <span className="text-slate-900 font-mono">${item.tokenPrice} USD</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-400 font-mono">LEDGER APY</span>
                    <span className="text-emerald-600 font-mono">+{item.apy}%</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-400 font-mono">TYPE</span>
                    <span className="text-blue-600 uppercase font-mono text-[9px]">{item.type}</span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-[10px]">Supply Available: {item.tokensAvailable} / {item.totalTokens} Keys</span>
                <span className="text-blue-600 font-semibold flex items-center gap-1 hover:underline text-[11px] font-mono">
                  LAUNCH LEDGER <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
