"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Check,
  MoreVertical,
  Undo2,
  ArrowUp,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Trash2,
} from "lucide-react";
import { useTodos } from "@/hooks/useTodos";
import { useListFontSize, LIST_FONT_SIZE_CLASSES } from "@/hooks/useListFontSize";
import { useWeekStartsOn } from "@/hooks/useWeekStartsOn";
import { useWeekViewLayout } from "@/hooks/useWeekViewLayout";
import {
  weekDatesForWeekWithOffset,
  todayKey,
  addDaysToDateKey,
  formatWeekRangeLabel,
  TODO_ROW_BG_CLASS,
  TODO_ROW_DONE_CLASS,
  TODO_ROW_PRIORITY_CLASS,
} from "@/lib/todos";
import type { Todo } from "@/lib/todos";
import { TodoActionsModal } from "@/components/ui/TodoActionsModal";
import { TodoTitleBlock } from "@/components/todos/TodoTitleBlock";

type WeekViewProps = { userId: string | undefined | null };

export function WeekView({ userId }: WeekViewProps) {
  const [listFontSize] = useListFontSize();
  const listFontSizeClass = LIST_FONT_SIZE_CLASSES[listFontSize];
  const {
    getByDate,
    toggleTodo,
    deleteTodo,
    updateTodoTitle,
    updateTodoDate,
    updateTodoPriority,
    todos,
    loading,
  } = useTodos(userId);
  const [weekStartsOn] = useWeekStartsOn();
  const [layout] = useWeekViewLayout();
  const [weekOffset, setWeekOffset] = useState(0);
  const days = weekDatesForWeekWithOffset(weekStartsOn, weekOffset);
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLElement | null>(null);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [datePickTodoId, setDatePickTodoId] = useState<string | null>(null);
  const datePickRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (datePickTodoId === null) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (datePickRef.current && !datePickRef.current.contains(e.target as Node)) {
        setDatePickTodoId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [datePickTodoId]);

  // Scroll to top on mount and when switching layout so sticky header and days are visible
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [layout]);

  const openEdit = (todo: Todo) => {
    setMenuOpenId(null);
    setEditingTodo(todo);
    setEditTitle(todo.title);
  };

  const closeEdit = useCallback(() => {
    setEditingTodo(null);
    setEditTitle("");
  }, []);

  const handleSaveEdit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingTodo) return;
      const trimmed = editTitle.trim() || "Untitled";
      updateTodoTitle(editingTodo.id, trimmed);
      setEditingTodo(null);
      setEditTitle("");
    },
    [editingTodo, editTitle, updateTodoTitle],
  );

  useEffect(() => {
    if (
      layout === "horizontal" &&
      todayRef.current &&
      horizontalScrollRef.current
    ) {
      const container = horizontalScrollRef.current;
      const todayEl = todayRef.current;
      // Scroll only the horizontal container so we don't move the window (no drop effect)
      const targetScrollLeft = todayEl.offsetLeft;
      container.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
    }
  }, [layout, days]);

  if (loading && todos.length === 0) {
    return (
      <div className="animate-page-load py-8 text-center text-fg-muted">
        Loading…
      </div>
    );
  }

  const today = todayKey();
  const dayBlocks = days.map(({ dateKey, label, dayName }, index) => {
    const isToday = dateKey === today;
    const isPast = dateKey < today;
    const dayTodos = getByDate(dateKey)
      .slice()
      .sort((a, b) => {
        if (a.completed !== b.completed) return (a.completed ? 1 : 0) - (b.completed ? 1 : 0);
        if ((a.priority ?? false) !== (b.priority ?? false))
          return (a.priority ? 0 : 1) - (b.priority ? 0 : 1);
        return (a.position ?? 0) - (b.position ?? 0) || a.createdAt - b.createdAt;
      });
    return (
      <section
        key={dateKey}
        ref={isToday ? todayRef : undefined}
        className={`min-h-0 shrink-0 rounded-2xl p-4 ${
          isToday
            ? "border border-border bg-accent-soft shadow-card"
            : isPast
              ? "border border-border bg-muted/70 shadow-none"
              : "border border-border bg-surface shadow-card"
        } ${
          layout === "horizontal"
            ? "min-w-[370px] w-[340px] snap-start"
            : "min-w-[200px]"
        }`}
      >
        <h2
          className={`mb-4 text-base font-bold tracking-tight ${
            isToday ? "text-accent" : isPast ? "text-fg-subtle" : "text-fg-muted"
          }`}
        >
          {isToday ? "Today" : `${dayName} · ${label}`}
        </h2>
        <ul className="space-y-4">
          {dayTodos.length === 0 ? (
            <li
              className={`rounded-xl border border-dashed py-4 text-center text-sm ${
                isToday
                  ? "border-primary/40 bg-primary/10 text-fg-muted"
                  : isPast
                    ? "border-border bg-muted/50 text-fg-subtle"
                    : "border-border bg-muted/60 text-fg-muted"
              }`}
            >
              No todos
            </li>
          ) : (
            dayTodos.map((todo) => (
                <li
                  key={todo.id}
                  className={`flex items-center gap-1.5 rounded-xl border border-border px-3 py-2.5 shadow-card transition-shadow ${
                    todo.completed
                      ? TODO_ROW_DONE_CLASS
                      : todo.priority
                        ? `${TODO_ROW_PRIORITY_CLASS} border-amber-200/50 dark:border-amber-500/20`
                        : TODO_ROW_BG_CLASS
                  }`}
                >
                  <div
                    className={`flex min-w-0 flex-1 gap-2 ${todo.time ? "items-start" : "items-center"}`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTodo(todo.id);
                      }}
                      className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-full text-fg-subtle transition-colors hover:bg-muted hover:text-fg-muted focus:outline-none focus:ring-2 focus:ring-primary-focus focus:ring-offset-0 touch-manipulation ${todo.time ? "mt-0.5" : ""}`}
                      aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
                    >
                      {todo.completed ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-row-done-icon text-white">
                          <Check className="h-4 w-4" strokeWidth={2.5} />
                        </span>
                      ) : (
                        <span className="h-5 w-5 rounded-full border-2 border-border-strong" />
                      )}
                    </button>
                    <TodoTitleBlock
                      title={todo.title}
                      time={todo.time}
                      completed={todo.completed}
                      listFontSizeClass={listFontSizeClass}
                      titleClassName="font-medium"
                    />
                  </div>
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId((id) =>
                          id === todo.id ? null : todo.id,
                        );
                      }}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-fg-subtle transition-colors hover:bg-muted hover:text-fg-muted"
                      aria-label="More actions"
                      aria-haspopup="dialog"
                    >
                      <MoreVertical className="h-5 w-5" aria-hidden />
                    </button>
                    {datePickTodoId === todo.id && (
                      <div
                        ref={datePickRef}
                        className="absolute right-0 top-full z-10 mt-1 rounded-xl border border-border bg-elevated p-2 shadow-popover"
                        role="dialog"
                        aria-label="Select date"
                      >
                        <input
                          type="date"
                          value={todo.date ?? ""}
                          onChange={(e) => {
                            const next = e.target.value;
                            if (next) {
                              updateTodoDate(todo.id, next);
                              setDatePickTodoId(null);
                            }
                          }}
                          className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-fg focus:border-border-strong focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary-focus/30"
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
                </li>
              ))
          )}
        </ul>
      </section>
    );
  });

  const isCurrentWeek = weekOffset === 0;

  return (
    <div className="min-w-0 animate-page-load -mx-4 -my-6 min-h-screen bg-canvas px-4 py-6">
      <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-10 shrink-0 bg-canvas pb-2 -mt-8 pt-6 backdrop-blur-md backdrop-saturate-150">
        <div className="flex flex-nowrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center justify-start gap-2 text-left">
              <h1 className={`text-lg font-semibold tracking-tight ${weekOffset === 0 ? "text-accent" : "text-fg"}`}>
                {weekOffset === 0 ? "This week" : formatWeekRangeLabel(weekStartsOn, weekOffset)}
              </h1>
            </div>
            <div className="mt-2 flex w-full gap-2" role="group" aria-label="Change week">
              <button
                type="button"
                onClick={() => setWeekOffset((o) => o - 1)}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${isCurrentWeek ? "border border-border bg-muted text-fg-muted hover:bg-surface hover:text-fg" : "border border-border bg-surface text-fg-muted shadow-card hover:bg-muted hover:border-border-strong"}`}
                aria-label="Previous week"
              >
                <span className="inline-flex items-center gap-1.5">
                  <ChevronLeft className="h-4 w-4 shrink-0" />
                  Previous week
                </span>
              </button>
              <button
                type="button"
                onClick={() => setWeekOffset((o) => o + 1)}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${isCurrentWeek ? "border border-border bg-muted text-fg-muted hover:bg-surface hover:text-fg" : "border border-border bg-surface text-fg-muted shadow-card hover:bg-muted hover:border-border-strong"}`}
                aria-label="Next week"
              >
                <span className="inline-flex items-center gap-1.5">
                  Next week
                  <ChevronRight className="h-4 w-4 shrink-0" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {layout === "vertical" ? (
        <div className="flex flex-col gap-6 overflow-y-auto mt-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {dayBlocks}
        </div>
      ) : (
        <div
          ref={horizontalScrollRef}
          className="w-full min-w-0 overflow-x-auto overflow-y-hidden px-4 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex items-start gap-4 mt-4">{dayBlocks}</div>
        </div>
      )}

      {menuOpenId && (() => {
        const todo = todos.find((t) => t.id === menuOpenId);
        if (!todo) return null;
        const dayIndex = todo.date != null ? days.findIndex((d) => d.dateKey === todo.date) : -1;
        const prevDate = dayIndex > 0 ? days[dayIndex - 1].dateKey : todo.date ? addDaysToDateKey(todo.date, -1) : null;
        const nextDate = dayIndex >= 0 && dayIndex < 6 ? days[dayIndex + 1].dateKey : todo.date ? addDaysToDateKey(todo.date, 1) : null;
        const act = "flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-fg hover:bg-muted min-h-[44px] touch-manipulation";
        const actDanger = "flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-danger-muted dark:hover:bg-danger-muted/20 min-h-[44px] touch-manipulation";
        return (
          <TodoActionsModal open={true} onClose={() => setMenuOpenId(null)} title={todo.title}>
            {todo.completed && (
              <button type="button" className={act} onClick={() => { toggleTodo(todo.id); setMenuOpenId(null); }}>
                <Undo2 className="h-4 w-4 text-fg-subtle shrink-0" /> Mark incomplete
              </button>
            )}
            <button type="button" className={act} onClick={() => { updateTodoPriority(todo.id, !todo.priority); setMenuOpenId(null); }}>
              {todo.priority ? <><Check className="h-4 w-4 text-amber-700 shrink-0" /> Not priority</> : <><ArrowUp className="h-4 w-4 text-fg-subtle shrink-0" /> Priority</>}
            </button>
            <button type="button" className={act} onClick={() => { setMenuOpenId(null); openEdit(todo); }}>
              <Pencil className="h-4 w-4 text-fg-subtle shrink-0" /> Edit
            </button>
            {!todo.completed && todo.date != null && prevDate != null && (
              <button type="button" className={act} onClick={() => { setMenuOpenId(null); updateTodoDate(todo.id, prevDate); }}>
                <ChevronLeft className="h-4 w-4 text-fg-subtle shrink-0" /> Previous
              </button>
            )}
            {!todo.completed && todo.date != null && nextDate != null && (
              <button type="button" className={act} onClick={() => { setMenuOpenId(null); updateTodoDate(todo.id, nextDate); }}>
                <ChevronRight className="h-4 w-4 text-fg-subtle shrink-0" /> Next
              </button>
            )}
            {!todo.completed && (
              <button type="button" className={act} onClick={() => { setMenuOpenId(null); setDatePickTodoId(todo.id); }}>
                <Calendar className="h-4 w-4 text-fg-subtle shrink-0" /> Date…
              </button>
            )}
            <button type="button" className={actDanger} onClick={() => { setMenuOpenId(null); deleteTodo(todo.id); }}>
              <Trash2 className="h-4 w-4 shrink-0" /> Delete
            </button>
          </TodoActionsModal>
        );
      })()}

      {editingTodo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay backdrop-blur-[2px] p-4 px-5 sm:px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-todo-title-week"
        >
          <div
            className="w-full max-w-[430px] shrink-0 rounded-2xl border border-border bg-surface shadow-popover"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 pb-2">
              <h2
                id="edit-todo-title-week"
                className="text-lg font-semibold text-fg"
              >
                Edit todo
              </h2>
            </div>
            <form
              onSubmit={handleSaveEdit}
              className="space-y-4 px-5 pb-8 pt-2"
            >
              <div>
                <label htmlFor="edit-todo-input-week" className="sr-only">
                  Title
                </label>
                <input
                  id="edit-todo-input-week"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Todo title"
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
                  className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
                >
                  Save
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
    </div>
  );
}
