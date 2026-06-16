'use client';

import { useEffect, useState } from 'react';
import { History, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { SESSION_KEYS } from '@/lib/auth/session';
import { SearchInput } from '@/components/ui/SearchInput';

interface AuditEntry {
  id: string;
  user: string;
  email: string;
  action: string;
  timestamp: string;
}

export default function AuditPage() {
  const { currentUser } = useAuthStore();
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEYS.AUDIT_LOGS);
    if (raw) setLogs(JSON.parse(raw));
  }, []);

  if (!currentUser) return null;

  const canAccess = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';
  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ShieldAlert className="w-12 h-12 text-red-400" />
        <p className="text-black/60 font-light">Admin access required.</p>
      </div>
    );
  }

  const filtered = search
    ? logs.filter(
        (l) =>
          l.user.toLowerCase().includes(search.toLowerCase()) ||
          l.email.toLowerCase().includes(search.toLowerCase()) ||
          l.action.toLowerCase().includes(search.toLowerCase())
      )
    : logs;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-black/50 shrink-0" />
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-black/35">Platform</p>
            <h1 className="text-2xl font-light text-[#0f172a] tracking-tight">Audit Logs</h1>
          </div>
        </div>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search logs…"
          className="sm:w-64"
          inputClassName="bg-black/5 border-black/10 text-[#0f172a] placeholder:text-black/25 focus:border-emerald-400"
        />
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--color-dash-border)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-dash-border)', background: 'var(--color-dash-card)' }}>
                {['User', 'Action', 'Time'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-black/35">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-black/30 text-sm font-light">
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b transition-colors hover:bg-black/3"
                    style={{ borderColor: 'var(--color-dash-border)' }}
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm text-black">{log.user}</p>
                      <p className="text-[10px] text-black/35 font-mono">{log.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-black/60">{log.action}</td>
                    <td className="px-4 py-3 text-[10px] text-black/35 font-mono blackspace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length > 0 && (
        <p className="mt-3 text-xs text-black/25 font-mono">{filtered.length} entries</p>
      )}
    </div>
  );
}
