import { getTodosAction } from "@/app/actions/todos";
import type { Todo } from "@/lib/todos";
import { TODOS_QUERY_KEY } from "@/lib/query-client";

export function todosQueryKey(userId: string | null | undefined) {
  return [...TODOS_QUERY_KEY, userId ?? ""] as const;
}

export async function fetchTodos(): Promise<Todo[]> {
  const result = await getTodosAction();
  if (result.error) return [];
  return result.data ?? [];
}
