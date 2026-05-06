import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import type { Query } from "@tanstack/react-query";
import {
  TODOS_QUERY_KEY,
  TIME_BLOCKS_QUERY_KEY,
  QUERY_GC_TIME_MS,
} from "@/lib/query-client";
import { HABITS_QUERY_KEY } from "@/lib/habits-query";

/** Bump if persisted cache shape changes (invalidates old localStorage blobs). */
const STORAGE_VERSION = "v1";

export const REACT_QUERY_PERSIST_MAX_AGE_MS = QUERY_GC_TIME_MS;

export function getReactQueryPersistStorageKey(userId: string): string {
  return `todo-pwa-rq-${STORAGE_VERSION}-${userId}`;
}

export function createTodoQueryPersister(userId: string) {
  return createSyncStoragePersister({
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    key: getReactQueryPersistStorageKey(userId),
    throttleTime: 1000,
  });
}

/** Options for PersistQueryClientProvider (excludes queryClient). */
export function buildPersistOptions(userId: string) {
  return {
    persister: createTodoQueryPersister(userId),
    maxAge: REACT_QUERY_PERSIST_MAX_AGE_MS,
    dehydrateOptions: {
      shouldDehydrateQuery: (query: Query) => {
        const root = query.queryKey[0];
        return (
          root === TODOS_QUERY_KEY[0] ||
          root === TIME_BLOCKS_QUERY_KEY[0] ||
          root === HABITS_QUERY_KEY[0]
        );
      },
    },
  };
}

export function clearPersistedReactQueryCache(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(getReactQueryPersistStorageKey(userId));
  } catch {
    // Quota or private mode — ignore
  }
}
