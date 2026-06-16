'use client';

import { Building2, Clock } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { ROLE_LABELS } from '@/features/roles/types/role.types';

// ─── Properties Page — Placeholder ───────────────────────────────────────────
// ADMIN:          Review and approve/reject property listings
// PROPERTY_OWNER: Create and manage own listings
// TENANT:         Browse verified properties for rent/sale
//
// Full implementation comes in the Properties feature (next spec).

const COMING_CONTENT: Record<string, { title: string; desc: string; phase: string }> = {
  ADMIN:          { title: 'Property Review',   desc: 'Review submitted listings, approve or reject with notes.',           phase: 'Properties Feature' },
  SUPER_ADMIN:    { title: 'All Properties',     desc: 'Platform-wide property oversight and management.',                   phase: 'Properties Feature' },
  PROPERTY_OWNER: { title: 'My Listings',        desc: 'Create drafts, upload deeds, and submit for admin verification.',   phase: 'Properties Feature' },
  TENANT:         { title: 'Browse Properties',  desc: 'Discover verified properties for rent and fractional investment.',  phase: 'Properties Feature' },
};

export default function PropertiesPage() {
  const { currentUser } = useAuthStore();
  if (!currentUser) return null;

  const content = COMING_CONTENT[currentUser.role] ?? COMING_CONTENT.TENANT;

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Building2 className="w-6 h-6 text-purple-400 shrink-0" />
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">
            {ROLE_LABELS[currentUser.role]}
          </p>
          <h1 className="text-2xl font-light text-[#0f172a] tracking-tight">{content.title}</h1>
        </div>
      </div>

      <div
        className="rounded-2xl p-10 text-center"
        style={{ border: '1px solid var(--color-dash-border)', background: 'var(--color-dash-card)' }}
      >
        <div className="w-14 h-14 rounded-2xl bg-purple-950/40 border border-purple-900/40 flex items-center justify-center mx-auto mb-5">
          <Clock className="w-7 h-7 text-purple-400" />
        </div>
        <p className="text-black/60 font-light mb-2">{content.desc}</p>
        <p className="text-xs text-black/25 font-mono">Coming in: {content.phase}</p>
      </div>
    </div>
  );
}
