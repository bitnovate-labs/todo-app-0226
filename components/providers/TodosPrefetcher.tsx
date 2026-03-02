"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { todosQueryKey, fetchTodos } from "@/lib/todos-query";
import {
  timeBlocksQueryKey,
  fetchTimeBlocks,
} from "@/lib/time-blocks-query";
import { todayKey } from "@/lib/todos";

/**
 * Prefetch todos and today's time blocks when the app loads with a logged-in user
 * so navigation to Home / Week / History / Time shows data immediately from cache.
 * Skips prefetch when the cache is already seeded (e.g. from InitialDataFetcher)
 * to avoid a redundant client fetch and the resulting "data updates after a few seconds" flash.
 *
 * When the user opens the app (document becomes visible), invalidates todos and time blocks
 * so they refetch and the UI is always up to date. Offline: refetch fails silently and
 * cached data stays visible.
 */
export function TodosPrefetcher({ userId }: { userId: string | null }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    const todosKey = todosQueryKey(userId);
    const timeBlocksKey = timeBlocksQueryKey(userId, todayKey());
    if (queryClient.getQueryData(todosKey) == null) {
      queryClient.prefetchQuery({
        queryKey: todosKey,
        queryFn: fetchTodos,
      });
    }
    if (queryClient.getQueryData(timeBlocksKey) == null) {
      queryClient.prefetchQuery({
        queryKey: timeBlocksKey,
        queryFn: () => fetchTimeBlocks(userId, todayKey()),
      });
    }
  }, [userId, queryClient]);

  // Refetch data when the user returns to the app (hidden → visible), not on first load.
  useEffect(() => {
    if (!userId) return;
    let wasHidden = false;

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        wasHidden = true;
        return;
      }
      if (document.visibilityState === "visible" && wasHidden) {
        wasHidden = false;
        const todosKey = todosQueryKey(userId);
        const timeBlocksKey = timeBlocksQueryKey(userId, todayKey());
        queryClient.invalidateQueries({ queryKey: todosKey });
        queryClient.invalidateQueries({ queryKey: timeBlocksKey });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [userId, queryClient]);

  return null;
}
