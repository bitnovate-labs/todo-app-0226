import { QueryClient } from "@tanstack/react-query";

/**
 * Default stale time so cached todos are reused when switching pages.
 * 30s = treat as fresh for 30s when navigating; refetch when opening app (visibility) gets newer data.
 */
const DEFAULT_STALE_TIME_MS = 30 * 1000;

/**
 * Keep cached query data long enough for localStorage restore (persist maxAge).
 * Must be >= persist maxAge in lib/query-persistence.ts.
 */
export const QUERY_GC_TIME_MS = 1000 * 60 * 60 * 24;

/**
 * Retry failed fetches only when online; when offline, use cached data immediately.
 */
function shouldRetry(_failureCount: number, error: unknown): boolean {
  if (typeof navigator !== "undefined" && !navigator.onLine) return false;
  return true;
}

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_STALE_TIME_MS,
        gcTime: QUERY_GC_TIME_MS,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        retry: shouldRetry,
      },
    },
  });
}

export const TODOS_QUERY_KEY = ["todos"] as const;
export const TIME_BLOCKS_QUERY_KEY = ["time-blocks"] as const;
