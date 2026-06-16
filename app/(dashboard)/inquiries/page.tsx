'use client';

import { MessageSquare, Clock } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { ROLE_LABELS } from '@/features/roles/types/role.types';

// ─── Inquiries Page — Placeholder ─────────────────────────────────────────────
// PROPERTY_OWNER: View and respond to tenant inquiries
// TENANT:         View own sent inquiries and their status
//
// Full implementation comes in the Properties feature (next spec).

const COMING_CONTENT: Record<string, { title: string; desc: string }> = {
  PROPERTY_OWNER: {
    title: 'Tenant Inquiries',
    desc: 'View rent and purchase inquiries from tenants. Respond and manage follow-ups.',
  },
  TENANT: {
    title: 'My Inquiries',
    desc: 'Track the status of your rent and purchase requests sent to property owners.',
  },
  ADMIN: {
    title: 'Inquiries Overview',
    desc: 'Platform-wide inquiry monitoring.',
  },
  SUPER_ADMIN: {
    title: 'Inquiries Overview',
    desc: 'Platform-wide inquiry monitoring.',
  },
};

export default function InquiriesPage() {
  const { currentUser } = useAuthStore();
  if (!currentUser) return null;

  const content = COMING_CONTENT[currentUser.role] ?? COMING_CONTENT.TENANT;

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-6 h-6 text-emerald-400 shrink-0" />
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
        <div className="w-14 h-14 rounded-2xl bg-emerald-950/40 border border-emerald-900/40 flex items-center justify-center mx-auto mb-5">
          <Clock className="w-7 h-7 text-emerald-600" />
        </div>
        <p className="text-black/60 font-light mb-2">{content.desc}</p>
        <p className="text-xs text-black/25 font-mono">Coming in: Properties Feature</p>
      </div>
    </div>
  );
}
