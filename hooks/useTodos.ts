"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getTodosAction,
  addTodoAction,
  toggleTodoAction,
  updateTodoDateAction,
  deleteTodoAction,
} from "@/app/actions/todos";
import type { Todo } from "@/lib/todos";

export function useTodos(userId: string | undefined | null) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchTodos = useCallback(async () => {
    if (!userId) {
      setTodos([]);
      return;
    }
    setLoading(true);
    setError(null);
    const result = await getTodosAction();
    setLoading(false);
    if (result.error) {
      setError(result.error);
      setTodos([]);
      return;
    }
    setTodos(result.data ?? []);
  }, [userId]);

  useEffect(() => {
    if (!mounted || !userId) {
      setTodos([]);
      setLoading(!mounted && !!userId);
      return;
    }
    fetchTodos();
  }, [userId, mounted, fetchTodos]);

  const addTodo = useCallback(
    async (title: string, date: string) => {
      if (!userId) return;
      const result = await addTodoAction(title, date);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.data) setTodos((prev) => [...prev, result.data!]);
    },
    [userId]
  );

  const toggleTodo = useCallback(async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const next = !todo.completed;
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: next } : t))
    );
    const result = await toggleTodoAction(id, next);
    if (result.error) {
      setError(result.error);
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !next } : t))
      );
    }
  }, [todos]);

  const deleteTodo = useCallback(async (id: string) => {
    const previous = todos.find((t) => t.id === id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
    const result = await deleteTodoAction(id);
    if (result.error) {
      setError(result.error);
      if (previous) setTodos((prev) => [...prev, previous]);
    }
  }, [todos]);

  const updateTodoDate = useCallback(async (id: string, date: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const prevDate = todo.date;
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, date } : t))
    );
    const result = await updateTodoDateAction(id, date);
    if (result.error) {
      setError(result.error);
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, date: prevDate } : t))
      );
    }
  }, [todos]);

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
    refetch: fetchTodos,
  };
}
