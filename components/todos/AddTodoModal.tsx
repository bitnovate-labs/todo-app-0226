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
  const [time, setTime] = useState("");
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
      await addTodo(t, date, false, time.trim() || null);
      setTitle("");
      setTime("");
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
    setTime("");
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
      className="fixed inset-0 z-[9998] bg-overlay"
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
        className="safe-area-b flex max-h-[90dvh] w-full min-w-0 max-w-[430px] flex-col overflow-hidden rounded-2xl border border-border bg-surface text-fg shadow-popover"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 px-4 pb-2 pt-4">
          <h2 id="add-todo-modal-title" className="text-lg font-semibold text-fg">
            New todo
          </h2>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto px-4 pb-6"
        >
          <div>
            <label htmlFor="modal-title" className="mb-1 block text-sm font-medium text-fg-muted">
              What to do?
            </label>
            <input
              ref={inputRef}
              id="modal-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Buy groceries"
              className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-fg placeholder:text-fg-subtle focus:border-border-strong focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary-focus/25"
              required
              autoComplete="off"
            />
          </div>
          <div className="min-w-0 max-w-full">
            <label htmlFor="modal-time" className="mb-1 block text-sm font-medium text-fg-muted">
              Time <span className="font-normal text-fg-subtle">(optional)</span>
            </label>
            <input
              id="modal-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="box-border block w-full max-w-full min-w-0 rounded-xl border border-border bg-muted px-4 py-3 text-fg focus:border-border-strong focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary-focus/25"
            />
          </div>
          {!defaultDate && (
            <div>
              <span className="mb-2 block text-sm font-medium text-fg-muted">
                When?
              </span>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-muted px-4 py-3 has-[input:checked]:border-primary/40 has-[input:checked]:bg-accent-soft">
                  <input
                    type="radio"
                    name="modal-when"
                    checked={useToday}
                    onChange={() => {
                      setUseToday(true);
                      setDatePickerOpen(false);
                    }}
                    className="h-4 w-4 border-border text-primary focus:ring-primary-focus"
                  />
                  <span className="text-fg">Today</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-muted px-4 py-3 has-[input:checked]:border-primary/40 has-[input:checked]:bg-accent-soft">
                  <input
                    type="radio"
                    name="modal-when"
                    checked={!useToday}
                    onChange={() => {
                      setUseToday(false);
                      setDatePickerOpen(true);
                    }}
                    className="h-4 w-4 border-border text-primary focus:ring-primary-focus"
                  />
                  <span className="text-fg">Select a date</span>
                </label>
                {!useToday && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setDatePickerOpen((v) => !v)}
                      className="flex w-full items-center justify-between rounded-xl border border-primary/35 bg-accent-soft px-4 py-3 text-left text-sm text-fg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary-focus/30"
                      aria-expanded={datePickerOpen}
                    >
                      <span>
                        {dayNameFromDate(selectedDateObj ?? today)},{" "}
                        {formatDateDDMMMFromDate(selectedDateObj ?? today)}
                      </span>
                      <span className="font-medium text-primary">{datePickerOpen ? "Close" : "Change"}</span>
                    </button>
                    {datePickerOpen && (
                      <div
                        ref={datePickerRef}
                        className="create-todo-calendar min-w-0 w-full max-w-full overflow-hidden rounded-xl border border-border bg-elevated p-3 text-fg [&_.rdp-root]:mx-0"
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
              className="flex-1 rounded-xl border border-border py-3 text-sm font-medium text-fg transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary-focus focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50"
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
