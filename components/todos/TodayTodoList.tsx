"use client";

import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
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
import {
  GripVertical,
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
import {
  todayKey,
  formatDateDDMMMFromDate,
  dayNameFromDate,
  addDaysToDateKey,
} from "@/lib/todos";
import type { Todo } from "@/lib/todos";
import { TodoActionsModal } from "@/components/ui/TodoActionsModal";

type TodayTodoListProps = { userId: string | undefined | null };

/** Priority todo styling (urgency: darker amber) */
const PRIORITY_ROW_CLASS = "bg-amber-100/80";

const actionButtonClass =
  "flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 min-h-[44px] touch-manipulation";
const actionButtonDangerClass =
  "flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 min-h-[44px] touch-manipulation";

function SortableTodoItem({
  todo,
  datePickOpen,
  datePickRef,
  onToggle,
  onOpenMenu,
  onCloseMenu,
  onEdit,
  onMovePrev,
  onMoveNext,
  onOpenDatePick,
  onDateChange,
  onDelete,
  onTogglePriority,
  listFontSizeClass,
}: {
  todo: Todo;
  datePickOpen: boolean;
  datePickRef?: React.RefObject<HTMLDivElement | null>;
  onToggle: (id: string) => void;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
  onEdit: () => void;
  onMovePrev: () => void;
  onMoveNext: () => void;
  onOpenDatePick: () => void;
  onDateChange: (dateKey: string) => void;
  onDelete: () => void;
  onTogglePriority: (id: string, priority: boolean) => void;
  listFontSizeClass: string;
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
    "flex items-center gap-1.5 rounded-xl py-2.5 pl-2 pr-1.5 shadow-md",
    isDragging && "z-50 opacity-90 shadow-lg",
    todo.completed
      ? "bg-green-50/80"
      : todo.priority
        ? PRIORITY_ROW_CLASS
        : "bg-white",
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
        <GripVertical className="h-5 w-5" aria-hidden />
      </button>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(todo.id);
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
          className={`min-w-0 flex-1 break-words leading-snug ${listFontSizeClass} ${
            todo.completed ? "text-green-700 line-through" : "text-gray-900"
          }`}
        >
          {todo.title}
        </span>
      </div>
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenMenu();
          }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 touch-manipulation"
          aria-label="More actions"
          aria-haspopup="dialog"
        >
          <MoreVertical className="h-5 w-5" aria-hidden />
        </button>
        {datePickOpen && (
          <div
            ref={datePickRef}
            className="absolute right-0 top-full z-10 mt-1 rounded-xl border border-gray-200 bg-white p-2 shadow-lg"
            role="dialog"
            aria-label="Select date"
          >
            <input
              type="date"
              value={todo.date ?? ""}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2 text-sm text-gray-900 focus:border-gray-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-200"
              autoFocus
            />
          </div>
        )}
      </div>
    </li>
  );
}

export function TodayTodoList({ userId }: TodayTodoListProps) {
  const [listFontSize] = useListFontSize();
  const listFontSizeClass = LIST_FONT_SIZE_CLASSES[listFontSize];
  const {
    getByDate,
    toggleTodo,
    deleteTodo,
    updateTodoTitle,
    updateTodoDate,
    updateTodoPriority,
    reorderTodos,
    todos,
    loading,
  } = useTodos(userId);

  const todayDateLabel = useMemo(() => {
    const [y, m, d] = todayKey().split("-").map(Number);
    return new Date(y, m - 1, d);
  }, []);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [datePickTodoId, setDatePickTodoId] = useState<string | null>(null);
  const datePickRef = useRef<HTMLDivElement>(null);
  const today = todayKey();
  const dayTodos = getByDate(today)
    .slice()
    .sort((a, b) => {
      // Completed at bottom, then priority first, then position, then createdAt
      if (a.completed !== b.completed)
        return (a.completed ? 1 : 0) - (b.completed ? 1 : 0);
      if ((a.priority ?? false) !== (b.priority ?? false))
        return (a.priority ? 0 : 1) - (b.priority ? 0 : 1);
      return (a.position ?? 0) - (b.position ?? 0) || a.createdAt - b.createdAt;
    });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
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
    [dayTodos, today, reorderTodos],
  );

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

  const stickyHeader = (
    <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-10 shrink-0 bg-gray-100 pb-1 -mt-8 pt-6">
      <h1 className="mb-1 text-xl font-semibold tracking-tight text-gray-900">
        Today
      </h1>
      <p className="mb-2 text-sm text-gray-500">
        {dayNameFromDate(todayDateLabel)}, {formatDateDDMMMFromDate(todayDateLabel)}
      </p>
    </div>
  );

  if (loading && todos.length === 0) {
    return (
      <div className="min-w-0 animate-page-load">
        {stickyHeader}
        <ul className="mt-2 space-y-3" aria-busy="true" aria-label="Loading todos">
          {[1, 2, 3, 4].map((i) => (
            <li
              key={i}
              className="h-[52px] rounded-xl bg-gray-200/70 animate-pulse shadow-md"
            />
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="min-w-0 animate-page-load">
      {stickyHeader}
      <ul className="mt-2 space-y-3">
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
                  datePickOpen={datePickTodoId === todo.id}
                  datePickRef={datePickTodoId === todo.id ? datePickRef : undefined}
                  onToggle={toggleTodo}
                  onOpenMenu={() =>
                    setMenuOpenId((id) => (id === todo.id ? null : todo.id))
                  }
                  onCloseMenu={() => {
                    setMenuOpenId(null);
                    setDatePickTodoId(null);
                  }}
                  onEdit={() => openEdit(todo)}
                  onMovePrev={() => {
                    setMenuOpenId(null);
                    if (todo.date) updateTodoDate(todo.id, addDaysToDateKey(todo.date, -1));
                  }}
                  onMoveNext={() => {
                    setMenuOpenId(null);
                    if (todo.date) updateTodoDate(todo.id, addDaysToDateKey(todo.date, 1));
                  }}
                  onOpenDatePick={() => {
                    setMenuOpenId(null);
                    setDatePickTodoId(todo.id);
                  }}
                  onDateChange={(next) => {
                    if (next) {
                      updateTodoDate(todo.id, next);
                      setDatePickTodoId(null);
                    }
                  }}
                  onDelete={() => {
                    setMenuOpenId(null);
                    deleteTodo(todo.id);
                  }}
                  onTogglePriority={(id, priority) => {
                    setMenuOpenId(null);
                    updateTodoPriority(id, priority);
                  }}
                  listFontSizeClass={listFontSizeClass}
                />
              ))}
            </SortableList>
          </DndContext>
        )}
      </ul>

      {/* Actions modal */}
      {(() => {
        const todo = menuOpenId ? dayTodos.find((t) => t.id === menuOpenId) : null;
        if (!todo) return null;
        return (
          <TodoActionsModal
            open={true}
            onClose={() => setMenuOpenId(null)}
            title={todo.title}
          >
            {todo.completed && (
              <button
                type="button"
                className={actionButtonClass}
                onClick={() => {
                  toggleTodo(todo.id);
                  setMenuOpenId(null);
                }}
              >
                <Undo2 className="h-4 w-4 text-gray-400 shrink-0" />
                Mark incomplete
              </button>
            )}
            <button
              type="button"
              className={actionButtonClass}
              onClick={() => {
                updateTodoPriority(todo.id, !todo.priority);
                setMenuOpenId(null);
              }}
            >
              {todo.priority ? (
                <>
                  <Check className="h-4 w-4 text-amber-700 shrink-0" />
                  Not priority
                </>
              ) : (
                <>
                  <ArrowUp className="h-4 w-4 text-gray-400 shrink-0" />
                  Priority
                </>
              )}
            </button>
            <button
              type="button"
              className={actionButtonClass}
              onClick={() => {
                setMenuOpenId(null);
                openEdit(todo);
              }}
            >
              <Pencil className="h-4 w-4 text-gray-400 shrink-0" />
              Edit
            </button>
            {!todo.completed && (
              <>
                <button
                  type="button"
                  className={actionButtonClass}
                  onClick={() => {
                    setMenuOpenId(null);
                    if (todo.date) updateTodoDate(todo.id, addDaysToDateKey(todo.date, -1));
                  }}
                >
                  <ChevronLeft className="h-4 w-4 text-gray-400 shrink-0" />
                  Previous
                </button>
                <button
                  type="button"
                  className={actionButtonClass}
                  onClick={() => {
                    setMenuOpenId(null);
                    if (todo.date) updateTodoDate(todo.id, addDaysToDateKey(todo.date, 1));
                  }}
                >
                  <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                  Next
                </button>
                <button
                  type="button"
                  className={actionButtonClass}
                  onClick={() => {
                    setMenuOpenId(null);
                    setDatePickTodoId(todo.id);
                  }}
                >
                  <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                  Date…
                </button>
              </>
            )}
            <button
              type="button"
              className={actionButtonDangerClass}
              onClick={() => {
                setMenuOpenId(null);
                deleteTodo(todo.id);
              }}
            >
              <Trash2 className="h-4 w-4 shrink-0" />
              Delete
            </button>
          </TodoActionsModal>
        );
      })()}

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
              <h2
                id="edit-todo-title"
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
