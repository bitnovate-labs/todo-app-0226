"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addHabitAction,
  deleteHabitAction,
  reorderHabitsAction,
  toggleHabitTodayAction,
  updateHabitTitleAction,
} from "@/app/actions/habits";
import type { Habit } from "@/lib/habits";
import {
  currentHabitStreak,
  longestHabitStreak,
  sortHabitDatesAsc,
} from "@/lib/habits";
import { todayKey } from "@/lib/todos";
import { habitsQueryKey, fetchHabits } from "@/lib/habits-query";

export function useHabits(userId: string | undefined | null) {
  const queryClient = useQueryClient();
  const queryKey = habitsQueryKey(userId);

  const {
    data: habits = [],
    isPending: loading,
    error: queryError,
  } = useQuery({
    queryKey,
    queryFn: fetchHabits,
    enabled: !!userId,
  });

  const addMutation = useMutation({
    mutationFn: (title: string) => addHabitAction(title),
    onMutate: async (title) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<Habit[]>(queryKey);
      const trimmed = title.trim();
      if (!trimmed) return { prev };

      const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      const maxPos = prev?.length ? Math.max(...prev.map((h) => h.position)) : -1;
      const optimistic: Habit = {
        id: optimisticId,
        title: trimmed,
        createdAt: Date.now(),
        position: maxPos + 1,
        completedDates: [],
        currentStreak: 0,
        longestStreak: 0,
      };
      queryClient.setQueryData<Habit[]>(queryKey, (old) =>
        old ? [...old, optimistic] : [optimistic]
      );
      return { prev, optimisticId };
    },
    onError: (_err, _title, ctx) => {
      if (ctx?.prev !== undefined) queryClient.setQueryData(queryKey, ctx.prev);
    },
    onSuccess: (result, _title, ctx) => {
      if (!result.data) return;
      const optimisticId = ctx?.optimisticId;
      queryClient.setQueryData<Habit[]>(queryKey, (old) => {
        if (!old) return [result.data!];
        if (optimisticId) {
          return old.map((h) => (h.id === optimisticId ? result.data! : h));
        }
        return [...old, result.data!];
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteHabitAction(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<Habit[]>(queryKey);
      queryClient.setQueryData<Habit[]>(queryKey, (old) => (old ? old.filter((h) => h.id !== id) : old));
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(queryKey, ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => toggleHabitTodayAction(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<Habit[]>(queryKey);
      const day = todayKey();
      queryClient.setQueryData<Habit[]>(queryKey, (old) => {
        if (!old) return old;
        return old.map((h) => {
          if (h.id !== id) return h;
          const had = h.completedDates.includes(day);
          const completedDates = sortHabitDatesAsc(
            had ? h.completedDates.filter((d) => d !== day) : [...h.completedDates, day]
          );
          const currentStreak = currentHabitStreak({ completedDates });
          const computedLong = longestHabitStreak(completedDates);
          const longestStreak = Math.max(computedLong, h.longestStreak);
          return { ...h, completedDates, currentStreak, longestStreak };
        });
      });
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev !== undefined) queryClient.setQueryData(queryKey, ctx.prev);
    },
    onSuccess: (result) => {
      if (!result.data) return;
      queryClient.setQueryData<Habit[]>(queryKey, (old) =>
        old ? old.map((h) => (h.id === result.data!.id ? result.data! : h)) : [result.data!]
      );
    },
  });

  const updateTitleMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      updateHabitTitleAction(id, title),
    onSuccess: (result) => {
      if (!result.data) return;
      queryClient.setQueryData<Habit[]>(queryKey, (old) =>
        old ? old.map((h) => (h.id === result.data!.id ? result.data! : h)) : [result.data!]
      );
    },
  });

  const reorderHabitsMutation = useMutation({
    mutationFn: (habitIds: string[]) => reorderHabitsAction(habitIds),
    onMutate: async (habitIds) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<Habit[]>(queryKey);
      queryClient.setQueryData<Habit[]>(queryKey, (old) => {
        if (!old) return old;
        const updated = old.map((h) => {
          const idx = habitIds.indexOf(h.id);
          if (idx === -1) return h;
          return { ...h, position: idx };
        });
        return updated.sort(
          (a, b) => (a.position - b.position) || (a.createdAt - b.createdAt)
        );
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev != null) queryClient.setQueryData(queryKey, ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const addHabit = useCallback(
    async (title: string) => {
      const result = await addMutation.mutateAsync(title.trim());
      if (result.error) throw new Error(result.error);
    },
    [addMutation]
  );

  const deleteHabit = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  const toggleToday = useCallback(
    async (id: string) => {
      const result = await toggleMutation.mutateAsync(id);
      if (result.error) throw new Error(result.error);
    },
    [toggleMutation]
  );

  const updateHabitTitle = useCallback(
    async (id: string, title: string) => {
      const result = await updateTitleMutation.mutateAsync({ id, title });
      if (result.error) throw new Error(result.error);
    },
    [updateTitleMutation]
  );

  const reorderHabits = useCallback(
    (habitIds: string[]) => reorderHabitsMutation.mutate(habitIds),
    [reorderHabitsMutation]
  );

  const isCompletedToday = useCallback(
    (habit: Habit) => habit.completedDates.includes(todayKey()),
    []
  );

  return {
    habits,
    loading,
    error: queryError ? String(queryError) : null,
    addHabit,
    deleteHabit,
    toggleToday,
    updateHabitTitle,
    reorderHabits,
    isCompletedToday,
    addPending: addMutation.isPending,
    deletePending: deleteMutation.isPending,
    togglePending: toggleMutation.isPending,
    updateTitlePending: updateTitleMutation.isPending,
  };
}
