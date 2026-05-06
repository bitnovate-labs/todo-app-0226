import { addDaysToDateKey, todayKey } from "@/lib/todos";

export type Habit = {
  id: string;
  title: string;
  createdAt: number;
  completedDates: string[];
  /** Consecutive days with a check-in ending today (also stored on `habits.current_streak`). */
  currentStreak: number;
  /** Best consecutive-day run ever (also stored on `habits.longest_streak`). */
  longestStreak: number;
};

export function sortHabitDatesAsc(dates: string[]): string[] {
  return [...dates].sort();
}

export function isHabitCompletedOn(habit: Habit, date: string): boolean {
  return habit.completedDates.includes(date);
}

export function currentHabitStreak(habit: Pick<Habit, "completedDates">): number {
  let streak = 0;
  let day = todayKey();
  while (habit.completedDates.includes(day)) {
    streak += 1;
    day = addDaysToDateKey(day, -1);
  }
  return streak;
}

/** Longest run of consecutive calendar days with a check-in. */
export function longestHabitStreak(completedDates: string[]): number {
  const sorted = sortHabitDatesAsc(completedDates);
  if (sorted.length === 0) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = sorted[i - 1]!;
    const cur = sorted[i]!;
    if (cur === prev) continue;
    if (addDaysToDateKey(prev, 1) === cur) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 1;
    }
  }
  return best;
}

export function lastNDates(n: number): string[] {
  const dates: string[] = [];
  let day = todayKey();
  for (let i = 0; i < n; i += 1) {
    dates.push(day);
    day = addDaysToDateKey(day, -1);
  }
  return dates.reverse();
}
