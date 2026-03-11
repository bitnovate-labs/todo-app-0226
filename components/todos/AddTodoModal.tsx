"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { useTodos } from "@/hooks/useTodos";
import { todayKey, dateKey, dayNameFromDate, formatDateDDMMMFromDate } from "@/lib/todos";
import { useDashboardPathname } from "@/components/layout/DashboardPathnameContext";

const today = new Date();
today.setHours(0, 0, 0, 0);
const endMonth = new Date(today);
endMonth.setDate(endMonth.getDate() + 365);

type AddTodoModalProps = {
  open: boolean;
  onClose: () => void;
  userId: string;
  next: string | null;
  /** When set (e.g. from Calendar), skip "When?" and add todo to this date. */
  defaultDate: string | null;
};

export function AddTodoModal({ open, onClose, userId, next, defaultDate }: AddTodoModalProps) {
  const { addTodo } = useTodos(userId);
  const pathnameCtx = useDashboardPathname();
  const [title, setTitle] = useState("");
  const [useToday, setUseToday] = useState(true);
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

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
    setTitle("");
    setUseToday(true);
    setSelectedDate(todayKey());
    setDatePickerOpen(false);
    onClose();
  };

  // Keep input visible when keyboard opens: scroll it into view inside the modal
  useEffect(() => {
    if (!open) return;
    const input = inputRef.current;
    if (!input) return;
    const onFocus = () => {
      requestAnimationFrame(() => {
        input.scrollIntoView({ block: "nearest", behavior: "smooth" });
      });
    };
    input.addEventListener("focus", onFocus);
    return () => input.removeEventListener("focus", onFocus);
  }, [open]);

  // When date picker opens, shift view so the calendar is shown in full height
  useEffect(() => {
    if (!open || !datePickerOpen) return;
    const el = datePickerRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      el.scrollIntoView({ block: "start", behavior: "smooth" });
    });
    return () => cancelAnimationFrame(id);
  }, [open, datePickerOpen]);

  if (!open) return null;

  const overlay = (
    <div
      className="fixed inset-0 z-[9998] bg-black/60"
      aria-hidden
      onClick={handleClose}
    />
  );

  const dialog = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-todo-modal-title"
    >
      <div
        className="w-full max-w-[430px] max-h-[90dvh] flex flex-col rounded-2xl bg-white shadow-xl safe-area-b"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 px-4 pt-4 pb-2">
          <h2 id="add-todo-modal-title" className="text-lg font-semibold text-gray-900">
            New todo
          </h2>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-6"
        >
          <div>
            <label htmlFor="modal-title" className="mb-1 block text-sm font-medium text-gray-700">
              What to do?
            </label>
            <input
              ref={inputRef}
              id="modal-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Buy groceries"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
              autoComplete="off"
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
                    name="modal-when"
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
                    name="modal-when"
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
                      <div
                        ref={datePickerRef}
                        className="create-todo-calendar min-w-0 w-full max-w-full overflow-hidden rounded-xl border border-gray-200 bg-white p-3 [&_.rdp-root]:mx-0"
                      >
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
      {dialog}
    </>,
    document.body
  );
}
