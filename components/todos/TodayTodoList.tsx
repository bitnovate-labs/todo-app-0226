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
  TODO_ROW_BG_CLASS,
  TODO_ROW_DONE_CLASS,
  TODO_ROW_PRIORITY_CLASS,
} from "@/lib/todos";
import type { Todo } from "@/lib/todos";
import { TodoActionsModal } from "@/components/ui/TodoActionsModal";

type TodayTodoListProps = { userId: string | undefined | null };

const actionButtonClass =
  "flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-fg hover:bg-muted min-h-[44px] touch-manipulation";
const actionButtonDangerClass =
  "flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-danger-muted dark:hover:bg-danger-muted/30 min-h-[44px] touch-manipulation";

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
    "flex items-center gap-1.5 rounded-xl border border-border py-2.5 pl-2 pr-1.5 shadow-card",
    isDragging && "z-50 opacity-95 shadow-popover ring-2 ring-primary/20",
    todo.completed
      ? TODO_ROW_DONE_CLASS
      : todo.priority
        ? `${TODO_ROW_PRIORITY_CLASS} border-amber-200/50 dark:border-amber-500/20`
        : TODO_ROW_BG_CLASS,
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
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(todo.id);
          }}
          className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full text-fg-subtle transition-colors hover:bg-muted hover:text-fg-muted focus:outline-none focus:ring-2 focus:ring-primary-focus focus:ring-offset-0 touch-manipulation"
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
        <span
          className={`min-w-0 flex-1 break-words leading-snug ${listFontSizeClass} ${
            todo.completed ? "text-row-done-text line-through" : "text-fg"
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
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-fg-subtle transition-colors hover:bg-muted hover:text-fg-muted touch-manipulation"
          aria-label="More actions"
          aria-haspopup="dialog"
        >
          <MoreVertical className="h-5 w-5" aria-hidden />
        </button>
        {datePickOpen && (
          <div
            ref={datePickRef}
            className="absolute right-0 top-full z-10 mt-1 rounded-xl border border-border bg-elevated p-2 shadow-popover"
            role="dialog"
            aria-label="Select date"
          >
            <input
              type="date"
              value={todo.date ?? ""}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-fg focus:border-border-strong focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary-focus/30"
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
    <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-10 shrink-0 bg-canvas pb-1 -mt-8 pt-6 backdrop-blur-md backdrop-saturate-150">
      <h1 className="mb-1 text-xl font-semibold tracking-tight text-fg">
        Today
      </h1>
      <p className="mb-2 text-sm text-fg-muted">
        {dayNameFromDate(todayDateLabel)}, {formatDateDDMMMFromDate(todayDateLabel)}
      </p>
    </div>
  );

  if (loading && todos.length === 0) {
    return (
      <div className="min-w-0 animate-page-load bg-canvas">
        {stickyHeader}
        <ul className="mt-2 space-y-3" aria-busy="true" aria-label="Loading todos">
          {[1, 2, 3, 4].map((i) => (
            <li
              key={i}
              className={`h-[52px] rounded-xl border border-border-subtle ${TODO_ROW_BG_CLASS} animate-pulse shadow-card`}
            />
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="min-w-0 animate-page-load bg-canvas">
      {stickyHeader}
      <ul className="mt-2 space-y-3">
        {dayTodos.length === 0 ? (
          <li className="rounded-xl border border-dashed border-border bg-muted/60 py-8 text-center text-fg-muted">
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
                <Undo2 className="h-4 w-4 text-fg-subtle shrink-0" />
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
                  <ArrowUp className="h-4 w-4 text-fg-subtle shrink-0" />
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
              <Pencil className="h-4 w-4 text-fg-subtle shrink-0" />
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
                  <ChevronLeft className="h-4 w-4 text-fg-subtle shrink-0" />
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
                  <ChevronRight className="h-4 w-4 text-fg-subtle shrink-0" />
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
                  <Calendar className="h-4 w-4 text-fg-subtle shrink-0" />
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay backdrop-blur-[2px] p-4 px-5 sm:px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-todo-title"
        >
          <div
            className="w-full max-w-[430px] shrink-0 rounded-2xl border border-border bg-surface shadow-popover"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 pb-2">
              <h2
                id="edit-todo-title"
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
                <label htmlFor="edit-todo-input" className="sr-only">
                  Title
                </label>
                <input
                  id="edit-todo-input"
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
                  className="flex-1 rounded-xl bg-fg py-3 text-sm font-medium text-surface transition-colors hover:opacity-90"
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
