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
import { weekDatesForWeekWithOffset, todayKey, addDaysToDateKey, formatWeekRangeLabel } from "@/lib/todos";
import type { Todo } from "@/lib/todos";

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
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (menuOpenId === null && datePickTodoId === null) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
        setDatePickTodoId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpenId, datePickTodoId]);

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
      <div className="animate-page-load py-8 text-center text-gray-500">
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
            ? "border border-gray-200 bg-primary/10 shadow-md"
            : isPast
              ? "border border-gray-200 bg-gray-50/70 shadow-none"
              : "border border-gray-300 bg-white/80 shadow-sm"
        } ${
          layout === "horizontal"
            ? "min-w-[370px] w-[340px] snap-start"
            : "min-w-[200px]"
        }`}
      >
        <h2
          className={`mb-4 text-base font-bold tracking-tight ${
            isToday ? "text-primary" : isPast ? "text-gray-400" : "text-gray-700"
          }`}
        >
          {isToday ? "Today" : `${dayName} · ${label}`}
        </h2>
        <ul className="space-y-4">
          {dayTodos.length === 0 ? (
            <li
              className={`rounded-xl border border-dashed py-4 text-center text-sm ${
                isToday
                  ? "border-primary/40 bg-primary/5 text-gray-600"
                  : isPast
                    ? "border-gray-200 bg-gray-100/60 text-gray-400"
                    : "border-gray-200 bg-gray-50/80 text-gray-500"
              }`}
            >
              No todos
            </li>
          ) : (
            dayTodos.map((todo) => (
                <li
                  key={todo.id}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2.5 transition-shadow ${
                    todo.completed
                      ? "border border-green-400/70 bg-green-50/70"
                      : todo.priority
                        ? "border border-amber-400/90 bg-amber-100/80 ring-1 ring-amber-400/50"
                        : isToday
                          ? "border border-gray-200/80 bg-white shadow-sm ring-1 ring-gray-300"
                          : isPast
                            ? "border border-gray-200 bg-gray-100/80 ring-1 ring-gray-300"
                            : "border border-gray-200/80 bg-white shadow-sm ring-1 ring-gray-300"
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTodo(todo.id);
                      }}
                      className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 touch-manipulation"
                      aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
                    >
                      {todo.completed ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                          <Check className="h-4 w-4" strokeWidth={2.5} />
                        </span>
                      ) : (
                        <span className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                    </button>
                    <span
                      className={`min-w-0 flex-1 break-words font-medium leading-snug ${listFontSizeClass} ${
                        todo.completed
                          ? "text-green-700 line-through opacity-90"
                          : "text-gray-900"
                      }`}
                    >
                      {todo.title}
                    </span>
                  </div>
                  <div
                    className="relative shrink-0"
                    ref={
                      menuOpenId === todo.id || datePickTodoId === todo.id
                        ? menuRef
                        : undefined
                    }
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId((id) =>
                          id === todo.id ? null : todo.id,
                        );
                      }}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                      aria-label="More actions"
                      aria-expanded={menuOpenId === todo.id}
                      aria-haspopup="true"
                    >
                      <MoreVertical className="h-5 w-5" aria-hidden />
                    </button>
                    {menuOpenId === todo.id && (
                      <div
                        className="absolute right-0 top-full z-10 mt-1 min-w-[140px] rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
                        role="menu"
                      >
                        {todo.completed && (
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setMenuOpenId(null);
                              toggleTodo(todo.id);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Undo2 className="h-4 w-4 text-gray-400" />
                            Mark incomplete
                          </button>
                        )}
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setMenuOpenId(null);
                            updateTodoPriority(todo.id, !todo.priority);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          {todo.priority ? (
                            <>
                              <Check className="h-4 w-4 text-amber-700" />
                              Not priority
                            </>
                          ) : (
                            <>
                              <ArrowUp className="h-4 w-4 text-gray-400" />
                              Priority
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => openEdit(todo)}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Pencil className="h-4 w-4 text-gray-400" />
                          Edit
                        </button>
                        {!todo.completed &&
                          todo.date != null &&
                          (() => {
                            const dayIndex = days.findIndex(
                              (d) => d.dateKey === todo.date,
                            );
                            const prevDate =
                              dayIndex > 0
                                ? days[dayIndex - 1].dateKey
                                : addDaysToDateKey(todo.date, -1);
                            const nextDate =
                              dayIndex >= 0 && dayIndex < 6
                                ? days[dayIndex + 1].dateKey
                                : addDaysToDateKey(todo.date, 1);
                            return (
                              <>
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => {
                                    setMenuOpenId(null);
                                    updateTodoDate(todo.id, prevDate);
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <ChevronLeft className="h-4 w-4 text-gray-400" />
                                  Previous
                                </button>
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => {
                                    setMenuOpenId(null);
                                    updateTodoDate(todo.id, nextDate);
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <ChevronRight className="h-4 w-4 text-gray-400" />
                                  Next
                                </button>
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => {
                                    setMenuOpenId(null);
                                    setDatePickTodoId(todo.id);
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  Date…
                                </button>
                              </>
                            );
                          })()}
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setMenuOpenId(null);
                            deleteTodo(todo.id);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    )}
                    {datePickTodoId === todo.id && (
                      <div
                        className="absolute right-0 top-full z-10 mt-1 rounded-xl border border-gray-200 bg-white p-2 shadow-lg"
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
                          className="w-full rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2 text-sm text-gray-900 focus:border-gray-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-200"
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
    <div className={`min-w-0 animate-page-load ${isCurrentWeek ? "" : "-mx-4 -my-6 min-h-screen bg-gray-100 px-4 py-6"}`}>
      <div className={`sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-10 shrink-0 pb-2 -mt-8 pt-6 ${isCurrentWeek ? "bg-white" : "bg-gray-100"}`}>
        <div className="flex flex-nowrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center justify-start gap-2 text-left">
              <h1 className={`text-lg font-semibold tracking-tight ${weekOffset === 0 ? "text-primary" : "text-gray-900"}`}>
                {weekOffset === 0 ? "This week" : formatWeekRangeLabel(weekStartsOn, weekOffset)}
              </h1>
            </div>
            <div className="mt-2 flex w-full gap-2" role="group" aria-label="Change week">
              <button
                type="button"
                onClick={() => setWeekOffset((o) => o - 1)}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${isCurrentWeek ? "border border-gray-200 bg-gray-100/80 text-gray-600 hover:bg-gray-200/80 hover:text-gray-900" : "border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400"}`}
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
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${isCurrentWeek ? "border border-gray-200 bg-gray-100/80 text-gray-600 hover:bg-gray-200/80 hover:text-gray-900" : "border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400"}`}
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

      {editingTodo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-4 px-5 sm:px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-todo-title-week"
        >
          <div
            className="w-full max-w-[430px] shrink-0 rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 pb-2">
              <h2
                id="edit-todo-title-week"
                className="text-lg font-semibold text-gray-900"
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
                  className="flex-1 rounded-xl bg-gray-900 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
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
