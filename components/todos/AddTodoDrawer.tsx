"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { useTodos } from "@/hooks/useTodos";
import { useLockBodyScrollForKeyboard } from "@/hooks/useLockBodyScrollForKeyboard";
import { todayKey, dateKey, dayNameFromDate, formatDateDDMMMFromDate } from "@/lib/todos";
import { useDashboardPathname } from "@/components/layout/DashboardPathnameContext";

const today = new Date();
today.setHours(0, 0, 0, 0);
const endMonth = new Date(today);
endMonth.setDate(endMonth.getDate() + 365);

type AddTodoDrawerProps = {
  open: boolean;
  onClose: () => void;
  userId: string;
  next: string | null;
  /** When set (e.g. from Calendar), skip "When?" and add todo to this date. */
  defaultDate: string | null;
};

export function AddTodoDrawer({ open, onClose, userId, next, defaultDate }: AddTodoDrawerProps) {
  const { addTodo } = useTodos(userId);
  const pathnameCtx = useDashboardPathname();
  const { lockBodyScroll, unlockBodyScroll } = useLockBodyScrollForKeyboard();
  const [title, setTitle] = useState("");
  const [useToday, setUseToday] = useState(true);
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedDateObj = selectedDate
    ? (() => {
        const [y, m, d] = selectedDate.split("-").map(Number);
        return new Date(y, (m ?? 1) - 1, d ?? 1);
      })()
    : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    setSubmitting(true);
    try {
      const date = defaultDate ?? (useToday ? todayKey() : selectedDate);
      await addTodo(t, date);
      setTitle("");
      setUseToday(true);
      setSelectedDate(todayKey());
      setDatePickerOpen(false);
      onClose();
      if (next && pathnameCtx?.setPathname) pathnameCtx.setPathname(next);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    unlockBodyScroll();
    setTitle("");
    setUseToday(true);
    setSelectedDate(todayKey());
    setDatePickerOpen(false);
    onClose();
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (open) {
      setMounted(false);
      const id = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(id);
    }
    setMounted(false);
    unlockBodyScroll();
  }, [open, unlockBodyScroll]);

  if (!open) return null;

  const overlay = (
    <div
      className={`fixed inset-0 bg-black/70 transition-opacity duration-300 ease-out ${mounted ? "opacity-100" : "opacity-0"}`}
      style={{ zIndex: 9998 }}
      aria-hidden
      onClick={handleClose}
    />
  );

  const panel = (
    <div
      className="fixed inset-x-0 bottom-0 max-h-[85dvh] rounded-t-2xl bg-white shadow-xl transition-transform duration-300 ease-out safe-area-b"
      style={{
        zIndex: 9999,
        transform: mounted ? "translateY(0)" : "translateY(100%)",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-todo-drawer-title"
    >
        <div className="flex flex-col max-h-[85dvh]">
          <div className="shrink-0 flex justify-center pt-2 pb-1">
            <div className="h-1 w-10 rounded-full bg-gray-300" aria-hidden />
          </div>
          <div className="shrink-0 px-4 pb-2">
            <h2 id="add-todo-drawer-title" className="text-lg font-semibold text-gray-900">
              New todo
            </h2>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-6"
          >
            <div>
              <label htmlFor="drawer-title" className="mb-1 block text-sm font-medium text-gray-700">
                What to do?
              </label>
              <input
                id="drawer-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onFocus={lockBodyScroll}
                onBlur={unlockBodyScroll}
                placeholder="e.g. Buy groceries"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            {!defaultDate && (
            <div>
              <span className="mb-2 block text-sm font-medium text-gray-700">
                When?
              </span>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
                  <input
                    type="radio"
                    name="drawer-when"
                    checked={useToday}
                    onChange={() => {
                      setUseToday(true);
                      setDatePickerOpen(false);
                    }}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-900">Today</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
                  <input
                    type="radio"
                    name="drawer-when"
                    checked={!useToday}
                    onChange={() => {
                      setUseToday(false);
                      setDatePickerOpen(true);
                    }}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-900">Select a date</span>
                </label>
                {!useToday && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setDatePickerOpen((v) => !v)}
                      className="flex w-full items-center justify-between rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-3 text-left text-sm hover:bg-blue-100/80 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-expanded={datePickerOpen}
                    >
                      <span>
                        {dayNameFromDate(selectedDateObj ?? today)},{" "}
                        {formatDateDDMMMFromDate(selectedDateObj ?? today)}
                      </span>
                      <span className="text-blue-700">{datePickerOpen ? "Close" : "Change"}</span>
                    </button>
                    {datePickerOpen && (
                      <div className="create-todo-calendar min-w-0 w-full max-w-full overflow-hidden rounded-xl border border-gray-200 bg-white p-3 [&_.rdp-root]:mx-0">
                        <DayPicker
                          mode="single"
                          weekStartsOn={0}
                          selected={selectedDateObj}
                          onSelect={(d) => {
                            if (!d) return;
                            setSelectedDate(dateKey(d));
                            setDatePickerOpen(false);
                          }}
                          startMonth={today}
                          endMonth={endMonth}
                          disabled={{ before: today }}
                          defaultMonth={selectedDateObj ?? today}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            )}
            <div className="mt-auto flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !title.trim()}
                className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {submitting ? "Adding…" : "Add todo"}
              </button>
            </div>
          </form>
        </div>
      </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(
    <>
      {overlay}
      {panel}
    </>,
    document.body
  );
}
