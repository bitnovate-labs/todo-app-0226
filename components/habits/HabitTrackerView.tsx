"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Flame,
  Pencil,
  Trash2,
} from "lucide-react";
import { dateKey } from "@/lib/todos";
import { useHabits } from "@/hooks/useHabits";
import { isHabitCompletedOn, type Habit } from "@/lib/habits";

type HabitTrackerViewProps = { userId: string | undefined | null };
type HabitTab = "daily" | "calendar";

function monthTitle(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

const WEEKDAY_LABELS = [
  { short: "S", full: "Sunday" },
  { short: "M", full: "Monday" },
  { short: "T", full: "Tuesday" },
  { short: "W", full: "Wednesday" },
  { short: "T", full: "Thursday" },
  { short: "F", full: "Friday" },
  { short: "S", full: "Saturday" },
] as const;

const HABIT_CARD_FRAME =
  "rounded-[1.25rem] border px-4 py-4 shadow-[0_2px_24px_rgba(15,15,20,0.055)] backdrop-blur-md sm:px-5 sm:py-5";

const RIPPLE_CELL_EMPTY = "bg-white/55";

type HabitGridAccent = {
  cardClass: string;
  titleClass: string;
  doneCellClass: string;
  todayRingClass: string;
};

/** Pastel card shell + matching title / heatmap accents per habit. */
const HABIT_GRID_ACCENTS: HabitGridAccent[] = [
  {
    cardClass:
      "border-violet-200/90 bg-gradient-to-b from-violet-100/90 to-violet-50/55",
    titleClass: "text-violet-900",
    doneCellClass:
      "bg-violet-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]",
    todayRingClass: "ring-violet-400/85",
  },
  {
    cardClass: "border-sky-200/90 bg-gradient-to-b from-sky-100/90 to-sky-50/55",
    titleClass: "text-sky-900",
    doneCellClass: "bg-sky-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]",
    todayRingClass: "ring-sky-400/85",
  },
  {
    cardClass: "border-teal-200/90 bg-gradient-to-b from-teal-100/90 to-teal-50/55",
    titleClass: "text-teal-900",
    doneCellClass: "bg-teal-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]",
    todayRingClass: "ring-teal-400/85",
  },
  {
    cardClass:
      "border-amber-200/90 bg-gradient-to-b from-amber-100/90 to-amber-50/55",
    titleClass: "text-amber-950",
    doneCellClass: "bg-amber-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]",
    todayRingClass: "ring-amber-400/85",
  },
  {
    cardClass: "border-rose-200/90 bg-gradient-to-b from-rose-100/90 to-rose-50/55",
    titleClass: "text-rose-900",
    doneCellClass: "bg-rose-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]",
    todayRingClass: "ring-rose-400/85",
  },
  {
    cardClass:
      "border-indigo-200/90 bg-gradient-to-b from-indigo-100/90 to-indigo-50/55",
    titleClass: "text-indigo-900",
    doneCellClass: "bg-indigo-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]",
    todayRingClass: "ring-indigo-400/85",
  },
];

function HabitMonthCalendar({
  habit,
  month,
  accent,
}: {
  habit: Habit;
  month: Date;
  accent: HabitGridAccent;
}) {
  const todayKey = useMemo(() => dateKey(new Date()), []);

  const cells = useMemo(() => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const dayCount = end.getDate();
    const leading = start.getDay(); // Sunday-first

    const values: { date: string; done: boolean; inMonth: boolean }[] = [];
    for (let i = 0; i < leading; i += 1) {
      values.push({
        date: `pad-${habit.id}-${i}`,
        done: false,
        inMonth: false,
      });
    }

    for (let day = 1; day <= dayCount; day += 1) {
      const d = new Date(month.getFullYear(), month.getMonth(), day);
      const key = dateKey(d);
      const done = isHabitCompletedOn(habit, key);
      values.push({ date: key, done, inMonth: true });
    }

    while (values.length % 7 !== 0) {
      values.push({
        date: `pad-end-${habit.id}-${values.length}`,
        done: false,
        inMonth: false,
      });
    }
    return values;
  }, [habit, month]);

  const dayCellClass =
    "aspect-square w-full min-w-0 rounded-[2px] sm:rounded-[3px]";

  const heatmapGridClass =
    "grid w-full min-w-0 grid-cols-7 gap-1 sm:gap-1.5";

  return (
    <div className="w-full min-w-0">
      <div className={`mb-1 ${heatmapGridClass}`}>
        {WEEKDAY_LABELS.map((d) => (
          <span
            key={d.full}
            title={d.full}
            className="flex min-h-[0.875rem] items-center justify-center text-[8px] font-medium leading-none text-zinc-400 sm:min-h-[0.9375rem] sm:text-[9px]"
          >
            {d.short}
          </span>
        ))}
      </div>
      <div className={heatmapGridClass}>
        {cells.map((cell) => {
          if (!cell.inMonth) {
            return (
              <div key={cell.date} className={dayCellClass} aria-hidden />
            );
          }
          const isToday = cell.date === todayKey;
          return (
            <div
              key={cell.date}
              className={`${dayCellClass} transition-[transform,box-shadow] duration-200 ${
                cell.done ? accent.doneCellClass : RIPPLE_CELL_EMPTY
              } ${isToday ? `relative z-[1] ring-1 ring-offset-1 ring-offset-white ${accent.todayRingClass}` : ""}`}
              title={`${cell.date}: ${cell.done ? "Completed" : "No check-in"} · ${habit.title}`}
            />
          );
        })}
      </div>
    </div>
  );
}

export function HabitTrackerView({ userId }: HabitTrackerViewProps) {
  const [tab, setTab] = useState<HabitTab>("daily");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const {
    habits,
    loading,
    deleteHabit,
    toggleToday,
    updateHabitTitle,
    isCompletedToday,
    updateTitlePending,
  } = useHabits(userId);

  const openEdit = useCallback((habit: Habit) => {
    setEditingHabit(habit);
    setEditTitle(habit.title);
  }, []);

  const closeEdit = useCallback(() => {
    setEditingHabit(null);
    setEditTitle("");
  }, []);

  const handleSaveEdit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingHabit) return;
      const trimmed = editTitle.trim() || "Untitled";
      await updateHabitTitle(editingHabit.id, trimmed);
      closeEdit();
    },
    [editingHabit, editTitle, updateHabitTitle, closeEdit],
  );

  const stats = useMemo(() => {
    const doneToday = habits.filter((h) => isCompletedToday(h)).length;
    return { doneToday, total: habits.length };
  }, [habits, isCompletedToday]);

  if (loading) {
    return (
      <div className="min-w-0 animate-page-load py-8 text-center text-gray-500">
        Loading habits…
      </div>
    );
  }

  return (
    <section className="min-w-0 animate-page-load">
      <div className="mb-4 grid grid-cols-2 rounded-xl bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setTab("daily")}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            tab === "daily"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600"
          }`}
        >
          Daily
        </button>
        <button
          type="button"
          onClick={() => setTab("calendar")}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            tab === "calendar"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600"
          }`}
        >
          Calendar
        </button>
      </div>

      {tab === "daily" ? (
        <>
          <div className="mb-3 flex justify-end">
            <div className="inline-flex max-w-full items-center rounded-lg border border-blue-200/80 bg-blue-50/90 px-2.5 py-1.5 text-xs text-blue-900">
              Completed today:{" "}
              <span className="font-semibold tabular-nums">{stats.doneToday}</span> /{" "}
              <span className="tabular-nums">{stats.total}</span>
            </div>
          </div>

          <ul className="space-y-3 pb-6">
            {habits.length === 0 ? (
              <li className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 py-8 text-center text-sm text-gray-500">
                No habits yet. Tap the + button to add one.
              </li>
            ) : (
              habits.map((habit) => {
                const completed = isCompletedToday(habit);
                const streak = habit.currentStreak;
                return (
                  <li
                    key={habit.id}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 shadow-md ${
                      completed ? "bg-emerald-50" : "bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleToday(habit.id)}
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                        completed
                          ? "bg-emerald-500 text-white hover:bg-emerald-600"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                      aria-label={
                        completed
                          ? "Mark habit incomplete for today"
                          : "Mark habit complete for today"
                      }
                    >
                      <Check className="h-5 w-5" />
                    </button>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-[15px] font-medium ${completed ? "text-emerald-900" : "text-gray-900"}`}
                      >
                        {habit.title}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                        <Flame
                          className={`h-3.5 w-3.5 ${streak > 0 ? "text-orange-500" : "text-gray-400"}`}
                        />
                        {streak} day streak
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => openEdit(habit)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                      aria-label="Edit habit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteHabit(habit.id)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500"
                      aria-label="Delete habit"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </>
      ) : (
        <div className="space-y-4 pb-6">
          <div className="grid grid-cols-3 items-center rounded-2xl border border-zinc-200/60 bg-white/90 px-1 py-1 shadow-[0_1px_12px_rgba(15,15,20,0.04)] backdrop-blur-sm">
            <button
              type="button"
              onClick={() => {
                const next = new Date(calendarMonth);
                next.setMonth(next.getMonth() - 1);
                setCalendarMonth(next);
              }}
              className="justify-self-start rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-center text-sm font-medium tracking-tight text-gray-900">
              {monthTitle(calendarMonth)}
            </p>
            <button
              type="button"
              onClick={() => {
                const next = new Date(calendarMonth);
                next.setMonth(next.getMonth() + 1);
                setCalendarMonth(next);
              }}
              className="justify-self-end rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          {habits.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 py-8 text-center text-sm text-gray-500">
              Add habits on the Daily tab to see a calendar for each one.
            </p>
          ) : (
            <ul className="space-y-2">
              {habits.map((habit, index) => {
                const accent =
                  HABIT_GRID_ACCENTS[index % HABIT_GRID_ACCENTS.length];
                return (
                  <li key={habit.id}>
                    <div className={`${HABIT_CARD_FRAME} ${accent.cardClass}`}>
                      <div className="grid grid-cols-5 gap-2 sm:gap-3">
                        <h3
                          className={`col-span-2 min-w-0 self-start text-left text-[15px] font-semibold leading-snug tracking-tight break-words ${accent.titleClass}`}
                        >
                          {habit.title}
                        </h3>
                        <div className="col-span-3 min-w-0">
                          <HabitMonthCalendar
                            habit={habit}
                            month={calendarMonth}
                            accent={accent}
                          />
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {editingHabit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-4 px-5 sm:px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-habit-title"
        >
          <div
            className="w-full max-w-[430px] shrink-0 rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 pb-2">
              <h2
                id="edit-habit-title"
                className="text-lg font-semibold text-gray-900"
              >
                Edit habit
              </h2>
            </div>
            <form
              onSubmit={handleSaveEdit}
              className="space-y-4 px-5 pb-8 pt-2"
            >
              <div>
                <label htmlFor="edit-habit-input" className="sr-only">
                  Habit name
                </label>
                <input
                  id="edit-habit-input"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Habit name"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 text-[15px] text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateTitlePending}
                  className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {updateTitlePending ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 -z-10"
            onClick={closeEdit}
          />
        </div>
      )}
    </section>
  );
}
