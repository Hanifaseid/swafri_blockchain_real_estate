'use client';

import { Heart, Clock } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

// ─── Saved Properties Page — Placeholder ─────────────────────────────────────
// TENANT only: saved/favorited property listings.
// Full implementation comes in the Properties feature (next spec).

export default function SavedPage() {
  const { currentUser } = useAuthStore();
  if (!currentUser) return null;

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-6 h-6 text-red-400 shrink-0" />
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/35">Tenant</p>
          <h1 className="text-2xl font-light text-white tracking-tight">Saved Properties</h1>
        </div>
      </div>

      <div
        className="rounded-2xl p-10 text-center"
        style={{ border: '1px solid var(--color-dash-border)', background: 'var(--color-dash-card)' }}
      >
        <div className="w-14 h-14 rounded-2xl bg-red-950/40 border border-red-900/40 flex items-center justify-center mx-auto mb-5">
          <Clock className="w-7 h-7 text-red-400" />
        </div>
        <p className="text-white/60 font-light mb-2">
          Save properties you're interested in for quick access. Favorites sync across sessions.
        </p>
        <p className="text-xs text-white/25 font-mono">Coming in: Properties Feature</p>
      </div>
    </div>
  );
}
