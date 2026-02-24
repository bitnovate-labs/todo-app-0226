"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/query-client";
import { todosQueryKey } from "@/lib/todos-query";
import { timeBlocksQueryKey } from "@/lib/time-blocks-query";
import type { Todo } from "@/lib/todos";
import type { TimeBlock } from "@/lib/time-blocks";

type QueryProviderProps = {
  children: React.ReactNode;
  /** Server-fetched todos so first paint + navigations use cache (no loading). */
  initialTodos?: Todo[] | null;
  /** Server-fetched time blocks for today so Time tab has data immediately. */
  initialTimeBlocks?: TimeBlock[] | null;
  /** Date for which initialTimeBlocks applies (e.g. todayKey()). */
  initialTimeBlocksDate?: string;
  userId?: string | null;
};

export function QueryProvider({
  children,
  initialTodos,
  initialTimeBlocks,
  initialTimeBlocksDate,
  userId,
}: QueryProviderProps) {
  const [queryClient] = useState(() => {
    const client = makeQueryClient();
    if (userId && initialTodos) {
      client.setQueryData(todosQueryKey(userId), initialTodos);
    }
    if (userId && initialTimeBlocks && initialTimeBlocksDate) {
      client.setQueryData(
        timeBlocksQueryKey(userId, initialTimeBlocksDate),
        initialTimeBlocks
      );
    }
    return client;
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
