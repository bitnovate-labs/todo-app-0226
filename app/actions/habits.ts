'use server';

import { createClient } from '@/lib/supabase/server';
import { todayKey } from '@/lib/todos';
import type { Habit } from '@/lib/habits';
import {
  currentHabitStreak,
  longestHabitStreak,
  sortHabitDatesAsc,
} from '@/lib/habits';

type HabitRow = {
  id: string;
  profile_id: string;
  title: string;
  created_at: string;
  position: number;
  current_streak: number;
  longest_streak: number;
};

type CheckinRow = {
  habit_id: string;
  date: string;
};

function buildHabit(row: HabitRow, dates: string[]): Habit {
  const completedDates = sortHabitDatesAsc(dates);
  const currentStreak = currentHabitStreak({ completedDates });
  const computedLong = longestHabitStreak(completedDates);
  const storedLong = row.longest_streak ?? 0;
  const longestStreak = Math.max(computedLong, storedLong);
  return {
    id: row.id,
    title: row.title,
    createdAt: new Date(row.created_at).getTime(),
    position: row.position ?? 0,
    completedDates,
    currentStreak,
    longestStreak,
  };
}

function mapRowsToHabits(habitRows: HabitRow[], checkins: CheckinRow[]): Habit[] {
  const byHabit = new Map<string, string[]>();
  for (const c of checkins) {
    const list = byHabit.get(c.habit_id) ?? [];
    list.push(c.date);
    byHabit.set(c.habit_id, list);
  }
  return habitRows.map((row) => buildHabit(row, byHabit.get(row.id) ?? []));
}

async function persistHabitStreaks(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  habitRows: HabitRow[],
  habits: Habit[]
) {
  for (let i = 0; i < habits.length; i += 1) {
    const h = habits[i]!;
    const row = habitRows[i]!;
    if (
      h.currentStreak === (row.current_streak ?? 0) &&
      h.longestStreak === (row.longest_streak ?? 0)
    )
      continue;
    await supabase
      .from('habits')
      .update({
        current_streak: h.currentStreak,
        longest_streak: h.longestStreak,
      })
      .eq('id', h.id)
      .eq('profile_id', userId);
  }
}

export type GetHabitsResult = { data?: Habit[]; error?: string };

export async function getHabitsForUser(userId: string): Promise<GetHabitsResult> {
  const supabase = await createClient();

  const { data: habitsData, error: habitsError } = await supabase
    .from('habits')
    .select('id, profile_id, title, created_at, position, current_streak, longest_streak')
    .eq('profile_id', userId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });

  if (habitsError) return { error: habitsError.message, data: [] };
  const habits = (habitsData ?? []) as HabitRow[];

  if (habits.length === 0) return { data: [] };

  const habitIds = habits.map((h) => h.id);
  const { data: checkinsData, error: checkinsError } = await supabase
    .from('habit_checkins')
    .select('habit_id, date')
    .in('habit_id', habitIds)
    .eq('profile_id', userId);

  if (checkinsError) return { error: checkinsError.message, data: [] };

  const mapped = mapRowsToHabits(habits, (checkinsData ?? []) as CheckinRow[]);
  await persistHabitStreaks(supabase, userId, habits, mapped);
  return { data: mapped };
}

export async function getHabitsAction(): Promise<GetHabitsResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { data: [], error: authError?.message ?? 'Not authenticated' };
  return getHabitsForUser(user.id);
}

export type AddHabitResult = { data?: Habit; error?: string };

export async function addHabitAction(title: string): Promise<AddHabitResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: authError?.message ?? 'Not authenticated' };

  const trimmed = title.trim();
  if (!trimmed) return { error: 'Title required' };

  const { data: maxRow } = await supabase
    .from('habits')
    .select('position')
    .eq('profile_id', user.id)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextPosition = ((maxRow as { position?: number } | null)?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from('habits')
    .insert({ profile_id: user.id, title: trimmed, position: nextPosition })
    .select('id, profile_id, title, created_at, position, current_streak, longest_streak')
    .single();

  if (error) return { error: error.message };
  if (!data) return { error: 'No data returned' };

  const row = data as HabitRow;
  return {
    data: buildHabit(row, []),
  };
}

export type DeleteHabitResult = { error?: string };

export async function deleteHabitAction(id: string): Promise<DeleteHabitResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('habits').delete().eq('id', id);
  return error ? { error: error.message } : {};
}

export type UpdateHabitTitleResult = { data?: Habit; error?: string };

export async function updateHabitTitleAction(
  habitId: string,
  title: string
): Promise<UpdateHabitTitleResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: authError?.message ?? 'Not authenticated' };

  const trimmed = title.trim();
  if (!trimmed) return { error: 'Title required' };

  const { error: updateError } = await supabase
    .from('habits')
    .update({ title: trimmed })
    .eq('id', habitId)
    .eq('profile_id', user.id);
  if (updateError) return { error: updateError.message };

  const { data: habitData, error: habitError } = await supabase
    .from('habits')
    .select('id, profile_id, title, created_at, position, current_streak, longest_streak')
    .eq('id', habitId)
    .eq('profile_id', user.id)
    .single();
  if (habitError) return { error: habitError.message };

  const { data: checkinsData, error: checkinsError } = await supabase
    .from('habit_checkins')
    .select('habit_id, date')
    .eq('habit_id', habitId)
    .eq('profile_id', user.id);
  if (checkinsError) return { error: checkinsError.message };

  const row = habitData as HabitRow;
  const dates = ((checkinsData ?? []) as CheckinRow[]).map((c) => c.date);
  const habit = buildHabit(row, dates);
  await persistHabitStreaks(supabase, user.id, [row], [habit]);
  return { data: habit };
}

export type ReorderHabitsResult = { error?: string };

/**
 * Reorder habits. habitIds must be the full ordered list for the user.
 * Sets position to 0, 1, 2, … for each id.
 */
export async function reorderHabitsAction(habitIds: string[]): Promise<ReorderHabitsResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: authError?.message ?? 'Not authenticated' };
  }
  for (let i = 0; i < habitIds.length; i += 1) {
    const { error } = await supabase
      .from('habits')
      .update({ position: i })
      .eq('id', habitIds[i])
      .eq('profile_id', user.id);
    if (error) return { error: error.message };
  }
  return {};
}

export type ToggleHabitTodayResult = { data?: Habit; error?: string };

export async function toggleHabitTodayAction(habitId: string): Promise<ToggleHabitTodayResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: authError?.message ?? 'Not authenticated' };

  const date = todayKey();

  const { data: existing, error: existingError } = await supabase
    .from('habit_checkins')
    .select('id')
    .eq('habit_id', habitId)
    .eq('profile_id', user.id)
    .eq('date', date)
    .maybeSingle();

  if (existingError) return { error: existingError.message };

  if (existing?.id) {
    const { error: delError } = await supabase
      .from('habit_checkins')
      .delete()
      .eq('id', existing.id);
    if (delError) return { error: delError.message };
  } else {
    const { error: insError } = await supabase
      .from('habit_checkins')
      .insert({ habit_id: habitId, profile_id: user.id, date });
    if (insError) return { error: insError.message };
  }

  const { data: habitData, error: habitError } = await supabase
    .from('habits')
    .select('id, profile_id, title, created_at, position, current_streak, longest_streak')
    .eq('id', habitId)
    .eq('profile_id', user.id)
    .single();
  if (habitError) return { error: habitError.message };

  const { data: checkinsData, error: checkinsError } = await supabase
    .from('habit_checkins')
    .select('habit_id, date')
    .eq('habit_id', habitId)
    .eq('profile_id', user.id);
  if (checkinsError) return { error: checkinsError.message };

  const row = habitData as HabitRow;
  const dates = ((checkinsData ?? []) as CheckinRow[]).map((c) => c.date);
  const habit = buildHabit(row, dates);
  await persistHabitStreaks(supabase, user.id, [row], [habit]);
  return { data: habit };
}
