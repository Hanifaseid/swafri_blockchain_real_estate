'use client';

import { useEffect, useState, useCallback } from 'react';
import { History } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { getAuditLogs, type AuditLog } from '@/features/audit/services/audit.service';
import { getUserById } from '@/features/users/services/users.service';
import {
  AdminPageLayout,
  AdminTable,
  AdminTableRow,
  AdminTableCell,
  AdminLoadingState,
  AdminEmptyState,
  AdminFilterBar,
} from '@/components/admin/ui';

// ─── Actor cache ──────────────────────────────────────────────────────────────
// Maps actor ID → { name, email } so we only fetch each user once.

interface ActorInfo {
  name: string;
  email: string;
}

export default function AuditPage() {
  const { currentUser } = useAuthStore();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  // Cache of actorId → { name, email }
  const [actorCache, setActorCache] = useState<Record<string, ActorInfo>>({});

  // Fetch actor details for all unique actor IDs in the logs
  const enrichActors = useCallback(async (items: AuditLog[]) => {
    const uniqueIds = [...new Set(
      items.map((l) => l.actorId).filter(Boolean) as string[]
    )];

    const results = await Promise.allSettled(
      uniqueIds.map(async (id) => {
        try {
          const user = await getUserById(id);
          if (user) return { id, name: user.name, email: user.email };
          return null;
        } catch {
          return null;
        }
      })
    );

    const newCache: Record<string, ActorInfo> = {};
    results.forEach((r) => {
      if (r.status === 'fulfilled' && r.value) {
        newCache[r.value.id] = { name: r.value.name, email: r.value.email };
      }
    });

    setActorCache(newCache);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getAuditLogs()
      .then((items) => {
        const arr = Array.isArray(items)
          ? items
          : Array.isArray((items as any)?.data)
          ? (items as any).data
          : Array.isArray((items as any)?.items)
          ? (items as any).items
          : [];
        if (active) {
          setLogs(arr);
          // Enrich actor details in the background — non-blocking
          void enrichActors(arr);
        }
      })
      .catch(() => { if (active) setLogs([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [enrichActors]);

  if (!currentUser) return null;

  const filtered = search
    ? logs.filter((l) => {
        const actor = l.actorId ? actorCache[l.actorId] : null;
        const nameMatch = actor?.name.toLowerCase().includes(search.toLowerCase());
        const emailMatch = actor?.email.toLowerCase().includes(search.toLowerCase());
        const actionMatch = l.action.toLowerCase().includes(search.toLowerCase());
        const roleMatch = l.user.toLowerCase().includes(search.toLowerCase());
        return nameMatch || emailMatch || actionMatch || roleMatch;
      })
    : logs;

  return (
    <AdminPageLayout
      icon={History}
      label="Platform"
      title="Audit Logs"
      maxWidth="max-w-6xl"
    >
      <AdminFilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search by name, email, or action…"
        className="mb-5"
      />

      {loading ? (
        <AdminLoadingState />
      ) : (
        <>
          <AdminTable
            headers={['Actor', 'Action', 'Target', 'Time']}
            empty={
              filtered.length === 0
                ? <AdminEmptyState icon={History} title="No audit logs found" />
                : undefined
            }
          >
            {filtered.map((log, i) => {
              const actor = log.actorId ? actorCache[log.actorId] : null;

              return (
                <AdminTableRow key={log.id ?? `log-${i}`}>
                  {/* Actor — shows name + email once enriched, falls back to role + ID */}
                  <AdminTableCell>
                    {actor ? (
                      <>
                        <p className="text-sm font-medium text-gray-800">{actor.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{actor.email}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-700 capitalize">{log.user}</p>
                        {log.actorId && (
                          <p className="text-[10px] text-gray-400 font-mono">…{log.actorId.slice(-8)}</p>
                        )}
                      </>
                    )}
                  </AdminTableCell>

                  {/* Action */}
                  <AdminTableCell>
                    <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                  </AdminTableCell>

                  {/* Target */}
                  <AdminTableCell muted>
                    {log.targetType && (
                      <span className="text-xs text-gray-500 capitalize">{log.targetType}</span>
                    )}
                    {log.targetId && (
                      <p className="text-[10px] text-gray-400 font-mono">…{log.targetId.slice(-8)}</p>
                    )}
                  </AdminTableCell>

                  {/* Time */}
                  <AdminTableCell mono muted>
                    {(() => {
                      const d = new Date(log.timestamp);
                      return isNaN(d.getTime())
                        ? '—'
                        : d.toLocaleString('en-GB', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          });
                    })()}
                  </AdminTableCell>
                </AdminTableRow>
              );
            })}
          </AdminTable>

          {filtered.length > 0 && (
            <p className="mt-3 text-xs text-gray-400 font-mono">
              {filtered.length} entr{filtered.length !== 1 ? 'ies' : 'y'}
            </p>
          )}
        </>
      )}
    </AdminPageLayout>
  );
}
