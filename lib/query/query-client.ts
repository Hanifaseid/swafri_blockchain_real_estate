import { QueryClient } from '@tanstack/react-query';

// ─── Query Client ─────────────────────────────────────────────────────────────
// Singleton QueryClient used across the entire app.
// Imported by QueryProvider (components/providers/QueryProvider.tsx).
//
// Stale/GC times are set conservatively — mock data does not expire,
// but these defaults are correct for when the real API is connected.

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data stays fresh for 5 minutes
      staleTime: 1000 * 60 * 5,
      // Removed from cache 10 minutes after last subscriber unmounts
      gcTime: 1000 * 60 * 10,
      // Retry once on failure (network hiccup), not on 4xx errors
      retry: (failureCount, error: unknown) => {
        const status = (error as { response?: { status: number } })?.response?.status;
        // Do not retry on client errors (400, 401, 403, 404)
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
