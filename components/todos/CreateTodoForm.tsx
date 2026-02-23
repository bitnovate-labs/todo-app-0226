"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTodos } from "@/hooks/useTodos";
import { todayKey } from "@/lib/todos";

type CreateTodoFormProps = { userId: string | undefined | null };

export function CreateTodoForm({ userId }: CreateTodoFormProps) {
  const router = useRouter();
  const { addTodo, mounted } = useTodos(userId);
  const [title, setTitle] = useState("");
  const [useToday, setUseToday] = useState(true);
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t || !mounted) return;
    setSubmitting(true);
    try {
      const date = useToday ? todayKey() : selectedDate;
      await addTodo(t, date);
      setTitle("");
      router.push("/");
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="animate-page-load py-8 text-center text-gray-500">
        Loading…
      </div>
    );
  }

  const todayStr = todayKey();
  const minDate = todayStr;
  const maxDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 365);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  })();

  return (
    <div className="min-w-0">
      <div className="mb-6 flex items-center gap-2">
        <Link
          href="/"
          className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Back"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New todo</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
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
        <div>
          <span className="mb-2 block text-sm font-medium text-gray-700">When?</span>
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
              <input
                type="radio"
                name="when"
                checked={useToday}
                onChange={() => setUseToday(true)}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-900">Today (default)</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
              <input
                type="radio"
                name="when"
                checked={!useToday}
                onChange={() => setUseToday(false)}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-900">Select a date</span>
            </label>
            {!useToday && (
              <div className="pl-7">
                <input
                  type="date"
                  value={selectedDate}
                  min={minDate}
                  max={maxDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>
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
