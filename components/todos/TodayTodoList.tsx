"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTodos } from "@/hooks/useTodos";
import { todayKey, formatDateDDMMMFromDate, dayNameFromDate } from "@/lib/todos";
import type { Todo } from "@/lib/todos";

type TodayTodoListProps = { userId: string | undefined | null };

export function TodayTodoList({ userId }: TodayTodoListProps) {
  const { getByDate, toggleTodo, deleteTodo, updateTodoTitle, todos, loading } = useTodos(userId);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const today = todayKey();
  const dayTodos = getByDate(today);

  useEffect(() => {
    if (menuOpenId === null) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpenId]);

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
    [editingTodo, editTitle, updateTodoTitle]
  );

  if (loading && todos.length === 0) {
    return (
      <div className="animate-page-load py-8 text-center text-gray-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-w-0 animate-page-load">
      <h1 className="mb-2 text-xl font-semibold tracking-tight text-gray-900">Today</h1>
      <p className="mb-4 text-sm text-gray-500">
        {dayNameFromDate(new Date())}, {formatDateDDMMMFromDate(new Date())}
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
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest("button, [role='menu'], input")) return;
                  toggleTodo(todo.id);
                }}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border py-3 pl-3 pr-2 shadow-sm ${
                  todo.completed
                    ? "border-green-400 bg-green-50/80"
                    : "border-gray-200 bg-white"
                }`}
              >
                <label className="mr-3 flex shrink-0 cursor-pointer items-center">
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
                <span
                  className={`min-w-0 flex-1 ${
                    todo.completed
                      ? "text-green-700 line-through"
                      : "text-gray-900"
                  }`}
                >
                  {todo.title}
                </span>
                <div className="relative shrink-0" ref={menuOpenId === todo.id ? menuRef : undefined}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId((id) => (id === todo.id ? null : todo.id));
                    }}
                    className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    aria-label="More actions"
                    aria-expanded={menuOpenId === todo.id}
                    aria-haspopup="true"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
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
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setMenuOpenId(null);
                          deleteTodo(todo.id);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))
        )}
      </ul>

      {/* Edit todo sheet */}
      {editingTodo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-4 px-5 sm:px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-todo-title"
        >
          <div
            className="w-full max-w-[430px] shrink-0 rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 pb-2">
              <h2 id="edit-todo-title" className="text-lg font-semibold text-gray-900">
                Edit todo
              </h2>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4 px-5 pb-8 pt-2">
              <div>
                <label htmlFor="edit-todo-input" className="sr-only">
                  Title
                </label>
                <input
                  id="edit-todo-input"
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
