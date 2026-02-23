import { QueryClient } from "@tanstack/react-query";

/**
 * Default stale time so cached todos are reused when switching pages.
 * 60s = treat data as fresh for 1 minute; no refetch when navigating.
 */
const DEFAULT_STALE_TIME_MS = 60 * 1000;

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_STALE_TIME_MS,
      },
    },
  });
}

export const TODOS_QUERY_KEY = ["todos"] as const;
