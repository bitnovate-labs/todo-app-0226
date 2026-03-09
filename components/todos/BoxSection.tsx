"use client";

import React, { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { useTodos } from "@/hooks/useTodos";
import type { Todo } from "@/lib/todos";
import { todayKey, dateKey } from "@/lib/todos";

const MENU_ESTIMATED_HEIGHT = 120;

type BoxRowProps = {
  todo: Todo;
  menuRef: React.RefObject<HTMLDivElement | null> | undefined;
  scheduleRef: React.RefObject<HTMLDivElement | null> | undefined;
  menuOpen: boolean;
  menuOpenUp: boolean;
  scheduleOpen: boolean;
  schedulePickerOpen: boolean;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
  onOpenSchedule: () => void;
  onCloseSchedule: () => void;
  onOpenDatePicker: () => void;
  onEdit: () => void;
  onScheduleToday: () => void;
  onScheduleDate: (dateKey: string) => void;
  onDelete: () => void;
};

const today = new Date();
today.setHours(0, 0, 0, 0);
const endMonth = new Date(today);
endMonth.setDate(endMonth.getDate() + 365);

function BoxRow({
  todo,
  menuRef,
  scheduleRef,
  menuOpen,
  menuOpenUp,
  scheduleOpen,
  schedulePickerOpen,
  onOpenMenu,
  onCloseMenu,
  onOpenSchedule,
  onCloseSchedule,
  onOpenDatePicker,
  onEdit,
  onScheduleToday,
  onScheduleDate,
  onDelete,
}: BoxRowProps) {

  return (
    <li className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white py-2 pl-3 pr-1 shadow-sm">
      <span className="min-w-0 flex-1 text-gray-900">{todo.title}</span>
      <div className="relative shrink-0 flex items-center">
        {/* + Schedule button */}
        <div className="relative" ref={scheduleRef}>
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (scheduleOpen) onCloseSchedule();
              else onOpenSchedule();
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center text-blue-600 touch-manipulation"
            aria-label="Schedule"
            aria-expanded={scheduleOpen}
            aria-haspopup="true"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          {scheduleOpen && (
            <div
              className={`absolute right-0 top-full z-20 mt-1 rounded-xl border border-gray-200 bg-white py-1 shadow-lg ${schedulePickerOpen ? "min-w-[280px] p-2" : "min-w-[200px]"}`}
              role="dialog"
              aria-label="When?"
            >
              {!schedulePickerOpen ? (
                <>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      onScheduleToday();
                      onCloseSchedule();
                    }}
                  >
                    <span className="font-medium">Today</span>
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onOpenDatePicker();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onOpenDatePicker();
                    }}
                  >
                    <span className="font-medium">Select a date</span>
                  </button>
                </>
              ) : (
                <div className="create-todo-calendar min-w-0 w-full max-w-full overflow-hidden rounded-lg p-2 [&_.rdp-root]:mx-0">
                  <DayPicker
                    mode="single"
                    weekStartsOn={0}
                    onSelect={(d) => {
                      if (!d) return;
                      onScheduleDate(dateKey(d));
                      onCloseSchedule();
                    }}
                    startMonth={today}
                    endMonth={endMonth}
                    disabled={{ before: today }}
                    defaultMonth={today}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        {/* ⋮ Menu button */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenMenu();
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 touch-manipulation"
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
              className={`absolute right-0 z-10 min-w-[140px] rounded-xl border border-gray-200 bg-white py-1 shadow-lg ${menuOpenUp ? "bottom-full mb-1" : "top-full mt-1"}`}
              role="menu"
            >
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
      </div>
    </li>
  );
}

type BoxSectionProps = { userId: string | undefined | null };

export function BoxSection({ userId }: BoxSectionProps) {
  const {
    getBoxTodos,
    addTodo,
    deleteTodo,
    updateTodoTitle,
    updateTodoDate,
    mounted,
  } = useTodos(userId);
  const [quickAdd, setQuickAdd] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [menuOpenUp, setMenuOpenUp] = useState(false);
  const [scheduleOpenId, setScheduleOpenId] = useState<string | null>(null);
  const [schedulePickerOpen, setSchedulePickerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const scheduleRef = useRef<HTMLDivElement>(null);

  const boxTodos = getBoxTodos();

  useEffect(() => {
    if (menuOpenId === null && scheduleOpenId === null) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const inMenu = menuRef.current?.contains(target);
      const inSchedule = scheduleRef.current?.contains(target);
      if (!inMenu && !inSchedule) {
        setMenuOpenId(null);
        setScheduleOpenId(null);
        setSchedulePickerOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpenId, scheduleOpenId]);

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

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = quickAdd.trim();
    if (!t || adding || !userId) return;
    setAdding(true);
    try {
      await addTodo(t, null);
      setQuickAdd("");
    } finally {
      setAdding(false);
    }
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

  return (
    <section className="pt-6">
      <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-10 -mt-8 shrink-0 bg-white pb-2 pt-4">
        <h2 className="mb-0.5 text-lg font-semibold tracking-tight text-gray-900">Box</h2>
        <p className="mb-3 text-sm text-gray-500">Jot it down. Add a date when you’re ready.</p>
        <form onSubmit={handleQuickAdd} className="flex gap-2">
          <input
            type="text"
            value={quickAdd}
            onChange={(e) => setQuickAdd(e.target.value)}
            placeholder="Quick add…"
            disabled={!mounted}
            className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-2.5 text-[15px] text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-label="Add to Box"
          />
          <button
            type="submit"
            disabled={!quickAdd.trim() || adding || !mounted}
            className="shrink-0 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {adding ? "…" : "Add"}
          </button>
        </form>
      </div>
      <ul className="mt-2 space-y-3">
        {boxTodos.length === 0 ? (
          <li className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-6 text-center text-sm text-gray-500">
            Nothing in Box yet. Type above to capture tasks and schedule them later.
          </li>
        ) : (
          boxTodos.map((todo) => (
            <BoxRow
              key={todo.id}
              todo={todo}
              menuRef={menuOpenId === todo.id ? menuRef : undefined}
              scheduleRef={scheduleOpenId === todo.id ? scheduleRef : undefined}
              menuOpen={menuOpenId === todo.id}
              menuOpenUp={menuOpenUp}
              scheduleOpen={scheduleOpenId === todo.id}
              schedulePickerOpen={scheduleOpenId === todo.id && schedulePickerOpen}
              onOpenMenu={() => setMenuOpenId((id) => (id === todo.id ? null : todo.id))}
              onCloseMenu={() => setMenuOpenId(null)}
              onOpenSchedule={() => {
                setScheduleOpenId((id) => (id === todo.id ? null : todo.id));
                setSchedulePickerOpen(false);
              }}
              onCloseSchedule={() => {
                setScheduleOpenId(null);
                setSchedulePickerOpen(false);
              }}
              onOpenDatePicker={() => setSchedulePickerOpen(true)}
              onEdit={() => openEdit(todo)}
              onScheduleToday={() => updateTodoDate(todo.id, todayKey())}
              onScheduleDate={(next) => {
                updateTodoDate(todo.id, next);
                setScheduleOpenId(null);
                setSchedulePickerOpen(false);
              }}
              onDelete={() => {
                setMenuOpenId(null);
                deleteTodo(todo.id);
              }}
            />
          ))
        )}
      </ul>

      {editingTodo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-4 px-5 sm:px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-box-todo-title"
        >
          <div
            className="w-full max-w-[430px] shrink-0 rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 pb-2">
              <h2 id="edit-box-todo-title" className="text-lg font-semibold text-gray-900">
                Edit todo
              </h2>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4 px-5 pb-8 pt-2">
              <div>
                <label htmlFor="edit-box-todo-input" className="sr-only">
                  Title
                </label>
                <input
                  id="edit-box-todo-input"
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
          <button type="button" aria-label="Close" className="absolute inset-0 -z-10" onClick={closeEdit} />
        </div>
      )}
    </section>
  );
}
