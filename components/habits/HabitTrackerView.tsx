"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Info,
  MoreVertical,
  Pencil,
  StickyNote,
  Trash2,
} from "lucide-react";
import { dateKey, todayKey } from "@/lib/todos";
import { useHabits } from "@/hooks/useHabits";
import {
  HABIT_NOTES_MAX_LENGTH,
  habitHasNotes,
  isHabitCompletedOn,
  sortHabitDatesAsc,
  type Habit,
} from "@/lib/habits";
import {
  computeHabitDotSegments,
  habitCreatedDayKey,
} from "@/lib/habit-dot-segments";
import { TodoActionsModal } from "@/components/ui/TodoActionsModal";

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

const actionButtonClass =
  "flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-fg hover:bg-muted min-h-[44px] touch-manipulation";
const actionButtonDangerClass =
  "flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-danger-muted dark:hover:bg-danger-muted/30 min-h-[44px] touch-manipulation";

const HABIT_HEATMAP_STYLE: HabitHeatmapStyle = {
  titleClass: "text-[#0b4637] dark:text-[#c8f5e6]",
  doneCellClass:
    "bg-[#3ecf8e] shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] dark:bg-[#3ecf8e] dark:shadow-[inset_0_1px_0_rgba(0,0,0,0.12)]",
  todayRingClass:
    "ring-2 ring-[#26a978] ring-offset-1 ring-offset-transparent dark:ring-[#3ecf8e]",
};

/** Cast for React 19 JSX compatibility with @dnd-kit return type */
const SortableList = SortableContext as unknown as React.JSX.ElementType;

/** Seven “rhythm” dots: first 3 lock after 3 consecutive check-ins; last 4 use the same miss budget (see `computeHabitDotSegments`). */
function HabitStreakBadge({ habit }: { habit: Habit }) {
  const today = todayKey();
  const { filled, segment1Locked } = useMemo(
    () =>
      computeHabitDotSegments(
        sortHabitDatesAsc(habit.completedDates),
        habitCreatedDayKey(habit.createdAt),
        today
      ),
    [habit.completedDates, habit.createdAt, today]
  );

  const filledCount = filled.filter(Boolean).length;
  const streak = habit.currentStreak;
  const label = `${streak} day streak, ${filledCount} of 7 rhythm dots${segment1Locked ? ", first three locked" : ""}`;

  const fillDone =
    "bg-orange-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] dark:bg-orange-400 dark:shadow-[inset_0_1px_0_rgba(0,0,0,0.15)]";
  const fillMiss =
    "border border-border-strong/55 bg-transparent dark:border-white/22";
  const fillDoneLocked =
    "bg-amber-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] dark:bg-amber-500 dark:shadow-[inset_0_1px_0_rgba(0,0,0,0.12)]";

  return (
    <div
      className="mt-1.5 flex w-full min-w-0 items-center gap-2"
      title={label}
      aria-label={label}
    >
      <Flame
        className={`h-3.5 w-3.5 shrink-0 ${streak > 0 ? "text-orange-500 dark:text-orange-400" : "text-fg-subtle/60"}`}
        strokeWidth={2}
        aria-hidden
      />
      <span
        className="grid min-w-0 flex-1 grid-cols-7 items-center justify-items-center"
        aria-hidden
      >
        {filled.map((on, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 shrink-0 rounded-full sm:h-3 sm:w-3 ${
              on ? (i < 3 && segment1Locked ? fillDoneLocked : fillDone) : fillMiss
            }`}
          />
        ))}
      </span>
    </div>
  );
}

function SortableHabitRow({
  habit,
  completed,
  toggleBusy,
  onToggle,
  onOpenMenu,
  onOpenNotes,
}: {
  habit: Habit;
  completed: boolean;
  toggleBusy: boolean;
  onToggle: (id: string) => void;
  onOpenMenu: () => void;
  onOpenNotes: (h: Habit) => void;
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
        className={`flex h-8 w-8 shrink-0 touch-manipulation items-center justify-center rounded-full transition-colors active:scale-95 disabled:pointer-events-none disabled:opacity-60 ${
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
        <Check className="h-4 w-4" />
      </button>

      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenNotes(habit);
          }}
          className={`group flex w-full min-w-0 items-start gap-1.5 rounded-lg py-0.5 text-left -mx-0.5 px-0.5 transition-colors hover:bg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/30 ${
            completed ? "text-emerald-900 dark:text-emerald-200" : "text-fg"
          }`}
          aria-label={
            habitHasNotes(habit)
              ? `Notes: ${habit.title}`
              : `Add or edit notes for ${habit.title}`
          }
        >
          <span
            className={`min-w-0 flex-1 break-words text-[15px] font-medium leading-snug ${completed ? "text-emerald-900 dark:text-emerald-200" : "text-fg"}`}
          >
            {habit.title}
          </span>
          {habitHasNotes(habit) ? (
            <StickyNote
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600/90 dark:text-amber-400/90"
              aria-hidden
            />
          ) : null}
        </button>
        <HabitStreakBadge habit={habit} />
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenMenu();
        }}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-fg-subtle transition-colors hover:bg-muted hover:text-fg-muted touch-manipulation"
        aria-label="More actions"
        aria-haspopup="dialog"
      >
        <MoreVertical className="h-4 w-4" aria-hidden />
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
  const [notesHabit, setNotesHabit] = useState<Habit | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [notesUIMode, setNotesUIMode] = useState<"view" | "edit">("edit");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [dotsHelpOpen, setDotsHelpOpen] = useState(false);
  const dotsHelpRef = useRef<HTMLDivElement>(null);
  const {
    habits,
    loading,
    deleteHabit,
    toggleToday,
    updateHabitTitle,
    updateHabitNotes,
    reorderHabits,
    isCompletedToday,
    isTogglePending,
    updateTitlePending,
    updateNotesPending,
  } = useHabits(userId);

  const sortedHabits = useMemo(
    () =>
      [...habits].sort(
        (a, b) => (a.position - b.position) || (a.createdAt - b.createdAt)
      ),
    [habits]
  );

  useEffect(() => {
    if (tab !== "daily") setDotsHelpOpen(false);
  }, [tab]);

  useEffect(() => {
    if (!dotsHelpOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (
        dotsHelpRef.current &&
        !dotsHelpRef.current.contains(e.target as Node)
      ) {
        setDotsHelpOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [dotsHelpOpen]);

  useEffect(() => {
    if (!dotsHelpOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDotsHelpOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dotsHelpOpen]);

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
    setMenuOpenId(null);
    setNotesHabit(null);
    setNotesDraft("");
    setNotesUIMode("edit");
    setEditingHabit(habit);
    setEditTitle(habit.title);
  }, []);

  const closeEdit = useCallback(() => {
    setEditingHabit(null);
    setEditTitle("");
  }, []);

  const openNotes = useCallback((habit: Habit) => {
    setMenuOpenId(null);
    setEditingHabit(null);
    setEditTitle("");
    setNotesHabit(habit);
    setNotesDraft(habit.notes ?? "");
    setNotesUIMode(habitHasNotes(habit) ? "view" : "edit");
  }, []);

  const closeNotes = useCallback(() => {
    setNotesHabit(null);
    setNotesDraft("");
    setNotesUIMode("edit");
  }, []);

  const handleSaveNotes = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!notesHabit) return;
      await updateHabitNotes(notesHabit.id, notesDraft);
      closeNotes();
    },
    [notesHabit, notesDraft, updateHabitNotes, closeNotes]
  );

  const handleClearNotes = useCallback(async () => {
    if (!notesHabit) return;
    await updateHabitNotes(notesHabit.id, "");
    closeNotes();
  }, [notesHabit, updateHabitNotes, closeNotes]);

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
          <div className="mb-3 flex min-h-[2.25rem] items-center justify-between gap-2">
            <div ref={dotsHelpRef} className="relative shrink-0 self-center">
              <button
                type="button"
                onClick={() => setDotsHelpOpen((o) => !o)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-muted hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/35"
                aria-expanded={dotsHelpOpen}
                aria-controls="habit-dots-help"
                aria-label="How habit streak dots work"
              >
                <Info className="h-5 w-5" strokeWidth={2} aria-hidden />
              </button>
              {dotsHelpOpen ? (
                <div
                  id="habit-dots-help"
                  role="region"
                  aria-label="How habit streak dots work"
                  className="absolute left-0 top-full z-20 mt-1.5 w-[min(calc(100vw-2rem),18rem)] rounded-xl border border-border bg-surface p-3 text-left text-xs leading-snug text-fg shadow-popover"
                >
                  <p className="font-semibold text-fg">Streak dots</p>
                  <ul className="mt-2 list-disc space-y-1.5 pl-4 text-fg-muted">
                    <li>
                      <span className="text-fg">1–3:</span> three check-ins{" "}
                      <strong className="text-fg">in a row</strong> to fill. Up to{" "}
                      <strong className="text-fg">3 missed days</strong> total; a{" "}
                      <strong className="text-fg">4th</strong> clears{" "}
                      <strong className="text-fg">all</strong> dots.
                    </li>
                    <li>
                      <span className="text-fg">4–7:</span> after 1–3 stay on, fill
                      these the same way. Up to{" "}
                      <strong className="text-fg">3 misses</strong>; a{" "}
                      <strong className="text-fg">4th</strong> clears{" "}
                      <strong className="text-fg">only 4–7</strong> (1–3 stay).
                    </li>
                  </ul>
                </div>
              ) : null}
            </div>
            <div className="inline-flex max-w-full shrink-0 items-center rounded-lg border border-blue-200/80 bg-blue-50/90 px-2.5 py-1.5 text-xs text-blue-900 dark:border-blue-500/35 dark:bg-blue-950/50 dark:text-blue-100">
              Completed today:{" "}
              <span className="font-semibold tabular-nums">{stats.doneToday}</span>{" "}
              / <span className="tabular-nums">{stats.total}</span>
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
                      toggleBusy={isTogglePending(habit.id)}
                      onToggle={toggleToday}
                      onOpenMenu={() =>
                        setMenuOpenId((id) => (id === habit.id ? null : habit.id))
                      }
                      onOpenNotes={openNotes}
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
                        <button
                          type="button"
                          onClick={() => openNotes(habit)}
                          className={`col-span-2 min-w-0 self-start text-left ${HABIT_HEATMAP_STYLE.titleClass}`}
                        >
                          <span className="flex items-start gap-1.5">
                            <span className="min-w-0 flex-1 break-words text-[15px] font-semibold leading-snug tracking-tight">
                              {habit.title}
                            </span>
                            {habitHasNotes(habit) ? (
                              <StickyNote
                                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600/90 opacity-90 dark:text-amber-400/90"
                                aria-hidden
                              />
                            ) : null}
                          </span>
                        </button>
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

      {(() => {
        const habit = menuOpenId
          ? sortedHabits.find((h) => h.id === menuOpenId)
          : null;
        if (!habit) return null;
        return (
          <TodoActionsModal
            open
            onClose={() => setMenuOpenId(null)}
            title={habit.title}
          >
            <button
              type="button"
              className={actionButtonClass}
              onClick={() => {
                setMenuOpenId(null);
                openNotes(habit);
              }}
            >
              <StickyNote className="h-4 w-4 shrink-0 text-fg-subtle" />
              Notes
            </button>
            <button
              type="button"
              className={actionButtonClass}
              onClick={() => {
                setMenuOpenId(null);
                openEdit(habit);
              }}
            >
              <Pencil className="h-4 w-4 shrink-0 text-fg-subtle" />
              Edit
            </button>
            <button
              type="button"
              className={actionButtonDangerClass}
              onClick={() => {
                setMenuOpenId(null);
                deleteHabit(habit.id);
              }}
            >
              <Trash2 className="h-4 w-4 shrink-0" />
              Delete
            </button>
          </TodoActionsModal>
        );
      })()}

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

      {notesHabit && (
        <div
          className="fixed inset-0 z-[52] flex items-center justify-center bg-overlay backdrop-blur-[2px] p-4 px-5 sm:px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="habit-notes-title"
        >
          <div
            className="w-full max-w-[430px] shrink-0 rounded-2xl border border-border bg-surface shadow-popover"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 p-5 pb-2">
              <div className="min-w-0 flex-1">
                <h2
                  id="habit-notes-title"
                  className="text-lg font-semibold text-fg"
                >
                  Notes
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-fg-muted">
                  {notesHabit.title}
                </p>
              </div>
              {notesUIMode === "view" ? (
                <button
                  type="button"
                  onClick={() => setNotesUIMode("edit")}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface"
                >
                  <Pencil className="h-4 w-4 text-fg-subtle" aria-hidden />
                  Edit
                </button>
              ) : null}
            </div>

            {notesUIMode === "view" ? (
              <div className="space-y-4 px-5 pb-8 pt-2">
                <div className="min-h-[120px] whitespace-pre-wrap break-words rounded-xl border border-border bg-muted px-4 py-3 text-sm leading-relaxed text-fg">
                  {notesHabit.notes}
                </div>
                <button
                  type="button"
                  onClick={closeNotes}
                  className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary-focus focus:ring-offset-2 focus:ring-offset-canvas"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSaveNotes}
                className="space-y-3 px-5 pb-8 pt-2"
              >
                <div>
                  <label
                    htmlFor="habit-notes-input"
                    className="mb-1 block text-xs font-medium text-fg-muted"
                  >
                    Short note (optional, max {HABIT_NOTES_MAX_LENGTH}{" "}
                    characters)
                  </label>
                  <textarea
                    id="habit-notes-input"
                    value={notesDraft}
                    onChange={(e) =>
                      setNotesDraft(
                        e.target.value.slice(0, HABIT_NOTES_MAX_LENGTH)
                      )
                    }
                    rows={5}
                    placeholder="Why this habit matters, reminders, context…"
                    className="min-h-[120px] w-full resize-y rounded-xl border border-border bg-muted px-4 py-3 text-sm text-fg placeholder:text-fg-subtle focus:border-border-strong focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary-focus/25"
                    autoFocus
                  />
                  <p className="mt-1 text-right text-xs text-fg-muted tabular-nums">
                    {notesDraft.length}/{HABIT_NOTES_MAX_LENGTH}
                  </p>
                </div>
                {(habitHasNotes(notesHabit) || notesDraft.trim().length > 0) ? (
                  <button
                    type="button"
                    onClick={handleClearNotes}
                    disabled={updateNotesPending}
                    className="w-full rounded-xl py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-danger-muted/50 disabled:opacity-50 dark:hover:bg-danger-muted/25"
                  >
                    Remove note
                  </button>
                ) : null}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (habitHasNotes(notesHabit)) {
                        setNotesDraft(notesHabit.notes ?? "");
                        setNotesUIMode("view");
                      } else {
                        closeNotes();
                      }
                    }}
                    className="flex-1 rounded-xl border border-border py-3 text-sm font-medium text-fg transition-colors hover:bg-muted"
                  >
                    {habitHasNotes(notesHabit) ? "Back" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={updateNotesPending}
                    className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary-focus focus:ring-offset-2 focus:ring-offset-canvas disabled:opacity-50"
                  >
                    {updateNotesPending ? "Saving…" : "Save"}
                  </button>
                </div>
              </form>
            )}
          </div>
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 -z-10"
            onClick={closeNotes}
          />
        </div>
      )}
    </section>
  );
}
