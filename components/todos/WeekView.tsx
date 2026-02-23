"use client";

import { useState, useRef, useEffect } from "react";
import { useTodos } from "@/hooks/useTodos";
import { useWeekStartsOn } from "@/hooks/useWeekStartsOn";
import { weekDatesForWeek, todayKey } from "@/lib/todos";

type WeekViewProps = { userId: string | undefined | null };

export function WeekView({ userId }: WeekViewProps) {
  const { getByDate, toggleTodo, todos, loading } = useTodos(userId);
  const [weekStartsOn] = useWeekStartsOn();
  const days = weekDatesForWeek(weekStartsOn);
  const [layout, setLayout] = useState<"vertical" | "horizontal">("vertical");
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (
      layout === "horizontal" &&
      todayRef.current &&
      horizontalScrollRef.current
    ) {
      todayRef.current.scrollIntoView({
        inline: "start",
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [layout, days]);

  if (loading && todos.length === 0) {
    return (
      <div className="animate-page-load py-8 text-center text-gray-500">
        Loading…
      </div>
    );
  }

  const today = todayKey();
  const dayBlocks = days.map(({ dateKey, label, dayName }, index) => {
    const isToday = dateKey === today;
    const dayTodos = getByDate(dateKey);
    return (
      <section
        key={dateKey}
        ref={isToday ? todayRef : undefined}
        className={`min-h-0 shrink-0 rounded-2xl border bg-white/80 p-4 shadow-sm ${
          isToday ? "border-blue-500/60" : "border-gray-300"
        } ${
          layout === "horizontal"
            ? "min-w-[370px] w-[340px] snap-start"
            : "min-w-[200px]"
        }`}
      >
        <h2
          className={`mb-4 text-base font-bold tracking-tight ${
            isToday ? "text-blue-600" : "text-gray-700"
          }`}
        >
          {isToday ? "Today" : `${dayName} · ${label}`}
        </h2>
        <ul className="space-y-4">
          {dayTodos.length === 0 ? (
            <li className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 py-4 text-center text-sm text-gray-500">
              No todos
            </li>
          ) : (
            dayTodos
              .slice()
              .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
              .map((todo) => (
                <li
                  key={todo.id}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-sm transition-shadow ${
                    todo.completed
                      ? "border border-green-400/70 bg-green-50/70"
                      : "border border-gray-200/80 bg-white"
                  }`}
                >
                  <span
                    className={`min-w-0 flex-1 text-[15px] font-medium leading-snug ${
                      todo.completed
                        ? "text-green-700 line-through opacity-90"
                        : "text-gray-900"
                    }`}
                  >
                    {todo.title}
                  </span>
                  <label className="shrink-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className={`h-5 w-5 rounded-md border-gray-300 focus:ring-2 focus:ring-offset-0 ${
                        todo.completed
                          ? "accent-green-600"
                          : "accent-blue-600 focus:ring-blue-500"
                      }`}
                    />
                  </label>
                </li>
              ))
          )}
        </ul>
      </section>
    );
  });

  return (
    <div className="min-w-0 animate-page-load">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">This week</h1>
      <p className="mb-2 text-sm text-gray-500">
        {layout === "vertical"
          ? "Scroll down to see all 7 days"
          : "Scroll sideways to see all 7 days"}
      </p>
      <div className="mb-4 flex w-full gap-2">
        <button
          type="button"
          onClick={() => setLayout("vertical")}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium ${
            layout === "vertical"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Vertical
        </button>
        <button
          type="button"
          onClick={() => setLayout("horizontal")}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium ${
            layout === "horizontal"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Horizontal
        </button>
      </div>
      {layout === "vertical" ? (
        <div className="flex flex-col gap-6 overflow-y-auto">{dayBlocks}</div>
      ) : (
        <div
          ref={horizontalScrollRef}
          className="w-full min-w-0 overflow-x-auto overflow-y-hidden px-4 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex gap-4">{dayBlocks}</div>
        </div>
      )}
    </div>
  );
}
