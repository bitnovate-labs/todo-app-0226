"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { todosQueryKey, fetchTodos } from "@/lib/todos-query";

/**
 * Prefetch todos when the app loads with a logged-in user so navigation
 * to Home / Week / History shows data immediately from cache.
 */
export function TodosPrefetcher({ userId }: { userId: string | null }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    queryClient.prefetchQuery({
      queryKey: todosQueryKey(userId),
      queryFn: fetchTodos,
    });
  }, [userId, queryClient]);

  return null;
}
