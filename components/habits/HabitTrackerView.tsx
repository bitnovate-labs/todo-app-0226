"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Flame,
  GripVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { dateKey } from "@/lib/todos";
import { useHabits } from "@/hooks/useHabits";
import { isHabitCompletedOn, type Habit } from "@/lib/habits";

type HabitTrackerViewProps = { userId: string | undefined | null };
type HabitTab = "daily" | "progress";

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

/** Supabase brand green (#3ecf8e) — shared progress card + heatmap so habits read as one family */
const HABIT_CARD_FRAME =
  "rounded-[1.25rem] border border-[#3ecf8e]/45 bg-gradient-to-b from-[#ecfdf7] to-[#cffae8] px-4 py-4 shadow-card sm:px-5 sm:py-5 dark:border-[#3ecf8e]/35 dark:from-[#132922] dark:to-[#0f1f19]";

const RIPPLE_CELL_EMPTY =
  "bg-white/60 ring-1 ring-inset ring-[#3ecf8e]/25 shadow-[inset_0_0_0_1px_rgba(62,207,142,0.2)] dark:bg-white/[0.12] dark:shadow-[inset_0_0_0_1px_rgba(62,207,142,0.25)] dark:ring-white/15";

type HabitHeatmapStyle = {
  titleClass: string;
  doneCellClass: string;
  todayRingClass: string;
};

const HABIT_HEATMAP_STYLE: HabitHeatmapStyle = {
  titleClass: "text-[#0b4637] dark:text-[#c8f5e6]",
  doneCellClass:
    "bg-[#3ecf8e] shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] dark:bg-[#3ecf8e] dark:shadow-[inset_0_1px_0_rgba(0,0,0,0.12)]",
  todayRingClass:
    "ring-2 ring-[#26a978] ring-offset-1 ring-offset-transparent dark:ring-[#3ecf8e]",
};

/** Cast for React 19 JSX compatibility with @dnd-kit return type */
const SortableList = SortableContext as unknown as React.JSX.ElementType;

function SortableHabitRow({
  habit,
  completed,
  streak,
  toggleBusy,
  onToggle,
  onEdit,
  onDelete,
}: {
  habit: Habit;
  completed: boolean;
  streak: number;
  toggleBusy: boolean;
  onToggle: (id: string) => void;
  onEdit: (h: Habit) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const rowClass = [
    "flex items-center gap-3 rounded-xl border border-border-subtle px-3 py-3 shadow-card",
    isDragging && "z-50 opacity-95 shadow-popover ring-2 ring-primary/15",
    completed
      ? "bg-emerald-50 dark:bg-emerald-950/30"
      : "bg-row-default",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <li ref={setNodeRef} style={style} className={rowClass}>
      <button
        type="button"
        className="touch-none shrink-0 cursor-grab active:cursor-grabbing rounded p-1.5 text-fg-subtle hover:bg-muted hover:text-fg-muted focus:outline-none focus:ring-2 focus:ring-primary-focus focus:ring-offset-0"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" aria-hidden />
      </button>

      <button
        type="button"
        disabled={toggleBusy}
        aria-busy={toggleBusy}
        onClick={() => onToggle(habit.id)}
        className={`flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-full transition-colors active:scale-95 disabled:pointer-events-none disabled:opacity-60 ${
          completed
            ? "bg-emerald-500 text-white hover:bg-emerald-600"
            : "bg-muted text-fg-muted hover:bg-surface"
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
          className={`truncate text-[15px] font-medium ${completed ? "text-emerald-900 dark:text-emerald-200" : "text-fg"}`}
        >
          {habit.title}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-fg-muted">
          <Flame
            className={`h-3.5 w-3.5 ${streak > 0 ? "text-orange-500" : "text-fg-subtle"}`}
          />
          {streak} day streak
        </p>
      </div>

      <button
        type="button"
        onClick={() => onEdit(habit)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-fg-subtle transition-colors hover:bg-muted hover:text-fg"
        aria-label="Edit habit"
      >
        <Pencil className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => onDelete(habit.id)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-fg-subtle transition-colors hover:bg-muted hover:text-red-500"
        aria-label="Delete habit"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}

function HabitMonthCalendar({
  habit,
  month,
  style,
}: {
  habit: Habit;
  month: Date;
  style: HabitHeatmapStyle;
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
            className="flex min-h-[0.875rem] items-center justify-center text-[8px] font-medium leading-none text-[#1a7a5f]/80 dark:text-[#7ddcc4]/85 sm:min-h-[0.9375rem] sm:text-[9px]"
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
                cell.done ? style.doneCellClass : RIPPLE_CELL_EMPTY
              } ${isToday ? `relative z-[1] ring-1 ring-offset-1 ring-offset-transparent ${style.todayRingClass}` : ""}`}
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
    reorderHabits,
    isCompletedToday,
    isTogglePending,
    updateTitlePending,
  } = useHabits(userId);

  const sortedHabits = useMemo(
    () =>
      [...habits].sort(
        (a, b) => (a.position - b.position) || (a.createdAt - b.createdAt)
      ),
    [habits]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const ids = sortedHabits.map((h) => h.id);
      const oldIndex = ids.indexOf(active.id as string);
      const newIndex = ids.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;
      reorderHabits(arrayMove(ids, oldIndex, newIndex));
    },
    [sortedHabits, reorderHabits]
  );

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
    const doneToday = sortedHabits.filter((h) => isCompletedToday(h)).length;
    return { doneToday, total: sortedHabits.length };
  }, [sortedHabits, isCompletedToday]);

  if (loading) {
    return (
      <div className="min-w-0 animate-page-load py-8 text-center text-fg-muted">
        Loading habits…
      </div>
    );
  }

  return (
    <section className="min-w-0 animate-page-load">
      <div className="mb-4 grid grid-cols-2 rounded-xl bg-muted p-1">
        <button
          type="button"
          onClick={() => setTab("daily")}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            tab === "daily"
              ? "bg-surface text-fg shadow-card"
              : "text-fg-muted"
          }`}
        >
          Daily
        </button>
        <button
          type="button"
          onClick={() => setTab("progress")}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            tab === "progress"
              ? "bg-surface text-fg shadow-card"
              : "text-fg-muted"
          }`}
        >
          Progress
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
            {sortedHabits.length === 0 ? (
              <li className="rounded-xl border border-dashed border-border bg-muted/60 py-8 text-center text-sm text-fg-muted">
                No habits yet. Tap the + button to add one.
              </li>
            ) : (
              <DndContext
                id="habits-daily-dnd"
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableList
                  items={sortedHabits.map((h) => h.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {sortedHabits.map((habit) => (
                    <SortableHabitRow
                      key={habit.id}
                      habit={habit}
                      completed={isCompletedToday(habit)}
                      streak={habit.currentStreak}
                      toggleBusy={isTogglePending(habit.id)}
                      onToggle={toggleToday}
                      onEdit={openEdit}
                      onDelete={deleteHabit}
                    />
                  ))}
                </SortableList>
              </DndContext>
            )}
          </ul>
        </>
      ) : tab === "progress" ? (
        <div className="space-y-4 pb-6">
          <div className="grid grid-cols-3 items-center rounded-2xl border border-border bg-surface px-1 py-1 shadow-card backdrop-blur-sm">
            <button
              type="button"
              onClick={() => {
                const next = new Date(calendarMonth);
                next.setMonth(next.getMonth() - 1);
                setCalendarMonth(next);
              }}
              className="justify-self-start rounded-xl p-2 text-fg-subtle transition-colors hover:bg-muted hover:text-fg"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-center text-sm font-medium tracking-tight text-fg">
              {monthTitle(calendarMonth)}
            </p>
            <button
              type="button"
              onClick={() => {
                const next = new Date(calendarMonth);
                next.setMonth(next.getMonth() + 1);
                setCalendarMonth(next);
              }}
              className="justify-self-end rounded-xl p-2 text-fg-subtle transition-colors hover:bg-muted hover:text-fg"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          {sortedHabits.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-muted/60 py-8 text-center text-sm text-fg-muted">
              Add habits on the Daily tab to see progress for each habit here.
            </p>
          ) : (
            <ul className="space-y-2">
              {sortedHabits.map((habit) => (
                  <li key={habit.id}>
                    <div className={HABIT_CARD_FRAME}>
                      <div className="grid grid-cols-5 gap-2 sm:gap-3">
                        <h3
                          className={`col-span-2 min-w-0 self-start text-left text-[15px] font-semibold leading-snug tracking-tight break-words ${HABIT_HEATMAP_STYLE.titleClass}`}
                        >
                          {habit.title}
                        </h3>
                        <div className="col-span-3 min-w-0">
                          <HabitMonthCalendar
                            habit={habit}
                            month={calendarMonth}
                            style={HABIT_HEATMAP_STYLE}
                          />
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      ) : null}

      {editingHabit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay backdrop-blur-[2px] p-4 px-5 sm:px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-habit-title"
        >
          <div
            className="w-full max-w-[430px] shrink-0 rounded-2xl border border-border bg-surface shadow-popover"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 pb-2">
              <h2
                id="edit-habit-title"
                className="text-lg font-semibold text-fg"
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
                  className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-[15px] text-fg placeholder:text-fg-subtle focus:border-border-strong focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary-focus/25"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="flex-1 rounded-xl border border-border py-3 text-sm font-medium text-fg transition-colors hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateTitlePending}
                  className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary-focus focus:ring-offset-2 focus:ring-offset-canvas disabled:opacity-50"
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
