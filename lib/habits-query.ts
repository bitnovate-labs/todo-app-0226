import { getHabitsAction } from "@/app/actions/habits";
import type { Habit } from "@/lib/habits";

export const HABITS_QUERY_KEY = ["habits"] as const;

export function habitsQueryKey(userId: string | null | undefined) {
  return [...HABITS_QUERY_KEY, userId ?? ""] as const;
}

export async function fetchHabits(): Promise<Habit[]> {
  const result = await getHabitsAction();
  if (result.error) return [];
  return result.data ?? [];
}
