"use client";

import { useTodos } from "@/hooks/useTodos";
import { todayKey, formatDateDDMMMFromDate } from "@/lib/todos";

type TodayTodoListProps = { userId: string | undefined | null };

export function TodayTodoList({ userId }: TodayTodoListProps) {
  const { getByDate, toggleTodo, todos, loading } = useTodos(userId);
  const today = todayKey();
  const dayTodos = getByDate(today);

  if (loading && todos.length === 0) {
    return (
      <div className="animate-page-load py-8 text-center text-gray-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-w-0 animate-page-load">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Today</h1>
      <p className="mb-4 text-sm text-gray-500">
        {formatDateDDMMMFromDate(new Date())}
      </p>
      <ul className="space-y-3">
        {dayTodos.length === 0 ? (
          <li className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-8 text-center text-gray-500">
            No todos for today. Tap + to add one.
          </li>
        ) : (
          dayTodos
            .slice()
            .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
            .map((todo) => (
              <li
                key={todo.id}
                className={`flex items-center gap-3 rounded-xl border py-3 pl-4 pr-3 shadow-sm ${
                  todo.completed
                    ? "border-green-400 bg-green-50/80"
                    : "border-gray-200 bg-white"
                }`}
              >
                <span
                  className={`min-w-0 flex-1 ${
                    todo.completed
                      ? "text-green-700 line-through"
                      : "text-gray-900"
                  }`}
                >
                  {todo.title}
                </span>
                <label className="flex shrink-0 cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className={`h-5 w-5 rounded border-gray-300 focus:ring-2 focus:ring-offset-0 ${
                      todo.completed
                        ? "accent-green-600"
                        : "accent-blue-600 focus:ring-blue-500"
                    }`}
                  />
                </label>
              </li>
            ))
        )}
      </ul>
    </div>
  );
}
