"use client";

import { useMemo, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { makeQueryClient } from "@/lib/query-client";
import { todosQueryKey } from "@/lib/todos-query";
import { timeBlocksQueryKey } from "@/lib/time-blocks-query";
import { buildPersistOptions } from "@/lib/query-persistence";
import type { Todo } from "@/lib/todos";
import type { TimeBlock } from "@/lib/time-blocks";

type QueryProviderProps = {
  children: React.ReactNode;
  /** Server-fetched todos (optional; rare — persistence restores from localStorage). */
  initialTodos?: Todo[] | null;
  /** Server-fetched time blocks for today (optional). */
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

  const persistOptions = useMemo(
    () => (userId ? buildPersistOptions(userId) : null),
    [userId]
  );

  if (userId && persistOptions) {
    return (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={persistOptions}
      >
        {children}
      </PersistQueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
