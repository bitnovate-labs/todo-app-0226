"use client";

import { useState, useRef, useEffect } from "react";
import { useTodos } from "@/hooks/useTodos";
import { useAddDrawer } from "@/components/layout/AddDrawerContext";
import { useWeekStartsOn } from "@/hooks/useWeekStartsOn";
import {
  todayKey,
  dayNameFromDate,
  getMonthCalendarGrid,
  monthLabel,
  addDaysToDateKey,
  type Todo,
} from "@/lib/todos";

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_MONDAY_FIRST = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MENU_ESTIMATED_HEIGHT = 220;

type MonthViewProps = { userId: string | undefined | null };

export function MonthView({ userId }: MonthViewProps) {
  const addDrawer = useAddDrawer();
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
  const today = todayKey();
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(1);
    return d;
  });
  const [selectedDateKey, setSelectedDateKey] = useState(today);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [menuOpenUp, setMenuOpenUp] = useState(false);
  const [datePickTodoId, setDatePickTodoId] = useState<string | null>(null);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const grid = getMonthCalendarGrid(viewMonth, weekStartsOn);
  const weekdays = weekStartsOn === "monday" ? WEEKDAY_MONDAY_FIRST : WEEKDAY_SHORT;

  const selectedTodos = getByDate(selectedDateKey)
    .slice()
    .sort((a, b) => {
      if (a.completed !== b.completed) return (a.completed ? 1 : 0) - (b.completed ? 1 : 0);
      if ((a.priority ?? false) !== (b.priority ?? false))
        return (a.priority ? 0 : 1) - (b.priority ? 0 : 1);
      return (a.position ?? 0) - (b.position ?? 0) || a.createdAt - b.createdAt;
    });

  const [y, m, day] = selectedDateKey.split("-").map(Number);
  const selectedDateObj = new Date(y, m - 1, day);
  const selectedDayName = dayNameFromDate(selectedDateObj);
  const selectedLabel =
    selectedDayName +
    ", " +
    selectedDateObj.getDate() +
    " " +
    selectedDateObj.toLocaleDateString(undefined, { month: "long" });

  useEffect(() => {
    addDrawer?.setDefaultDateForAdd(selectedDateKey);
    return () => addDrawer?.setDefaultDateForAdd(null);
  }, [selectedDateKey, addDrawer]);

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

  useEffect(() => {
    if (menuOpenId === null) return;
    const measure = () => {
      if (!menuRef.current || typeof window === "undefined") return;
      const rect = menuRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setMenuOpenUp(spaceBelow < MENU_ESTIMATED_HEIGHT);
    };
    const t = setTimeout(measure, 0);
    return () => clearTimeout(t);
  }, [menuOpenId]);

  const goPrevMonth = () => {
    setViewMonth((d) => {
      const next = new Date(d);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  };

  const goNextMonth = () => {
    setViewMonth((d) => {
      const next = new Date(d);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  };

  const openEdit = (todo: Todo) => {
    setMenuOpenId(null);
    setEditingTodo(todo);
    setEditTitle(todo.title);
  };

  const closeEdit = () => {
    setEditingTodo(null);
    setEditTitle("");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTodo) return;
    const trimmed = editTitle.trim() || "Untitled";
    updateTodoTitle(editingTodo.id, trimmed);
    closeEdit();
  };

  if (loading && todos.length === 0) {
    return (
      <div className="min-w-0 animate-page-load py-8 text-center text-gray-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col animate-page-load">
      {/* Top half: calendar (fixed height, 44px+ touch targets) */}
      <div className="flex shrink-0 flex-col border-b border-gray-100 bg-white pb-2 pt-2" style={{ height: "max(48dvh, 320px)" }}>
        <div className="mb-1 flex items-center justify-center gap-0.5 rounded-lg border border-gray-200 bg-gray-100/80 p-0.5">
          <button
            type="button"
            onClick={goPrevMonth}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-gray-600 hover:bg-gray-200/80 hover:text-gray-900 touch-manipulation"
            aria-label="Previous month"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="min-w-[7rem] px-2 py-1.5 text-center text-sm font-semibold text-gray-900">
            {monthLabel(viewMonth)}
          </span>
          <button
            type="button"
            onClick={goNextMonth}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-gray-600 hover:bg-gray-200/80 hover:text-gray-900 touch-manipulation"
            aria-label="Next month"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-px text-center text-[10px] font-medium text-gray-500">
          {weekdays.map((wd) => (
            <div key={wd} className="truncate py-0.5">{wd}</div>
          ))}
        </div>

        {/* 6 rows × 7 cols; each cell min 44px for touch (common mobile guideline) */}
        <div className="grid flex-1 grid-cols-7 grid-rows-6 gap-1 overflow-hidden">
          {grid.map((cell) => {
            const isToday = cell.dateKey === today;
            const isSelected = cell.dateKey === selectedDateKey;
            return (
              <button
                key={cell.dateKey}
                type="button"
                onClick={() => setSelectedDateKey(cell.dateKey)}
                className={`flex min-h-[44px] min-w-0 items-center justify-center rounded-lg text-sm transition-colors touch-manipulation active:scale-[0.97] ${
                  !cell.isCurrentMonth
                    ? "text-gray-300"
                    : isSelected
                      ? "bg-primary text-white font-semibold"
                      : isToday
                        ? "border-2 border-primary text-primary font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                }`}
                aria-label={`${cell.dayNum}${isSelected ? " selected" : ""}`}
                aria-pressed={isSelected}
              >
                {cell.dayNum}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom half: selected day label + task list (scrolls independently) */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="shrink-0 border-b border-gray-100 px-0 py-2">
          <h2 className="text-base font-semibold tracking-tight text-gray-900">
            {selectedLabel}
          </h2>
        </div>
        <ul className="space-y-2 pb-4 pt-1">
          {selectedTodos.length === 0 ? (
            <li className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-6 text-center text-sm text-gray-500">
              No tasks for this day. Tap + to add one.
            </li>
          ) : (
            selectedTodos.map((todo) => (
              <MonthTodoRow
                key={todo.id}
                todo={todo}
                menuRef={menuOpenId === todo.id || datePickTodoId === todo.id ? menuRef : undefined}
                menuOpen={menuOpenId === todo.id}
                menuOpenUp={menuOpenUp}
                datePickOpen={datePickTodoId === todo.id}
                onToggle={() => {
                  if (todo.completed) return;
                  toggleTodo(todo.id);
                }}
                onMarkIncomplete={() => toggleTodo(todo.id)}
                onOpenMenu={() => setMenuOpenId((id) => (id === todo.id ? null : todo.id))}
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
                onTogglePriority={(id, priority) => {
                  setMenuOpenId(null);
                  updateTodoPriority(id, priority);
                }}
                onDelete={() => {
                  setMenuOpenId(null);
                  deleteTodo(todo.id);
                }}
              />
            ))
          )}
        </ul>
      </div>

      {editingTodo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-4 px-5 sm:px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-todo-title-month"
        >
          <div
            className="w-full max-w-[430px] shrink-0 rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 pb-2">
              <h2 id="edit-todo-title-month" className="text-lg font-semibold text-gray-900">
                Edit todo
              </h2>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4 px-5 pb-8 pt-2">
              <div>
                <label htmlFor="edit-todo-input-month" className="sr-only">
                  Title
                </label>
                <input
                  id="edit-todo-input-month"
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

function MonthTodoRow({
  todo,
  menuRef,
  menuOpen,
  menuOpenUp,
  datePickOpen,
  onToggle,
  onMarkIncomplete,
  onOpenMenu,
  onCloseMenu,
  onEdit,
  onMovePrev,
  onMoveNext,
  onOpenDatePick,
  onDateChange,
  onTogglePriority,
  onDelete,
}: {
  todo: Todo;
  menuRef: React.RefObject<HTMLDivElement | null> | undefined;
  menuOpen: boolean;
  menuOpenUp: boolean;
  datePickOpen: boolean;
  onToggle: () => void;
  onMarkIncomplete: () => void;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
  onEdit: () => void;
  onMovePrev: () => void;
  onMoveNext: () => void;
  onOpenDatePick: () => void;
  onDateChange: (dateKey: string) => void;
  onTogglePriority: (id: string, priority: boolean) => void;
  onDelete: () => void;
}) {
  return (
    <li
      className={`flex items-center gap-2 rounded-xl border px-3 py-2 shadow-sm ${
        todo.completed
          ? "border-green-400/70 bg-green-50/70"
          : todo.priority
            ? "border-amber-400/90 bg-amber-100/80"
            : "border-gray-200 bg-white"
      } ${todo.completed ? "cursor-default" : "cursor-pointer"}`}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button, [role='menu']")) return;
        if (todo.completed) return;
        onToggle();
      }}
    >
      <span
        className={`min-w-0 flex-1 text-[15px] font-medium leading-snug ${
          todo.completed ? "text-green-700 line-through opacity-90" : "text-gray-900"
        }`}
      >
        {todo.title}
      </span>
      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenMenu();
          }}
          onClick={(e) => {
            e.stopPropagation();
            onOpenMenu();
          }}
          className="flex min-h-[52px] min-w-[52px] shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 touch-manipulation"
          aria-label="More actions"
          aria-expanded={menuOpen}
          aria-haspopup="true"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
        {menuOpen && (
          <div
            className={`absolute right-0 z-10 min-w-[140px] rounded-xl border border-gray-200 bg-white py-1 shadow-lg ${
              menuOpenUp ? "bottom-full mb-1" : "top-full mt-1"
            }`}
            role="menu"
          >
            {todo.completed && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onMarkIncomplete();
                  onCloseMenu();
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Mark incomplete
              </button>
            )}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onCloseMenu();
                onTogglePriority(todo.id, !todo.priority);
              }}
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
              onClick={() => {
                onCloseMenu();
                onEdit();
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            {!todo.completed && (
              <>
                <button
                  type="button"
                  role="menuitem"
                  onClick={onMovePrev}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={onMoveNext}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Next
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={onOpenDatePick}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Date…
                </button>
              </>
            )}
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
        {datePickOpen && (
          <div
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
