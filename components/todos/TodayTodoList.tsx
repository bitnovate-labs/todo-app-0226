"use client";

import { useTodos } from "@/hooks/useTodos";
import { todayKey, formatDateDDMMMFromDate } from "@/lib/todos";
import type { Todo } from "@/lib/todos";

type TodayTodoListProps = {
  userId: string | undefined | null;
  initialTodos?: Todo[];
};

export function TodayTodoList({ userId, initialTodos }: TodayTodoListProps) {
  const { getByDate, toggleTodo, todos, loading } = useTodos(userId, {
    initialData: initialTodos,
  });
  const today = todayKey();
  const dayTodos = getByDate(today);

  if (loading && todos.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Today</h1>
      <p className="mb-4 text-sm text-gray-500">
        {formatDateDDMMMFromDate(new Date())}
      </p>
      <ul className="space-y-1">
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
                    ? "border-green-200 bg-green-50/80"
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
                <label className="flex shrink-0 items-center">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </label>
              </li>
            ))
        )}
      </ul>
    </div>
  );
}
