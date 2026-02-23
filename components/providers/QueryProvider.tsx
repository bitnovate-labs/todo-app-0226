"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/query-client";
import { todosQueryKey } from "@/lib/todos-query";
import type { Todo } from "@/lib/todos";

type QueryProviderProps = {
  children: React.ReactNode;
  /** Server-fetched todos so first paint + navigations use cache (no loading). */
  initialTodos?: Todo[] | null;
  userId?: string | null;
};

export function QueryProvider({
  children,
  initialTodos,
  userId,
}: QueryProviderProps) {
  const [queryClient] = useState(() => {
    const client = makeQueryClient();
    if (userId && initialTodos) {
      client.setQueryData(todosQueryKey(userId), initialTodos);
    }
    return client;
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
