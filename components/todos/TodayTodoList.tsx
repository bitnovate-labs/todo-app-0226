"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
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

/** Cast for React 19 JSX compatibility with @dnd-kit return type */
const SortableList = SortableContext as unknown as React.JSX.ElementType;
import { CSS } from "@dnd-kit/utilities";
import { useTodos } from "@/hooks/useTodos";
import { todayKey, formatDateDDMMMFromDate, dayNameFromDate } from "@/lib/todos";
import type { Todo } from "@/lib/todos";

type TodayTodoListProps = { userId: string | undefined | null };

/** Priority todo styling (urgency: darker amber) */
const PRIORITY_ROW_CLASS =
  "border-amber-400/90 bg-amber-100/80";

function SortableTodoItem({
  todo,
  menuRef,
  menuOpen,
  onToggle,
  onOpenMenu,
  onEdit,
  onDelete,
  onTogglePriority,
}: {
  todo: Todo;
  menuRef: React.RefObject<HTMLDivElement | null> | undefined;
  menuOpen: boolean;
  onToggle: (id: string) => void;
  onOpenMenu: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePriority: (id: string, priority: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const rowClass = [
    "flex items-center gap-2 rounded-xl border py-3 pl-2 pr-2 shadow-sm",
    isDragging && "z-50 opacity-90 shadow-md",
    todo.completed
      ? "border-green-400 bg-green-50/80"
      : todo.priority
        ? PRIORITY_ROW_CLASS
        : "border-gray-200 bg-white",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <li ref={setNodeRef} style={style} className={rowClass}>
      <button
        type="button"
        className="touch-none shrink-0 cursor-grab active:cursor-grabbing rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M8 6a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0zm6-12a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </button>
      <div
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("button, [role='menu']")) return;
          onToggle(todo.id);
        }}
      >
        <span
          className={`min-w-0 flex-1 ${
            todo.completed ? "text-green-700 line-through" : "text-gray-900"
          }`}
        >
          {todo.title}
        </span>
      </div>
      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenMenu();
          }}
          className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="More actions"
          aria-expanded={menuOpen}
          aria-haspopup="true"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
        {menuOpen && (
          <div
            className="absolute right-0 top-full z-10 mt-1 min-w-[140px] rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
            role="menu"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => onTogglePriority(todo.id, !todo.priority)}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              {todo.priority ? (
                <>
                  <svg className="h-4 w-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Not priority
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  Priority
                </>
              )}
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={onEdit}
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
              onClick={onDelete}
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
  );
}

export function TodayTodoList({ userId }: TodayTodoListProps) {
  const { getByDate, toggleTodo, deleteTodo, updateTodoTitle, updateTodoPriority, reorderTodos, todos, loading, mounted } =
    useTodos(userId);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const today = todayKey();
  const dayTodos = getByDate(today)
    .slice()
    .sort((a, b) => {
      // Completed at bottom, then priority first, then position, then createdAt
      if (a.completed !== b.completed) return (a.completed ? 1 : 0) - (b.completed ? 1 : 0);
      if ((a.priority ?? false) !== (b.priority ?? false))
        return (a.priority ? 0 : 1) - (b.priority ? 0 : 1);
      return (a.position ?? 0) - (b.position ?? 0) || a.createdAt - b.createdAt;
    });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const ids = dayTodos.map((t) => t.id);
      const oldIndex = ids.indexOf(active.id as string);
      const newIndex = ids.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;
      const newOrder = arrayMove(ids, oldIndex, newIndex);
      reorderTodos(today, newOrder);
    },
    [dayTodos, today, reorderTodos]
  );

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

  // Always show placeholder until client mount so server and client first paint match
  // (server may have prefetched todos and render date/list; client has mounted=false first).
  if (!mounted) {
    return (
      <div className="min-w-0 animate-page-load">
        <h1 className="mb-2 text-xl font-semibold tracking-tight text-gray-900">Today</h1>
        <p className="mb-4 text-sm text-gray-500">—</p>
        <div className="py-8 text-center text-gray-500">Loading…</div>
      </div>
    );
  }

  if (loading && todos.length === 0) {
    return (
      <div className="min-w-0 animate-page-load">
        <h1 className="mb-2 text-xl font-semibold tracking-tight text-gray-900">Today</h1>
        <p className="mb-4 text-sm text-gray-500">
          {dayNameFromDate(new Date())}, {formatDateDDMMMFromDate(new Date())}
        </p>
        <div className="py-8 text-center text-gray-500">Loading…</div>
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
          <DndContext
            id="today-todos-dnd"
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableList
              items={dayTodos.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {dayTodos.map((todo) => (
                <SortableTodoItem
                  key={todo.id}
                  todo={todo}
                  menuRef={menuOpenId === todo.id ? menuRef : undefined}
                  menuOpen={menuOpenId === todo.id}
                  onToggle={toggleTodo}
                  onOpenMenu={() => setMenuOpenId((id) => (id === todo.id ? null : todo.id))}
                  onEdit={() => openEdit(todo)}
                  onDelete={() => {
                    setMenuOpenId(null);
                    deleteTodo(todo.id);
                  }}
                  onTogglePriority={(id, priority) => {
                    setMenuOpenId(null);
                    updateTodoPriority(id, priority);
                  }}
                />
              ))}
            </SortableList>
          </DndContext>
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
