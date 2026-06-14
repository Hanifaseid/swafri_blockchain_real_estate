'use client';

import React from 'react';
import { Property } from '../types';
import { Search, Building2, MapPin, Heart, ArrowRight } from 'lucide-react';

interface MarketDiscoverProps {
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  filterPurpose: 'ALL' | 'FOR_RENT' | 'FOR_SALE';
  setFilterPurpose: (p: 'ALL' | 'FOR_RENT' | 'FOR_SALE') => void;
  filterType: 'ALL' | 'Apartment' | 'House' | 'Land' | 'Commercial Space';
  setFilterType: (t: 'ALL' | 'Apartment' | 'House' | 'Land' | 'Commercial Space') => void;
  filterVerified: boolean;
  setFilterVerified: (b: boolean) => void;
  filteredProperties: Property[];
  favorites: string[];
  toggleFavorite: (id: string, e: React.MouseEvent) => void;
  openPropertyDetail: (p: Property) => void;
}

export default function MarketDiscover({
  searchTerm,
  setSearchTerm,
  filterPurpose,
  setFilterPurpose,
  filterType,
  setFilterType,
  filterVerified,
  setFilterVerified,
  filteredProperties,
  favorites,
  toggleFavorite,
  openPropertyDetail,
}: MarketDiscoverProps) {
  return (
    <div className="space-y-6" id="market-discover-root">
      {/* Filter controls bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center justify-between" id="discover-filters-container">
        <div className="flex items-center gap-2 border bg-slate-50 px-3.5 py-2 rounded-lg flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by city, country or structure name..."
            className="bg-transparent border-none outline-none text-xs w-full text-slate-800 focus:ring-0 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-3 text-xs" id="discover-dropdowns-container">
          {/* Purpose selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[10px]">PURPOSE:</span>
            <select
              value={filterPurpose}
              onChange={(e: any) => setFilterPurpose(e.target.value)}
              className="border rounded-lg p-2 bg-white text-slate-700 font-medium cursor-pointer outline-none text-xs"
            >
              <option value="ALL">All Purposes</option>
              <option value="FOR_RENT">For Rent</option>
              <option value="FOR_SALE">For Sale</option>
            </select>
          </div>

          {/* Type selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[10px]">TYPE:</span>
            <select
              value={filterType}
              onChange={(e: any) => setFilterType(e.target.value)}
              className="border rounded-lg p-2 bg-white text-slate-700 font-medium cursor-pointer outline-none text-xs"
            >
              <option value="ALL">All Types</option>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Land">Land</option>
              <option value="Commercial Space">Commercial Space</option>
            </select>
          </div>

          {/* Verified badge only */}
          <label className="flex items-center gap-2 cursor-pointer border rounded-lg p-2 hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={filterVerified}
              onChange={(e) => setFilterVerified(e.target.checked)}
              className="accent-blue-600 rounded cursor-pointer"
            />
            <span className="text-slate-700 font-medium text-xs">Show Verified Only</span>
          </label>
        </div>
      </div>

      {/* Verified badge disclaimer as per property module */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-blue-800 leading-relaxed font-medium" id="discover-safety-banner">
        🛡️ <strong>Safety Disclaimer:</strong> Properties displaying the <strong>Verified Property</strong> badge have had physical ownership documents and covenants audited on-platform by certified compliance personnel. Ownership verification proof hashes represent recorded digital title records matching physical archives.
      </div>

      {/* LISTINGS GRID */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center text-slate-400 space-y-2.5" id="no-listings-fallback">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm font-medium">No matching verified property listings found inside active markets.</p>
          <p className="text-xs">Adjust search parameters or try checking back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="discover-listings-grid">
          {filteredProperties.map((item) => {
            const isFaved = favorites.includes(item.id);
            return (
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
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 animate-fade-in">
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
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center border text-slate-700 shadow-md transition-colors z-20"
                  >
                    <Heart className={`w-4 h-4 ${isFaved ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
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
            );
          })}
        </div>
      )}
    </div>
  );
}
