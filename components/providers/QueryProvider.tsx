'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query/query-client';

// ─── QueryProvider ────────────────────────────────────────────────────────────
// Wraps the app with TanStack QueryClientProvider.
// Uses the singleton queryClient from lib/query/query-client.ts.
// Must be a Client Component because QueryClientProvider uses React context.

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
