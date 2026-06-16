'use client';

import { useAuthStore } from '@/stores/auth.store';
import { Settings, ShieldAlert } from 'lucide-react';
import { siteConfig } from '@/config/site.config';

export default function SettingsPage() {
  const { currentUser } = useAuthStore();

  if (!currentUser) return null;

  const canAccess = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ShieldAlert className="w-12 h-12 text-red-400" />
        <p className="text-white/60 font-light">Admin access required.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-6 h-6 text-white/60" />
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/35">Platform</p>
          <h1 className="text-2xl font-light text-white tracking-tight">Settings</h1>
        </div>
      </div>

      <div className="space-y-4">
        <div className="dash-card p-5">
          <div className="text-[10px] font-mono uppercase tracking-widest text-white/35 mb-3">Platform Info</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/50">Name</span>
              <span className="text-white font-mono">{siteConfig.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Support</span>
              <span className="text-white font-mono">{siteConfig.links.support}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Operations</span>
              <span className="text-white font-mono">{siteConfig.links.operations}</span>
            </div>
          </div>
        </div>

        <div className="dash-card p-5">
          <div className="text-[10px] font-mono uppercase tracking-widest text-white/35 mb-2">Mode</div>
          <div className="text-sm text-white/70">
            Currently running in <span className="text-emerald-400 font-mono">mock mode</span> — all data stored in localStorage. Connect <span className="font-mono text-white/50">NEXT_PUBLIC_API_URL</span> to switch to live backend.
          </div>
        </div>
      </div>
    </div>
  );
}
