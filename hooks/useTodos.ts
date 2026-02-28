"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addTodoAction,
  toggleTodoAction,
  updateTodoDateAction,
  updateTodoTitleAction,
  deleteTodoAction,
  reorderTodosAction,
  updateTodoPriorityAction,
} from "@/app/actions/todos";
import type { Todo } from "@/lib/todos";
import { todosQueryKey, fetchTodos } from "@/lib/todos-query";

export function useTodos(userId: string | undefined | null) {
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
  } = useQuery({
    queryKey,
    queryFn: fetchTodos,
    enabled: !!userId,
  });

  const error = queryError ? String(queryError) : null;

  const addTodoMutation = useMutation({
    mutationFn: ({ title, date, priority }: { title: string; date: string; priority?: boolean }) =>
      addTodoAction(title, date, priority ?? false),
    retry: 2,
    onSuccess: (result) => {
      if (result.data) {
        queryClient.setQueryData<Todo[]>(queryKey, (prev) =>
          prev ? [...prev, result.data!] : [result.data!]
        );
      }
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const toggleTodoMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      toggleTodoAction(id, completed),
    retry: 2,
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
      queryClient.invalidateQueries({ queryKey });
    },
    onSuccess: (_data, { id, completed }) => {
      queryClient.setQueryData<Todo[]>(queryKey, (old) =>
        old
          ? old.map((t) => (t.id === id ? { ...t, completed } : t)) : old
      );
    },
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

  const updateTodoTitleMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      updateTodoTitleAction(id, title),
    onMutate: async ({ id, title }) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<Todo[]>(queryKey);
      queryClient.setQueryData<Todo[]>(queryKey, (old) =>
        old ? old.map((t) => (t.id === id ? { ...t, title } : t)) : old
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

  const reorderTodosMutation = useMutation({
    mutationFn: ({ date, todoIds }: { date: string; todoIds: string[] }) =>
      reorderTodosAction(date, todoIds),
    onMutate: async ({ date, todoIds }) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<Todo[]>(queryKey);
      queryClient.setQueryData<Todo[]>(queryKey, (old) => {
        if (!old) return old;
        const updated = old.map((t) => {
          const idx = todoIds.indexOf(t.id);
          if (idx === -1) return t;
          return { ...t, position: idx };
        });
        return updated.sort(
          (a, b) =>
            a.date.localeCompare(b.date) ||
            (a.position - b.position) ||
            a.createdAt - b.createdAt
        );
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev != null) queryClient.setQueryData(queryKey, ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const addTodo = useCallback(
    async (title: string, date: string, priority?: boolean) => {
      if (!userId) return;
      const result = await addTodoMutation.mutateAsync({
        title,
        date,
        priority: priority ?? false,
      });
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

  const updateTodoTitle = useCallback(
    (id: string, title: string) =>
      updateTodoTitleMutation.mutate({ id, title }),
    [updateTodoTitleMutation]
  );

  const reorderTodos = useCallback(
    (date: string, todoIds: string[]) =>
      reorderTodosMutation.mutate({ date, todoIds }),
    [reorderTodosMutation]
  );

  const updateTodoPriorityMutation = useMutation({
    mutationFn: ({ id, priority }: { id: string; priority: boolean }) =>
      updateTodoPriorityAction(id, priority),
    onMutate: async ({ id, priority }) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<Todo[]>(queryKey);
      queryClient.setQueryData<Todo[]>(queryKey, (old) =>
        old ? old.map((t) => (t.id === id ? { ...t, priority } : t)) : old
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev != null) queryClient.setQueryData(queryKey, ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateTodoPriority = useCallback(
    (id: string, priority: boolean) =>
      updateTodoPriorityMutation.mutate({ id, priority }),
    [updateTodoPriorityMutation]
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
    updateTodoTitle,
    updateTodoPriority,
    reorderTodos,
    getByDate,
    mounted,
    loading,
    error,
  };
}
