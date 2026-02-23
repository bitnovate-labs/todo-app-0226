"use client";

import { useState, useMemo } from "react";
import { useTodos } from "@/hooks/useTodos";
import { useWeekStartsOn } from "@/hooks/useWeekStartsOn";
import type { Todo } from "@/lib/todos";
import {
  currentWeekDateKeys,
  monthDateKeys,
  monthLabel,
  todayKey,
  dateKey,
} from "@/lib/todos";

type HistoryViewProps = { userId: string | undefined | null };

type ReAddModalProps = {
  todo: Todo;
  onClose: () => void;
  onReAdd: (todoId: string, date: string) => void;
};

function ReAddModal({ todo, onClose, onReAdd }: ReAddModalProps) {
  const [useToday, setUseToday] = useState(true);
  const [selectedDate, setSelectedDate] = useState(todayKey());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const date = useToday ? todayKey() : selectedDate;
    onReAdd(todo.id, date);
    onClose();
  };

  const todayStr = todayKey();
  const maxDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 365);
    return dateKey(d);
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div
        className="w-full max-w-[430px] rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900">Re-add todo</h3>
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
            {todo.title}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Schedule for
            </span>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
                <input
                  type="radio"
                  name="readd-when"
                  checked={useToday}
                  onChange={() => setUseToday(true)}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-900">Today</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
                <input
                  type="radio"
                  name="readd-when"
                  checked={!useToday}
                  onChange={() => setUseToday(false)}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-900">Select a date</span>
              </label>
              {!useToday && (
                <div className="pl-7">
                  <input
                    type="date"
                    value={selectedDate}
                    min={todayStr}
                    max={maxDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-300 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-blue-600 py-3 font-medium text-white hover:bg-blue-700"
            >
              Re-add
            </button>
          </div>
        </form>
      </div>
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
}

function TodoHistoryItem({
  todo,
  onReAdd,
  onUndoComplete,
}: {
  todo: Todo;
  onReAdd: (todo: Todo) => void;
  onUndoComplete: (todoId: string) => void;
}) {
  const isIncomplete = !todo.completed;
  return (
    <li
      className={`flex items-center gap-3 rounded-lg border py-2.5 pl-3 pr-2 ${
        isIncomplete
          ? "cursor-pointer border-blue-200 bg-blue-50/80 hover:bg-blue-100/80"
          : "cursor-pointer border-green-200 bg-green-50/80 hover:bg-green-100/80"
      }`}
      onClick={() =>
        isIncomplete ? onReAdd(todo) : onUndoComplete(todo.id)
      }
      role="button"
    >
      <span
        className={`min-w-0 flex-1 text-sm ${
          todo.completed ? "text-green-700 line-through" : "text-gray-900"
        }`}
      >
        {todo.title}
      </span>
      {isIncomplete ? (
        <span className="shrink-0 text-xs text-blue-600">Tap to re-add</span>
      ) : (
        <span className="shrink-0 text-xs text-green-600">Tap to undo</span>
      )}
    </li>
  );
}

export function HistoryView({ userId }: HistoryViewProps) {
  const { todos, updateTodoDate, toggleTodo, mounted } = useTodos(userId);
  const [tab, setTab] = useState<"week" | "month">("week");
  const [monthCursor, setMonthCursor] = useState(() => new Date());
  const [reAddTodo, setReAddTodo] = useState<Todo | null>(null);
  const [weekStartsOn] = useWeekStartsOn();

  const weekKeys = useMemo(
    () => currentWeekDateKeys(weekStartsOn),
    [weekStartsOn],
  );
  const weekTodos = useMemo(
    () => todos.filter((t) => weekKeys.includes(t.date)),
    [todos, weekKeys],
  );
  const weekCompleted = useMemo(
    () =>
      weekTodos
        .filter((t) => t.completed)
        .sort((a, b) => b.createdAt - a.createdAt),
    [weekTodos],
  );
  const weekIncomplete = useMemo(
    () =>
      weekTodos
        .filter((t) => !t.completed)
        .sort(
          (a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt,
        ),
    [weekTodos],
  );

  const monthKeys = useMemo(() => monthDateKeys(monthCursor), [monthCursor]);
  const monthTodos = useMemo(
    () => todos.filter((t) => monthKeys.includes(t.date)),
    [todos, monthKeys],
  );
  const monthCompleted = useMemo(
    () =>
      monthTodos
        .filter((t) => t.completed)
        .sort((a, b) => b.createdAt - a.createdAt),
    [monthTodos],
  );
  const monthIncomplete = useMemo(
    () =>
      monthTodos
        .filter((t) => !t.completed)
        .sort(
          (a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt,
        ),
    [monthTodos],
  );

  const goPrevMonth = () => {
    setMonthCursor((d) => {
      const next = new Date(d);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  };
  const goNextMonth = () => {
    setMonthCursor((d) => {
      const next = new Date(d);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  };
  const now = new Date();
  const canGoNextMonth = (() => {
    const limit = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return monthCursor.getTime() < limit.getTime();
  })();

  if (!mounted) {
    return <div className="py-8 text-center text-gray-500">Loading…</div>;
  }

  return (
    <div className="min-w-0">
      <h1 className="mb-4 text-2xl font-bold text-gray-900">History</h1>

      {/* Tabs */}
      <div className="mb-4 flex gap-2 rounded-xl bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setTab("week")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium ${
            tab === "week" ? "bg-white text-gray-900 shadow" : "text-gray-600"
          }`}
        >
          Week
        </button>
        <button
          type="button"
          onClick={() => setTab("month")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium ${
            tab === "month" ? "bg-white text-gray-900 shadow" : "text-gray-600"
          }`}
        >
          Month
        </button>
      </div>

      {tab === "week" && (
        <div className="space-y-6">
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Incomplete this week
            </h2>
            <ul className="space-y-2">
              {weekIncomplete.length === 0 ? (
                <li className="rounded-lg border border-dashed border-gray-200 py-4 text-center text-sm text-gray-400">
                  No incomplete todos this week
                </li>
              ) : (
                weekIncomplete.map((todo) => (
                  <TodoHistoryItem
                    key={todo.id}
                    todo={todo}
                    onReAdd={setReAddTodo}
                    onUndoComplete={toggleTodo}
                  />
                ))
              )}
            </ul>
          </section>
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Completed this week
            </h2>
            <ul className="space-y-2">
              {weekCompleted.length === 0 ? (
                <li className="rounded-lg border border-dashed border-gray-200 py-4 text-center text-sm text-gray-400">
                  No completed todos this week
                </li>
              ) : (
                weekCompleted.map((todo) => (
                  <TodoHistoryItem
                    key={todo.id}
                    todo={todo}
                    onReAdd={setReAddTodo}
                    onUndoComplete={toggleTodo}
                  />
                ))
              )}
            </ul>
          </section>
        </div>
      )}

      {tab === "month" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2">
            <button
              type="button"
              onClick={goPrevMonth}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-200"
              aria-label="Previous month"
            >
              <svg
                className="h-5 w-5"
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
            </button>
            <span className="font-medium text-gray-900">
              {monthLabel(monthCursor)}
            </span>
            <button
              type="button"
              onClick={goNextMonth}
              disabled={!canGoNextMonth}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Next month"
            >
              <svg
                className="h-5 w-5"
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
            </button>
          </div>
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Incomplete in {monthLabel(monthCursor)}
            </h2>
            <ul className="space-y-2">
              {monthIncomplete.length === 0 ? (
                <li className="rounded-lg border border-dashed border-gray-200 py-4 text-center text-sm text-gray-400">
                  No incomplete todos this month
                </li>
              ) : (
                monthIncomplete.map((todo) => (
                  <TodoHistoryItem
                    key={todo.id}
                    todo={todo}
                    onReAdd={setReAddTodo}
                    onUndoComplete={toggleTodo}
                  />
                ))
              )}
            </ul>
          </section>
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Completed in {monthLabel(monthCursor)}
            </h2>
            <ul className="space-y-2">
              {monthCompleted.length === 0 ? (
                <li className="rounded-lg border border-dashed border-gray-200 py-4 text-center text-sm text-gray-400">
                  No completed todos this month
                </li>
              ) : (
                monthCompleted.map((todo) => (
                  <TodoHistoryItem
                    key={todo.id}
                    todo={todo}
                    onReAdd={setReAddTodo}
                    onUndoComplete={toggleTodo}
                  />
                ))
              )}
            </ul>
          </section>
        </div>
      )}

      {reAddTodo && (
        <ReAddModal
          todo={reAddTodo}
          onClose={() => setReAddTodo(null)}
          onReAdd={(id, date) => {
            updateTodoDate(id, date);
            setReAddTodo(null);
          }}
        />
      )}
    </div>
  );
}
