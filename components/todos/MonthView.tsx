"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  MoreVertical,
  Undo2,
  ArrowUp,
  Pencil,
  Calendar,
  Trash2,
} from "lucide-react";
import { useTodos } from "@/hooks/useTodos";
import { useAddDrawer } from "@/components/layout/AddDrawerContext";
import { useListFontSize, LIST_FONT_SIZE_CLASSES } from "@/hooks/useListFontSize";
import { useWeekStartsOn } from "@/hooks/useWeekStartsOn";
import {
  todayKey,
  dayNameFromDate,
  getMonthCalendarGrid,
  monthLabel,
  addDaysToDateKey,
  type Todo,
} from "@/lib/todos";
import { TodoActionsModal } from "@/components/ui/TodoActionsModal";

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_MONDAY_FIRST = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const actionBtn = "flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 min-h-[44px] touch-manipulation";
const actionBtnDanger = "flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 min-h-[44px] touch-manipulation";

type MonthViewProps = { userId: string | undefined | null };

export function MonthView({ userId }: MonthViewProps) {
  const addDrawer = useAddDrawer();
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
  const today = todayKey();
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(1);
    return d;
  });
  const [selectedDateKey, setSelectedDateKey] = useState(today);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [datePickTodoId, setDatePickTodoId] = useState<string | null>(null);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const datePickRef = useRef<HTMLDivElement>(null);

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

  // Only allow adding new todos for today or future; don't pass past dates to the add modal
  const canAddForSelectedDate = selectedDateKey >= today;
  useEffect(() => {
    addDrawer?.setDefaultDateForAdd(canAddForSelectedDate ? selectedDateKey : null);
    return () => addDrawer?.setDefaultDateForAdd(null);
  }, [selectedDateKey, canAddForSelectedDate, addDrawer]);

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
            <ChevronLeft className="h-5 w-5" />
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
            <ChevronRight className="h-5 w-5" />
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
                datePickOpen={datePickTodoId === todo.id}
                datePickRef={datePickTodoId === todo.id ? datePickRef : undefined}
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
                listFontSizeClass={listFontSizeClass}
              />
            ))
          )}
        </ul>
      </div>

      {menuOpenId && (() => {
        const todo = selectedTodos.find((t) => t.id === menuOpenId);
        if (!todo) return null;
        return (
          <TodoActionsModal open={true} onClose={() => setMenuOpenId(null)} title={todo.title}>
            {todo.completed && (
              <button type="button" className={actionBtn} onClick={() => { toggleTodo(todo.id); setMenuOpenId(null); }}>
                <Undo2 className="h-4 w-4 text-gray-400 shrink-0" /> Mark incomplete
              </button>
            )}
            <button type="button" className={actionBtn} onClick={() => { updateTodoPriority(todo.id, !todo.priority); setMenuOpenId(null); }}>
              {todo.priority ? <><Check className="h-4 w-4 text-amber-700 shrink-0" /> Not priority</> : <><ArrowUp className="h-4 w-4 text-gray-400 shrink-0" /> Priority</>}
            </button>
            <button type="button" className={actionBtn} onClick={() => { setMenuOpenId(null); openEdit(todo); }}>
              <Pencil className="h-4 w-4 text-gray-400 shrink-0" /> Edit
            </button>
            {!todo.completed && (
              <>
                <button type="button" className={actionBtn} onClick={() => { setMenuOpenId(null); if (todo.date) updateTodoDate(todo.id, addDaysToDateKey(todo.date, -1)); }}>
                  <ChevronLeft className="h-4 w-4 text-gray-400 shrink-0" /> Previous
                </button>
                <button type="button" className={actionBtn} onClick={() => { setMenuOpenId(null); if (todo.date) updateTodoDate(todo.id, addDaysToDateKey(todo.date, 1)); }}>
                  <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" /> Next
                </button>
                <button type="button" className={actionBtn} onClick={() => { setMenuOpenId(null); setDatePickTodoId(todo.id); }}>
                  <Calendar className="h-4 w-4 text-gray-400 shrink-0" /> Date…
                </button>
              </>
            )}
            <button type="button" className={actionBtnDanger} onClick={() => { setMenuOpenId(null); deleteTodo(todo.id); }}>
              <Trash2 className="h-4 w-4 shrink-0" /> Delete
            </button>
          </TodoActionsModal>
        );
      })()}

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
  datePickOpen,
  datePickRef,
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
  listFontSizeClass,
}: {
  todo: Todo;
  datePickOpen: boolean;
  datePickRef?: React.RefObject<HTMLDivElement | null>;
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
  listFontSizeClass: string;
}) {
  return (
    <li
      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 shadow-md ${
        todo.completed
          ? "bg-green-50/70"
          : todo.priority
            ? "bg-amber-100/80"
            : "bg-white"
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            todo.completed ? onMarkIncomplete() : onToggle();
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
            todo.completed ? "text-green-700 line-through opacity-90" : "text-gray-900"
          }`}
        >
          {todo.title}
        </span>
      </div>
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpenMenu(); }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 touch-manipulation"
          aria-label="More actions"
          aria-haspopup="dialog"
        >
          <MoreVertical className="h-5 w-5" />
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
