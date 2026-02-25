"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTodos } from "@/hooks/useTodos";
import { useWeekStartsOn } from "@/hooks/useWeekStartsOn";
import { weekDatesForWeek, todayKey, addDaysToDateKey } from "@/lib/todos";
import type { Todo } from "@/lib/todos";

type WeekViewProps = { userId: string | undefined | null };

export function WeekView({ userId }: WeekViewProps) {
  const {
    getByDate,
    toggleTodo,
    deleteTodo,
    updateTodoTitle,
    updateTodoDate,
    todos,
    loading,
  } = useTodos(userId);
  const [weekStartsOn] = useWeekStartsOn();
  const days = weekDatesForWeek(weekStartsOn);
  const [layout, setLayout] = useState<"vertical" | "horizontal">("vertical");
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
    const dayTodos = getByDate(dateKey);
    return (
      <section
        key={dateKey}
        ref={isToday ? todayRef : undefined}
        className={`min-h-0 shrink-0 rounded-2xl border p-4 shadow-sm ${
          isToday
            ? "border-blue-500/60 bg-blue-50"
            : "border-gray-300 bg-white/80"
        } ${
          layout === "horizontal"
            ? "min-w-[370px] w-[340px] snap-start"
            : "min-w-[200px]"
        }`}
      >
        <h2
          className={`mb-4 text-base font-bold tracking-tight ${
            isToday ? "text-blue-600" : "text-gray-700"
          }`}
        >
          {isToday ? "Today" : `${dayName} · ${label}`}
        </h2>
        <ul className="space-y-4">
          {dayTodos.length === 0 ? (
            <li
              className={`rounded-xl border border-dashed py-4 text-center text-sm ${
                isToday
                  ? "border-blue-300 bg-blue-50/50 text-gray-600"
                  : "border-gray-200 bg-gray-50/80 text-gray-500"
              }`}
            >
              No todos
            </li>
          ) : (
            dayTodos
              .slice()
              .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
              .map((todo) => (
                <li
                  key={todo.id}
                  onClick={(e) => {
                    if (
                      (e.target as HTMLElement).closest(
                        "button, [role='menu'], input",
                      )
                    )
                      return;
                    toggleTodo(todo.id);
                  }}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-3 shadow-sm transition-shadow ${
                    todo.completed
                      ? "border border-green-400/70 bg-green-50/70"
                      : isToday
                        ? "border border-blue-400/80 bg-white"
                        : "border border-gray-200/80 bg-white"
                  }`}
                >
                  <label className="mr-3 flex shrink-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className={`h-5 w-5 rounded-md border-gray-300 focus:ring-2 focus:ring-offset-0 ${
                        todo.completed
                          ? "accent-green-600"
                          : "accent-blue-600 focus:ring-blue-500"
                      }`}
                    />
                  </label>
                  <span
                    className={`min-w-0 flex-1 text-[15px] font-medium leading-snug ${
                      todo.completed
                        ? "text-green-700 line-through opacity-90"
                        : "text-gray-900"
                    }`}
                  >
                    {todo.title}
                  </span>
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
                      className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                      aria-label="More actions"
                      aria-expanded={menuOpenId === todo.id}
                      aria-haspopup="true"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                      </svg>
                    </button>
                    {menuOpenId === todo.id && (
                      <div
                        className="absolute right-0 top-full z-10 mt-1 min-w-[140px] rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
                        role="menu"
                      >
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => openEdit(todo)}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <svg
                            className="h-4 w-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Edit
                        </button>
                        {!todo.completed &&
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
                                  <svg
                                    className="h-4 w-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 19l-7-7 7-7"
                                    />
                                  </svg>
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
                                  <svg
                                    className="h-4 w-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
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
                                  <svg
                                    className="h-4 w-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
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
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
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
                          value={todo.date}
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

  return (
    <div className="min-w-0 animate-page-load">
      <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-10 shrink-0 bg-white pb-4 -mt-8 pt-6">
        <h1 className="mb-2 text-xl font-semibold tracking-tight text-gray-900">This week</h1>
        <p className="mb-2 text-sm text-gray-500">
          {layout === "vertical"
            ? "Scroll down to see all 7 days"
            : "Scroll sideways to see all 7 days"}
        </p>
        <div
          className="flex w-40 rounded-xl border border-gray-200 bg-gray-100/80 p-1"
          role="tablist"
          aria-label="Week layout"
        >
          <button
            type="button"
            role="tab"
            aria-selected={layout === "vertical"}
            aria-label="Vertical layout — scroll down through days"
            onClick={() => setLayout("vertical")}
            className={`flex flex-1 min-w-0 items-center justify-center gap-1 rounded-lg p-2.5 transition-colors ${
              layout === "vertical"
                ? "bg-blue-100 text-blue-600 shadow-sm ring-1 ring-blue-200/80"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <svg
              className="h-5 w-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg
              className="h-4 w-4 shrink-0 -mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={layout === "horizontal"}
            aria-label="Horizontal layout — scroll sideways through days"
            onClick={() => setLayout("horizontal")}
            className={`flex flex-1 min-w-0 items-center justify-center gap-1 rounded-lg p-2.5 transition-colors ${
              layout === "horizontal"
                ? "bg-blue-100 text-blue-600 shadow-sm ring-1 ring-blue-200/80"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <svg
              className="h-4 w-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <svg
              className="h-5 w-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 4v16M12 4v16M18 4v16"
              />
            </svg>
            <svg
              className="h-4 w-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
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
