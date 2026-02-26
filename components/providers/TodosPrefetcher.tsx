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

  return null;
}
