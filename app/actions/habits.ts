'use server';

import { createClient } from '@/lib/supabase/server';
import { todayKey } from '@/lib/todos';
import type { Habit } from '@/lib/habits';
import {
  currentHabitStreak,
  HABIT_NOTES_MAX_LENGTH,
  longestHabitStreak,
  sortHabitDatesAsc,
} from '@/lib/habits';

/** YYYY-MM-DD from the client for calendar-day habits (must match user-local `todayKey()`). */
function isClientDateKey(s: string | undefined): s is string {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

type HabitRow = {
  id: string;
  profile_id: string;
  title: string;
  created_at: string;
  position: number;
  current_streak: number;
  longest_streak: number;
  notes?: string | null;
};

type CheckinRow = {
  habit_id: string;
  date: string;
};

function normalizeHabitNotes(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const t = String(raw).trim();
  return t.length > 0 ? t : null;
}

function buildHabit(row: HabitRow, dates: string[], streakAsOfDate?: string): Habit {
  const completedDates = sortHabitDatesAsc(dates);
  const streakAnchor = isClientDateKey(streakAsOfDate) ? streakAsOfDate : todayKey();
  const currentStreak = currentHabitStreak({ completedDates }, streakAnchor);
  const computedLong = longestHabitStreak(completedDates);
  const storedLong = row.longest_streak ?? 0;
  const longestStreak = Math.max(computedLong, storedLong);
  return {
    id: row.id,
    title: row.title,
    createdAt: new Date(row.created_at).getTime(),
    position: row.position ?? 0,
    notes: normalizeHabitNotes(row.notes),
    completedDates,
    currentStreak,
    longestStreak,
  };
}

function mapRowsToHabits(
  habitRows: HabitRow[],
  checkins: CheckinRow[],
  streakAsOfDate?: string
): Habit[] {
  const byHabit = new Map<string, string[]>();
  for (const c of checkins) {
    const list = byHabit.get(c.habit_id) ?? [];
    list.push(c.date);
    byHabit.set(c.habit_id, list);
  }
  return habitRows.map((row) => buildHabit(row, byHabit.get(row.id) ?? [], streakAsOfDate));
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

export async function getHabitsForUser(
  userId: string,
  /** Client local calendar date (YYYY-MM-DD) for streak "today"; avoids server TZ drift. */
  clientCalendarDate?: string
): Promise<GetHabitsResult> {
  const supabase = await createClient();

  const { data: habitsData, error: habitsError } = await supabase
    .from('habits')
    .select('*')
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

  const streakAsOf = isClientDateKey(clientCalendarDate) ? clientCalendarDate : undefined;
  const mapped = mapRowsToHabits(habits, (checkinsData ?? []) as CheckinRow[], streakAsOf);
  await persistHabitStreaks(supabase, userId, habits, mapped);
  return { data: mapped };
}

export async function getHabitsAction(clientCalendarDate?: string): Promise<GetHabitsResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { data: [], error: authError?.message ?? 'Not authenticated' };
  return getHabitsForUser(user.id, clientCalendarDate);
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
    .select('*')
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
    .select('*')
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

export type UpdateHabitNotesResult = { data?: Habit; error?: string };

export async function updateHabitNotesAction(
  habitId: string,
  notes: string
): Promise<UpdateHabitNotesResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: authError?.message ?? 'Not authenticated' };

  const trimmed = notes.trim();
  if (trimmed.length > HABIT_NOTES_MAX_LENGTH) {
    return { error: `Note must be ${HABIT_NOTES_MAX_LENGTH} characters or less` };
  }
  const stored = trimmed.length > 0 ? trimmed : null;

  const { error: updateError } = await supabase
    .from('habits')
    .update({ notes: stored })
    .eq('id', habitId)
    .eq('profile_id', user.id);
  if (updateError) return { error: updateError.message };

  const { data: habitData, error: habitError } = await supabase
    .from('habits')
    .select('*')
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

export async function toggleHabitTodayAction(
  habitId: string,
  /** Must be the caller's local calendar day (same as UI `todayKey()`). */
  clientDate: string
): Promise<ToggleHabitTodayResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: authError?.message ?? 'Not authenticated' };

  const date = isClientDateKey(clientDate) ? clientDate : todayKey();

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
    if (insError) {
      const msg = insError.message ?? '';
      const dup =
        insError.code === '23505' || msg.includes('duplicate') || msg.includes('unique');
      if (!dup) return { error: insError.message };
    }
  }

  const { data: habitData, error: habitError } = await supabase
    .from('habits')
    .select('*')
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
  const habit = buildHabit(row, dates, date);
  await persistHabitStreaks(supabase, user.id, [row], [habit]);
  return { data: habit };
}
