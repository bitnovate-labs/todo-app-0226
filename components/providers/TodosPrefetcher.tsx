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
 */
export function TodosPrefetcher({ userId }: { userId: string | null }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    queryClient.prefetchQuery({
      queryKey: todosQueryKey(userId),
      queryFn: fetchTodos,
    });
    queryClient.prefetchQuery({
      queryKey: timeBlocksQueryKey(userId, todayKey()),
      queryFn: () => fetchTimeBlocks(userId, todayKey()),
    });
  }, [userId, queryClient]);

  return null;
}
