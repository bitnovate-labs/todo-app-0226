"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { todosQueryKey } from "@/lib/todos-query";
import { habitsQueryKey, fetchHabits } from "@/lib/habits-query";
import {
  timeBlocksQueryKey,
  fetchTimeBlocks,
} from "@/lib/time-blocks-query";
import { todayKey } from "@/lib/todos";

/**
 * Prefetch today's time blocks if the cache is empty (todos are usually requested by
 * useTodos in the same frame). Skips when the cache is already seeded to avoid duplicate
 * fetches. On visibility return, invalidates queries so the UI refetches. Offline: skip
 * retry; cached data remains visible.
 */
export function TodosPrefetcher({ userId }: { userId: string | null }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    const habitsKey = habitsQueryKey(userId);
    const timeBlocksKey = timeBlocksQueryKey(userId, todayKey());
    if (queryClient.getQueryData(habitsKey) == null) {
      queryClient.prefetchQuery({
        queryKey: habitsKey,
        queryFn: fetchHabits,
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
        const habitsKey = habitsQueryKey(userId);
        const timeBlocksKey = timeBlocksQueryKey(userId, todayKey());
        queryClient.invalidateQueries({ queryKey: todosKey });
        queryClient.invalidateQueries({ queryKey: habitsKey });
        queryClient.invalidateQueries({ queryKey: timeBlocksKey });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [userId, queryClient]);

  return null;
}
