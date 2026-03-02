"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { useTodos } from "@/hooks/useTodos";
import { todayKey, dateKey, dayNameFromDate, formatDateDDMMMFromDate } from "@/lib/todos";

type CreateTodoFormProps = { userId: string | undefined | null };

export function CreateTodoForm({ userId }: CreateTodoFormProps) {
  const router = useRouter();
  const { addTodo } = useTodos(userId);
  const [title, setTitle] = useState("");
  const [useToday, setUseToday] = useState(true);
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [priority, setPriority] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    setSubmitting(true);
    try {
      const date = useToday ? todayKey() : selectedDate;
      await addTodo(t, date, priority);
      setTitle("");
      router.push("/");
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endMonth = new Date(today);
  endMonth.setDate(endMonth.getDate() + 365);

  const selectedDateObj = selectedDate
    ? (() => {
        const [y, m, d] = selectedDate.split("-").map(Number);
        return new Date(y, (m ?? 1) - 1, d ?? 1);
      })()
    : undefined;

  return (
    <div className="min-w-0">
      <div className="mb-6 flex items-center gap-2">
        <Link
          href="/"
          className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Back"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900">
          New todo
        </h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="title"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            What to do?
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Buy groceries"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
            required
          />
        </div>
        <div className="min-w-0">
          <span className="mb-2 block text-sm font-medium text-gray-700">
            When?
          </span>
          <div className="space-y-3 min-w-0">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
              <input
                type="radio"
                name="when"
                checked={useToday}
                onChange={() => {
                  setUseToday(true);
                  setDatePickerOpen(false);
                }}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-900">Today (default)</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
              <input
                type="radio"
                name="when"
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
              <div className="space-y-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setDatePickerOpen((v) => !v)}
                  className="flex w-full items-center justify-between rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-3 text-left transition-colors hover:bg-blue-100/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-expanded={datePickerOpen}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-blue-900">
                      {dayNameFromDate(selectedDateObj ?? today)},{" "}
                      {formatDateDDMMMFromDate(selectedDateObj ?? today)}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-medium text-blue-700">
                    {datePickerOpen ? "Close" : "Change"}
                  </span>
                </button>

                {datePickerOpen && (
                  <div className="create-todo-calendar min-w-0 w-full max-w-full overflow-hidden rounded-xl border border-gray-300 bg-white p-4 [&_.rdp-root]:mx-0">
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
        <label
          htmlFor="priority"
          className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors touch-manipulation ${
            priority
              ? "border-amber-400/90 bg-amber-100/80"
              : "border-gray-200 bg-white"
          }`}
        >
          <input
            id="priority"
            type="checkbox"
            checked={priority}
            onChange={(e) => setPriority(e.target.checked)}
            className="sr-only"
          />
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${
              priority
                ? "border-amber-600 bg-amber-600"
                : "border-gray-300 bg-white"
            }`}
            aria-hidden
          >
            {priority && (
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </span>
          <span className="text-sm font-medium text-gray-900">Priority?</span>
        </label>
        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="w-full rounded-xl bg-blue-600 py-3 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {submitting ? "Adding…" : "Add todo"}
        </button>
      </form>
    </div>
  );
}
