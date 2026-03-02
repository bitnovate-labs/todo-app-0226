import { QueryClient } from "@tanstack/react-query";

/**
 * Default stale time so cached todos are reused when switching pages.
 * 30s = treat as fresh for 30s when navigating; refetch when opening app (visibility) gets newer data.
 */
const DEFAULT_STALE_TIME_MS = 30 * 1000;

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
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        retry: shouldRetry,
      },
    },
  });
}

export const TODOS_QUERY_KEY = ["todos"] as const;
export const TIME_BLOCKS_QUERY_KEY = ["time-blocks"] as const;
