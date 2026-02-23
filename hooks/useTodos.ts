"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addTodoAction,
  toggleTodoAction,
  updateTodoDateAction,
  deleteTodoAction,
} from "@/app/actions/todos";
import type { Todo } from "@/lib/todos";
import { todosQueryKey, fetchTodos } from "@/lib/todos-query";

export type UseTodosOptions = {
  /** Server-fetched todos so the first paint has data (no loading flash). */
  initialData?: Todo[] | undefined;
};

export function useTodos(
  userId: string | undefined | null,
  options: UseTodosOptions = {}
) {
  const { initialData } = options;
  const [mounted, setMounted] = useState(false);
  const queryClient = useQueryClient();
  const queryKey = todosQueryKey(userId);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: todos = [],
    isPending: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: fetchTodos,
    enabled: !!userId,
    initialData: initialData ?? undefined,
    initialDataUpdatedAt: initialData ? Date.now() : 0,
  });

  const error = queryError ? String(queryError) : null;

  const addTodoMutation = useMutation({
    mutationFn: ({ title, date }: { title: string; date: string }) =>
      addTodoAction(title, date),
    onSuccess: (result) => {
      if (result.data) {
        queryClient.setQueryData<Todo[]>(queryKey, (prev) =>
          prev ? [...prev, result.data!] : [result.data!]
        );
      }
    },
  });

  const toggleTodoMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      toggleTodoAction(id, completed),
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<Todo[]>(queryKey);
      queryClient.setQueryData<Todo[]>(queryKey, (old) =>
        old
          ? old.map((t) => (t.id === id ? { ...t, completed } : t))
          : old
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev != null) queryClient.setQueryData(queryKey, ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateTodoDateMutation = useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) =>
      updateTodoDateAction(id, date),
    onMutate: async ({ id, date }) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<Todo[]>(queryKey);
      queryClient.setQueryData<Todo[]>(queryKey, (old) =>
        old ? old.map((t) => (t.id === id ? { ...t, date } : t)) : old
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev != null) queryClient.setQueryData(queryKey, ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteTodoMutation = useMutation({
    mutationFn: (id: string) => deleteTodoAction(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<Todo[]>(queryKey);
      queryClient.setQueryData<Todo[]>(queryKey, (old) =>
        old ? old.filter((t) => t.id !== id) : old
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev != null) queryClient.setQueryData(queryKey, ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const addTodo = useCallback(
    async (title: string, date: string) => {
      if (!userId) return;
      const result = await addTodoMutation.mutateAsync({ title, date });
      if (result.error) throw new Error(result.error);
    },
    [userId, addTodoMutation]
  );

  const toggleTodo = useCallback(
    async (id: string, next?: boolean) => {
      const todo = todos.find((t) => t.id === id);
      if (!todo) return;
      const nextCompleted = next ?? !todo.completed;
      toggleTodoMutation.mutate({ id, completed: nextCompleted });
    },
    [todos, toggleTodoMutation]
  );

  const deleteTodo = useCallback(
    (id: string) => deleteTodoMutation.mutate(id),
    [deleteTodoMutation]
  );

  const updateTodoDate = useCallback(
    (id: string, date: string) =>
      updateTodoDateMutation.mutate({ id, date }),
    [updateTodoDateMutation]
  );

  const getByDate = useCallback(
    (dateKey: string) => todos.filter((t) => t.date === dateKey),
    [todos]
  );

  return {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodoDate,
    getByDate,
    mounted,
    loading,
    error,
    refetch,
  };
}
